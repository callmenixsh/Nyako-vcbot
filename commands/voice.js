const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

let sleepTimers = [];
let sleepMessages = [];
function parseTime(input) {
  if (!input) return 10000;

  if (/^\d+$/.test(input)) return parseInt(input) * 1000;

  let ms = 0;

  for (const match of input.matchAll(/(\d+)([smh])/gi)) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    if (unit === "s") ms += value * 1000;
    if (unit === "m") ms += value * 60000;
    if (unit === "h") ms += value * 3600000;
  }

  return ms || 10000;
}

async function scheduleSleep(message, vc) {
  const members = [...vc.members.values()].filter((m) => !m.user.bot);

  if (!members.length) return;
  const goodnightMsg = await message.channel.send(
    "🌙 Good night <3\n \n - - - - - - - - ‎ ",
  );
  sleepMessages.push(goodnightMsg);
  // Deafen UI
  await scheduleMassAction({
    message,
    members,
    delayMs: 10000,
    title: "Sleep -  Deafen",
    verb: "deafen",
    emoji: "🌙",
    completeText: (users) => ` Deafened:\n${users}`,
    action: (m) => m.voice.setDeaf(true),
    cancelId: "cancel_sleep_deafen",
    isSleep: true,
  });

  // Disconnect UI
  scheduleMassAction({
    message,
    members,
    delayMs: 10000,
    title: "Sleep - Disconnect",
    verb: "disconnect",
    emoji: "👟",
    completeText: (users) => ` Disconnected:\n${users}`,
    action: (m) => m.voice.setChannel(null),
    cancelId: "cancel_sleep_disconnect",
    isSleep: true,
  });
  const sleepMsg = await message.channel.send(
    "- - - - - - - - ‎ \n \n I will sleep <3 in 1 hr",
  );
  sleepMessages.push(sleepMsg);
  const shutdownTimer = setTimeout(
    async () => {
      await message.channel.send(
        "🛑 Sleep mode complete.\nBot shutting down...",
      );

      setTimeout(() => {
        console.log("Bot shut down after sleep sequence.");

        message.client.destroy();
        process.exit(0);
      }, 1000);
    },
    1.5 * 60 * 60 * 1000,
  );

  sleepTimers.push(shutdownTimer);
}

async function scheduleSingleAction({
  message,
  member,
  delayMs,
  title,
  verb,
  emoji,
  action,
  cancelId,
  completedText,
}) {
  const end = Math.floor((Date.now() + delayMs) / 1000);

  const embed = new EmbedBuilder()
    .setColor(0xf59e0b)
    .setTitle(`${emoji} ${title}`)
    .setDescription(
      `Understood, I'll **${verb}**\n` + `${member}\n` + `<t:${end}:R>`,
    )
    .setFooter({
      text: `At ${new Date(Date.now() + delayMs).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`,
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(cancelId)
      .setLabel("Cancel")
      .setEmoji("❌")
      .setStyle(ButtonStyle.Secondary),
  );

  const msg = await message.channel.send({
    embeds: [embed],
    components: [row],
  });

  let cancelled = false;

  const timeout = setTimeout(async () => {
    if (cancelled) return;

    try {
      if (member.voice.channel) {
        await action(member);
      }
    } catch (err) {
      console.error("yeet error :", err);
    }
    if (!msg.editable) return;
    await msg.edit({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setTitle(`${emoji} ${title} Complete`)
          .setDescription(
            completedText(member) + `\n<t:${Math.floor(Date.now() / 1000)}:R>`,
          )
          .setFooter({
            text: `At ${new Date().toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}`,
          }),
      ],
      components: [],
    });
  }, delayMs);

  const collector = msg.createMessageComponentCollector({
    time: delayMs,
  });

  collector.on("collect", async (i) => {
    if (i.user.id !== message.author.id)
      return i.reply({
        content: "Only the command author can cancel this.",
        ephemeral: true,
      });

    cancelled = true;
    clearTimeout(timeout);

    await i.update({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle(`✔️ ${title} Cancelled`)
          .setDescription(`🕊️ ${member} has been spared.`),
      ],
      components: [],
    });

    collector.stop();
  });
}

