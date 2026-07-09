const path = require("path");
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  AttachmentBuilder,
  SlashCommandBuilder,
} = require("discord.js");
const { safeEdit } = require("../utils/safeEdit");

const activeCourts = new Map();

function randomRoll() {
  return Math.floor(Math.random() * 36) + 15;
}

function lastTwo(arr) {
  return arr.slice(-2).join("\n") || "No actions yet.";
}

function lastN(arr, n) {
  return arr.slice(-n).join("\n") || "No previous cases.";
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomLine(lines, ...args) {
  const fn = lines[Math.floor(Math.random() * lines.length)];
  return fn(...args);
}

const ACCUSE_LINES = [
  (a, roll) => `📢 ${a} slams a folder of evidence on the table (+${roll} Case Strength)`,
  (a, roll) => `📢 ${a} points dramatically at the defendant (+${roll} Case Strength)`,
  (a, roll) => `📢 ${a} produces a surprise witness (+${roll} Case Strength)`,
  (a, roll) => `📢 ${a} reads a damning testimony aloud (+${roll} Case Strength)`,
  (a, roll) => `📢 ${a} presents photographic evidence (+${roll} Case Strength)`,
  (a, roll) => `📢 ${a} cross-examines with brutal precision (+${roll} Case Strength)`,
  (a, roll) => `📢 ${a} delivers a fiery closing statement (+${roll} Case Strength)`,
  (a, roll) => `📢 ${a} waves a signed confession in the air (+${roll} Case Strength)`,
  (a, roll) => `📢 ${a} plays a suspicious voicemail recording (+${roll} Case Strength)`,
  (a, roll) => `📢 ${a} unveils a timeline that doesn't add up (+${roll} Case Strength)`,
];

const DEFEND_LINES = [
  (d, roll) => `🛡️ ${d} calmly refutes the claim (+${roll} Case Strength)`,
  (d, roll) => `🛡️ ${d} produces an airtight alibi (+${roll} Case Strength)`,
  (d, roll) => `🛡️ ${d} objects and the point is sustained (+${roll} Case Strength)`,
  (d, roll) => `🛡️ ${d} discredits the accuser's witness (+${roll} Case Strength)`,
  (d, roll) => `🛡️ ${d} pokes holes in the timeline (+${roll} Case Strength)`,
  (d, roll) => `🛡️ ${d} pleads their case passionately (+${roll} Case Strength)`,
  (d, roll) => `🛡️ ${d} presents a rock-solid counter-argument (+${roll} Case Strength)`,
  (d, roll) => `🛡️ ${d} turns the jury's sympathy around (+${roll} Case Strength)`,
  (d, roll) => `🛡️ ${d} shows the evidence was tampered with (+${roll} Case Strength)`,
  (d, roll) => `🛡️ ${d} brings in a character witness (+${roll} Case Strength)`,
];

const GUILTY_INTROS = [
  "The gavel falls. The evidence was simply too damning to ignore.",
  "The jury deliberated for less than a minute. The verdict was never in doubt.",
  "Justice has spoken, and it is not merciful today.",
  "The courtroom falls silent as the verdict is read aloud.",
  "The scales of justice tip decisively — and not in the defendant's favor.",
];

const NOT_GUILTY_INTROS = [
  "The gavel falls. Reasonable doubt carries the day.",
  "The defense's arguments proved too compelling to overcome.",
  "The courtroom erupts in murmurs as the verdict is read aloud.",
  "Justice has spoken, and mercy prevails today.",
  "The scales of justice tip decisively — in the defendant's favor.",
];

const PUNISHMENT_LINES = [
  (loser, winner) =>
    `${loser} is sentenced to change their nickname to "${winner.displayName}'s Servant" for 24 hours.`,
  (loser, winner) =>
    `${loser} owes ${winner} one (1) heartfelt public apology, to be delivered within the hour.`,
  (loser, winner) =>
    `${loser} is sentenced to 50 pushups, enforced entirely on the honor system of the court.`,
  (loser, winner) =>
    `${loser} must communicate only in formal legalese for the next hour, so the court decrees.`,
  (loser, winner) =>
    `${loser} is banned from using the 💀 emoji for one week, by order of the court.`,
  (loser, winner) =>
    `${loser} must let ${winner} choose their next profile picture.`,
  (loser, winner) =>
    `${loser} is sentenced to community service: react with 👍 to ${winner}'s next five messages.`,
  (loser, winner) =>
    `${loser} must send a groveling apology GIF to the court within the hour.`,
  (loser, winner) =>
    `${loser} is fined one (1) sincere compliment, payable immediately to ${winner}.`,
  (loser, winner) =>
    `${loser} must refer to ${winner} as "Your Honor" for the remainder of the day.`,
];

const WITHDRAWAL_INTROS = [
  "A hush falls over the courtroom as the case is dropped without warning.",
  "The gavel never falls today — the case dissolves before a verdict can be reached.",
  "The bailiff clears the room. There will be no verdict, only silence.",
  "The court records the case as closed, the truth left forever undecided.",
  "The docket is struck. History will never know who was right.",
];

const WITHDRAWAL_LINES = [
  (w) => `${w} loses their nerve at the final hour and calls it off.`,
  (w) => `${w} decides the fight isn't worth it and drops the case.`,
  (w) => `${w} throws in the towel before the gavel can fall.`,
  (w) => `${w} quietly requests that all charges be dropped.`,
  (w) => `${w} concedes there's nothing left worth arguing.`,
  (w) => `${w} storms out, unwilling to see this through to the end.`,
  (w) => `${w} settles out of court, terms undisclosed.`,
];

function verdictFilename(guilty) {
  return guilty ? "guilty.png" : "notguilty.png";
}

function makeVerdictAttachment(guilty) {
  const filename = verdictFilename(guilty);
  const file = path.join(__dirname, "..", "assets", filename);
  return new AttachmentBuilder(file, { name: filename });
}

function createContext(source) {
  const isInteraction = !!source.commandName;

  if (isInteraction) {
    return {
      isInteraction: true,
      user: source.user,
      member: source.member,
      guild: source.guild,
      channel: source.channel,
      async ack() {
        if (!source.deferred && !source.replied) {
          await source.deferReply();
        }
      },
      async sendMain(payload) {
        if (source.deferred || source.replied) {
          return source.editReply(payload);
        }
        return source.reply(payload);
      },
    };
  }

  return {
    isInteraction: false,
    user: source.author,
    member: source.member,
    guild: source.guild,
    channel: source.channel,
    async ack() {},
    async sendMain(payload) {
      return source.reply(payload);
    },
  };
}

module.exports = {
  name: "court",
  aliases: ["wearehavingaretrial", "retrial"],

  data: new SlashCommandBuilder()
    .setName("court")
    .setDescription("Put someone on trial")
    .addUserOption((option) =>
      option.setName("defendant").setDescription("Who to put on trial").setRequired(true)
    ),

  async execute(message) {
    const ctx = createContext(message);
    return runCourt(ctx, message.mentions.members.first());
  },

  async executeInteraction(interaction) {
    const ctx = createContext(interaction);
    const defendantUser = interaction.options.getUser("defendant", true);
    const defendantMember =
      interaction.options.getMember("defendant") ||
      (await interaction.guild.members.fetch(defendantUser.id).catch(() => null));

    return runCourt(ctx, defendantMember);
  },
};

async function runCourt(ctx, defendant) {
  await ctx.ack();

  if (!defendant) {
    return ctx.sendMain("⚖️ Mention somebody to put on trial.");
  }

  if (defendant.user.bot) {
    return ctx.sendMain("⚖️ Bots cannot stand trial.");
  }

  if (defendant.id === ctx.user.id) {
    return ctx.sendMain("⚖️ You cannot accuse yourself.");
  }

  if (activeCourts.has(ctx.channel.id)) {
    return ctx.sendMain("⚖️ A court session is already active in this channel.");
  }

  const accuser = ctx.member;
  const caseHistory = [];

  const court = {
    accuser,
    defendant,
    accuserReady: false,
    defendantReady: false,
    accuserScore: 0,
    defendantScore: 0,
    accuserRolls: 10,
    defendantRolls: 10,
    history: [],
    phase: "ready",
    ended: false,
    withdrawAllowedId: accuser.id,
  };

  activeCourts.set(ctx.channel.id, court);

  const buildEmbed = ({ showCourtRecord = true } = {}) => {
    const phaseTitle =
      court.phase === "ready"
        ? "⚖️ Court Convenes"
        : court.phase === "trial"
          ? "⚖️ The Trial Is Underway"
          : "⚖️ Court Adjourned";

    const phaseDescription =
      court.phase === "ready"
        ? "Both parties are summoned. The court cannot proceed until each has entered the room."
        : court.phase === "trial"
          ? "Arguments are being heard. The court will render its verdict once both sides have spoken."
          : "The court has reached its verdict.";

    return new EmbedBuilder()
      .setColor("#d4af37")
      .setTitle(phaseTitle)
      .setDescription(phaseDescription)
      .addFields(
        {
          name: "📢 The Accuser",
          value: `${accuser}\nCase Strength: **${court.accuserScore}**\nArguments Remaining: **${court.accuserRolls}**`,
          inline: true,
        },
        {
          name: "🛡️ The Defendant",
          value: `${defendant}\nCase Strength: **${court.defendantScore}**\nArguments Remaining: **${court.defendantRolls}**`,
          inline: true,
        },
        { name: "\u200b", value: "\u200b", inline: false },
        ...(caseHistory.length > 0
          ? [{ name: "📜 Retrial History", value: lastN(caseHistory, 3) }]
          : []),
        ...(showCourtRecord
          ? [{ name: "📜 Court Record", value: lastTwo(court.history) }]
          : [])
      )
      .setThumbnail(defendant.displayAvatarURL())
      .setFooter({
        text:
          court.phase === "ready"
            ? "The bailiff awaits both parties"
            : court.phase === "trial"
              ? "10 arguments per side • 120 seconds"
              : "The gavel has struck",
      });
  };

  const buildReadyRow = () =>
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("accuser_ready")
        .setLabel(court.accuserReady ? "⚖️ Accuser is Here" : "⚖️ Is Accuser Present?")
        .setStyle(court.accuserReady ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("defendant_ready")
        .setLabel(court.defendantReady ? "⚖️ Defendant is Here" : "⚖️ Is Defendant Present?")
        .setStyle(court.defendantReady ? ButtonStyle.Success : ButtonStyle.Secondary)
    );

  const buildTrialRow = () =>
    new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("accuse").setLabel("⚔️ Accuse").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("defend").setLabel("🛡️ Defend").setStyle(ButtonStyle.Primary)
    );

  const buildVerdictRow = (guilty) => {
    const buttons = [
      new ButtonBuilder()
        .setCustomId("retrial")
        .setLabel("⚖️ Demand a Retrial")
        .setStyle(ButtonStyle.Danger),
    ];

    if (guilty) {
      buttons.push(
        new ButtonBuilder()
          .setCustomId("punishment")
          .setLabel("🔨 Accept Punishment")
          .setStyle(ButtonStyle.Secondary)
      );
    }

    return new ActionRowBuilder().addComponents(...buttons);
  };

  const courtMessage = await ctx.channel.send({
    embeds: [buildEmbed({ showCourtRecord: false })],
    components: [buildReadyRow()],
  });

  const startReadyPhase = () => {
    const readyCollector = courtMessage.createMessageComponentCollector({
      time: 120000,
      filter: (i) => i.customId === "accuser_ready" || i.customId === "defendant_ready",
    });

    readyCollector.on("collect", async (interaction) => {
      if (court.ended) {
        return interaction.reply({ content: "⚖️ This court session has ended.", ephemeral: true });
      }

      if (interaction.customId === "accuser_ready") {
        if (interaction.user.id !== accuser.id) {
          return interaction.reply({ content: "Only the accuser can use this.", ephemeral: true });
        }
        court.accuserReady = true;
      }

      if (interaction.customId === "defendant_ready") {
        if (interaction.user.id !== defendant.id) {
          return interaction.reply({ content: "Only the defendant can use this.", ephemeral: true });
        }
        court.defendantReady = true;
      }

      if (court.accuserReady && court.defendantReady) {
        court.phase = "trial";
        court.history.push("⚖️ Both parties have entered the courtroom.");
        readyCollector.stop("advanced");

        await interaction.update({
          embeds: [buildEmbed()],
          components: [buildTrialRow()],
        });

        startTrialPhase();
        return;
      }

      await interaction.update({
        embeds: [buildEmbed({ showCourtRecord: false })],
        components: [buildReadyRow()],
      });
    });

    readyCollector.on("end", (_, reason) => {
      if (reason === "advanced") return;
      if (court.phase === "ready") activeCourts.delete(ctx.channel.id);
    });
  };

  const startTrialPhase = () => {
    let trialIndex = 1;
    let accuserWins = 0;
    let defendantWins = 0;
    let seriesEnded = false;

    const resolveSeries = async (reasonText) => {
      if (seriesEnded) return;
      seriesEnded = true;
      court.phase = "ended";
      activeCourts.delete(ctx.channel.id);

      let accuserFinal = accuserWins;
      let defendantFinal = defendantWins;

      let guilty;
      let winner;
      let loser;
      let introLine;

      if (accuserFinal > defendantFinal) {
        guilty = true;
        winner = accuser;
        loser = defendant;
        introLine = randomPick(GUILTY_INTROS);
      } else {
        guilty = false;
        winner = defendant;
        loser = accuser;
        introLine = randomPick(NOT_GUILTY_INTROS);
      }

      const margin = Math.abs(accuserFinal - defendantFinal);
      caseHistory.push(
        `Trial ${trialIndex - 1}: ⚖️ ${winner.displayName} beat ${loser.displayName} by **${margin}** (${accuserFinal}-${defendantFinal})`
      );

      const filename = verdictFilename(guilty);
      const verdictImage = makeVerdictAttachment(guilty);

      await safeEdit(
        courtMessage,
        {
          embeds: [
            buildEmbed({ showCourtRecord: false })
              .setColor(guilty ? "Red" : "Green")
              .setTitle(guilty ? "⚖️ THE VERDICT: GUILTY" : "⚖️ THE VERDICT: NOT GUILTY")
              .setDescription(introLine)
              .setImage(`attachment://${filename}`),
          ],
          files: [verdictImage],
          components: [buildVerdictRow(guilty)],
        },
        () => activeCourts.delete(ctx.channel.id)
      );

      const verdictCollector = courtMessage.createMessageComponentCollector({
        time: 60000,
        filter: (i) => i.customId === "retrial" || i.customId === "punishment",
      });

      verdictCollector.on("collect", async (interaction) => {
        if (interaction.user.id !== loser.id) {
          return interaction.reply({ content: "Only the losing party may make this choice.", ephemeral: true });
        }

        if (interaction.customId === "punishment") {
          court.ended = true;
          court.phase = "ended";
          court.history.push(`🔨 ${defendant} accepted the court's sentence without further contest.`);

          const punishment = randomLine(PUNISHMENT_LINES, loser, winner);
          const sentenceImage = makeVerdictAttachment(guilty);

          await interaction.update({
            embeds: [
              buildEmbed({ showCourtRecord: false })
                .setColor("Red")
                .setTitle("🔨 Sentence Carried Out")
                .setDescription(
                  `${defendant} has been found **GUILTY** as charged and accepts the court's sentence without further contest.`
                )
                .addFields({ name: "⚖️ Sentence", value: punishment })
                .setImage(`attachment://${filename}`)
                .setFooter({ text: "Case closed." }),
            ],
            files: [sentenceImage],
            components: [],
          });

          verdictCollector.stop("punished");
          activeCourts.delete(ctx.channel.id);
          return;
        }

        if (interaction.customId === "retrial") {
          court.phase = "ready";
          court.ended = false;
          court.withdrawAllowedId = interaction.user.id;
          court.accuserReady = false;
          court.defendantReady = false;
          court.accuserScore = 0;
          court.defendantScore = 0;
          court.accuserRolls = 10;
          court.defendantRolls = 10;
          court.history = [`⚖️ ${loser} has demanded a retrial.`];

          await interaction.update({
            embeds: [buildEmbed({ showCourtRecord: false })],
            components: [buildReadyRow()],
            files: [],
          });

          verdictCollector.stop("retrial");
          activeCourts.set(ctx.channel.id, court);
          startReadyPhase();
        }
      });

      verdictCollector.on("end", async (_, reason) => {
        if (reason === "retrial" || reason === "punished") return;
        court.ended = true;
        activeCourts.delete(ctx.channel.id);
        await safeEdit(courtMessage, { components: [] }, () => {});
      });
    };

    const runTrial = async () => {
      if (seriesEnded) return;

      if (trialIndex > 4) {
        const tied = accuserWins === defendantWins;
        if (tied) {
          trialIndex = 5;
          const a = randomRoll();
          const d = randomRoll();
          accuserWins += a;
          defendantWins += d;
          court.history.push(`⚡ Sudden Death Trial 5 → ${accuser.displayName} +${a} | ${defendant.displayName} +${d}`);
        }
        return resolveSeries("series complete");
      }

      const trialCollector = courtMessage.createMessageComponentCollector({
        time: 120000,
        filter: (i) => i.customId === "accuse" || i.customId === "defend",
      });

      trialCollector.on("collect", async (interaction) => {
        if (seriesEnded) {
          return interaction.reply({ content: "⚖️ This court session has ended.", ephemeral: true });
        }

        if (interaction.customId === "accuse") {
          if (interaction.user.id !== accuser.id) {
            return interaction.reply({ content: "Only the accuser may present evidence.", ephemeral: true });
          }
          if (court.accuserRolls <= 0) {
            return interaction.reply({ content: "No accusations remaining.", ephemeral: true });
          }

          const roll = randomRoll();
          court.accuserScore += roll;
          court.accuserRolls--;
          court.history.push(randomLine(ACCUSE_LINES, accuser, roll));
          await interaction.deferUpdate();
          await safeEdit(courtMessage, { embeds: [buildEmbed()] }, () => activeCourts.delete(ctx.channel.id));
          if (court.accuserRolls <= 0 && court.defendantRolls <= 0) trialCollector.stop("finished");
          return;
        }

        if (interaction.customId === "defend") {
          if (interaction.user.id !== defendant.id) {
            return interaction.reply({ content: "Only the defendant may defend themselves.", ephemeral: true });
          }
          if (court.defendantRolls <= 0) {
            return interaction.reply({ content: "No defenses remaining.", ephemeral: true });
          }

          const roll = randomRoll();
          court.defendantScore += roll;
          court.defendantRolls--;
          court.history.push(randomLine(DEFEND_LINES, defendant, roll));
          await interaction.deferUpdate();
          await safeEdit(courtMessage, { embeds: [buildEmbed()] }, () => activeCourts.delete(ctx.channel.id));
          if (court.accuserRolls <= 0 && court.defendantRolls <= 0) trialCollector.stop("finished");
        }
      });

      trialCollector.on("end", async () => {
        const accuserWonTrial = court.accuserScore >= court.defendantScore;
        const defendantWonTrial = court.defendantScore > court.accuserScore;

        if (accuserWonTrial) accuserWins++;
        if (defendantWonTrial) defendantWins++;

        caseHistory.push(
          `Trial ${trialIndex}: ⚖️ ${accuserWonTrial ? accuser.displayName : defendant.displayName} won the trial (${court.accuserScore}-${court.defendantScore})`
        );

        if (accuserWins >= 3 || defendantWins >= 3) {
          trialIndex = 5;
          return resolveSeries("best of five decided early");
        }

        if (trialIndex === 4 && accuserWins === 2 && defendantWins === 2) {
          trialIndex = 5;
          const a = randomRoll();
          const d = randomRoll();
          accuserWins += a;
          defendantWins += d;
          court.history.push(`⚡ Sudden Death Trial 5 → ${accuser.displayName} +${a} | ${defendant.displayName} +${d}`);
          return resolveSeries("sudden death");
        }

        trialIndex++;
        if (trialIndex <= 4) {
          await safeEdit(
            courtMessage,
            {
              embeds: [buildEmbed()],
              components: [buildTrialRow()],
            },
            () => activeCourts.delete(ctx.channel.id)
          );
          return runTrial();
        }

        return resolveSeries("series complete");
      });
    };

    runTrial();
  };

  startReadyPhase();
}