async function scheduleMassAction({
  message,
  members,
  delayMs,
  title,
  verb,
  emoji,
  completeText,
  action,
  cancelId,
  isSleep = false,
}) {
  const end = Math.floor((Date.now() + delayMs) / 1000);

  const targetList = members
    .slice(0, 10)
    .map((m) => `${m}`)
    .join(", ");

  const extra = members.length > 10 ? `\n+${members.length - 10} more` : "";

  const embed = new EmbedBuilder()
    .setColor(0xf59e0b)
    .setTitle(`${emoji} ${title}`)
    .setDescription(
      `Understood, I'll **${verb}**\n` +
        `${targetList}${extra}\n` +
        `<t:${end}:R>`,
    )
    .setFooter({
      text: `At ${new Date(Date.now() + delayMs).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })}`,
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(cancelId)
      .setLabel("Cancel")
      .setEmoji("❌")
      .setStyle(ButtonStyle.Secondary),
  );

  const msg = await message.channel.send({
    embeds: [embed],
    components: [row],
  });

  if (isSleep) {
    sleepMessages.push(msg);
  }

  let cancelled = false;

  const timeout = setTimeout(async () => {
    if (cancelled) return;

    const affected = [];

    for (const member of members) {
      try {
        if (!member.voice.channel) continue;

        await action(member);
        affected.push(member);
      } catch (err) {
        console.error(err);
      }
    }

    const affectedText = affected.length ? affected.join(", ") : "Nobody";
    if (!msg.editable) return;
    await msg.edit({
      embeds: [
        new EmbedBuilder()
          .setColor("Red")
          .setTitle(`${emoji} ${title} Complete`)
          .setDescription(completeText(affectedText))
          .setFooter({
            text: `At ${new Date().toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}`,
          }),
      ],
      components: [],
    });
  }, delayMs);

  const collector = msg.createMessageComponentCollector({
    time: delayMs,
  });
  sleepTimers.push(timeout);

  collector.on("collect", async (i) => {
    if (i.user.id !== message.author.id)
      return i.reply({
        content: "Only the command author can cancel this.",
        ephemeral: true,
      });

    cancelled = true;
    clearTimeout(timeout);

    await i.update({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle(`✔️ ${title} Cancelled`)
          .setDescription("🕊️ Everyone has been spared."),
      ],
      components: [],
    });

    collector.stop();
  });
}

const voiceCommand = {
  name: "voice",

  aliases: [
    "yeet",
    "yeetall",
    "deafen",
    "undeafen",
    "mute",
    "unmute",
    "muteall",
    "unmuteall",
    "deafenall",
    "undeafenall",
    "sleepcancel",
  ],

  async execute(message, args = [], client, invokedName) {
    let sub = null;

    if (invokedName === "sleepcancel") {
      for (const timer of sleepTimers) {
        clearTimeout(timer);
      }

      sleepTimers.length = 0;

      for (const msg of sleepMessages) {
        try {
          await msg.delete();
        } catch (err) {}
      }

      sleepMessages.length = 0;

      return message.channel.send("🌙 Nevermind I guess.");
    }

    const commands = [
      "yeet",
      "yeetall",
      "deafen",
      "undeafen",
      "mute",
      "unmute",
      "muteall",
      "unmuteall",
      "deafenall",
      "undeafenall",
      "sleepcancel",
    ];

    if (commands.includes(invokedName)) sub = invokedName;
    else if (args[0] && commands.includes(args[0].toLowerCase()))
      sub = args.shift().toLowerCase();

    // ---------------- Single-user commands ----------------

    const singleActions = {
      yeet: {
        title: "Disconnect",
        verb: "disconnect",
        emoji: "👟",
        completedText: (member) => `${member} has been disconnected.`,
        action: (m) => m.voice.setChannel(null),
      },

      deafen: {
        title: "Voice Deafen",
        verb: "deafen",
        emoji: "🔇",
        completedText: (member) => `${member} has been server deafened.`,
        action: (m) => m.voice.setDeaf(true),
      },

      undeafen: {
        title: "Voice Undeafen",
        verb: "undeafen",
        emoji: "🔊",
        completedText: (member) => `${member} has been server undeafened.`,
        action: (m) => m.voice.setDeaf(false),
      },

      mute: {
        title: "Voice Mute",
        verb: "server mute",
        emoji: "🔕",
        completedText: (m) => `${m} has been server muted.`,
        action: (m) => m.voice.setMute(true),
      },

      unmute: {
        title: "Voice Unmute",
        verb: "server unmute",
        emoji: "🔔",
        completedText: (m) => `${m} has been server unmuted.`,
        action: (m) => m.voice.setMute(false),
      },
    };

    if (singleActions[sub]) {
      const member = message.mentions.members.first();
      const delayMs = parseTime(args[1]);

      if (!member) return message.reply("Mention a user.");

      if (!member.voice.channel)
        return message.reply("That user is not in VC.");

      const cmd = singleActions[sub];

      await scheduleSingleAction({
        message,
        member,
        delayMs,
        title: cmd.title,
        verb: cmd.verb,
        emoji: cmd.emoji,
        action: cmd.action,
        cancelId: `cancel_${sub}`,
        completedText: cmd.completedText,
      });

      return;
    }

    // ---------------- Mass commands ----------------

    const massActions = {
      yeetall: {
        title: "Voice Disconnect",
        verb: "disconnect",
        emoji: "👟",
        completeText: (users) => `Disconnected:\n${users}`,
        action: (m) => m.voice.setChannel(null),
      },

      muteall: {
        title: "Voice Mute",
        verb: "server mute",
        emoji: "🔕",
        completeText: (users) => `Server muted:\n${users}`,
        action: (m) => m.voice.setMute(true),
      },

      unmuteall: {
        title: "Voice Unmute",
        verb: "server unmute",
        emoji: "🔔",
        completeText: (users) => `Server unmuted:\n${users}`,
        action: (m) => m.voice.setMute(false),
      },

      deafenall: {
        title: "Voice Deafen",
        verb: "server deafen",
        emoji: "🔇",
        completeText: (users) => `Server deafened:\n${users}`,
        action: (m) => m.voice.setDeaf(true),
      },

      undeafenall: {
        title: "Voice Undeafen",
        verb: "server undeafen",
        emoji: "🔊",
        completeText: (users) => `Server undeafened:\n${users}`,
        action: (m) => m.voice.setDeaf(false),
      },
    };

    if (massActions[sub]) {
      const vc = message.member.voice.channel;

      if (!vc) return message.reply("Join a voice channel first.");

      const members = [...vc.members.values()].filter((m) => !m.user.bot);

      if (!members.length) return message.reply("No members found.");

      const cmd = massActions[sub];

      await scheduleMassAction({
        message,
        members,
        delayMs: parseTime(args[0]),
        title: cmd.title,
        verb: cmd.verb,
        emoji: cmd.emoji,
        completeText: cmd.completeText,
        action: cmd.action,
        cancelId: `cancel_${sub}`,
      });

      return;
    }
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle("🎙️ Voice Commands")
          .setDescription(
            [
              "`!yeet @user 30s`",
              "`!deafen @user 30s`",
              "`!undeafen @user 30s`",
              "`!yeetall 30s`",
              "`!muteall 30s`",
              "`!unmuteall 30s`",
              "`!deafenall 30s`",
              "`!undeafenall 30s`",
            ].join("\n"),
          )
          .setFooter({
            text: "Time examples: 30s • 2m • 1m30s",
          }),
      ],
    });
  },
};
voiceCommand.scheduleSleep = scheduleSleep;
module.exports = voiceCommand;
