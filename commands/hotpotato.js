const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { safeEdit } = require("../utils/safeEdit");
const { checkCooldown } = require("../utils/cooldowns");
const hotPotatoes = require("../data/hotPotatoes");

const potatoStages = [
  "🥔 The potato seems harmless.",
  "🙂 The potato feels slightly warm.",
  "😐 The potato is warming up.",
  "😬 The potato is vibrating.",
  "⚠️ The potato is making strange noises.",
  "🔥 The potato is getting dangerously hot.",
  "💣 The potato looks extremely unstable.",
  "☢️ The potato is moments from disaster.",
];

function getPrematureChance(percent) {
  if (percent > 0.875) return 0;
  if (percent > 0.75) return 0.0025;
  if (percent > 0.625) return 0.005;
  if (percent > 0.5) return 0.01;
  if (percent > 0.375) return 0.02;
  if (percent > 0.25) return 0.03;
  if (percent > 0.125) return 0.04;

  return 0.05;
}

const dangerMessages = [
  "💥 BOOM!",
  "☠️ DETONATION DETECTED!",
  "🚨 CRITICAL FAILURE!",
  "🔥 POTATO EXPLOSION IMMINENT!",
  "⚠️ CONTAINMENT FAILURE!",
  "☢️ REACTOR MELTDOWN DETECTED!",
  "💣 ARMING SEQUENCE STARTED!",
  "🚨 CORE INSTABILITY DETECTED!",
];
function createEmbed(game) {
  return new EmbedBuilder()
    .setColor("Orange")
    .setTitle("🥔 Hot Potato")
    .addFields(
      {
        name: "",
        value: game.status,
        inline: false,
      },
      {
        name: "",
        value: game.lastActivity || "Game Started",
        inline: false,
      },
    )
    .setTimestamp();
}
async function updateBoard(game, customStatus = null) {
  if (game.statusLocked && customStatus === null) return;

  if (game.ended && customStatus === null) return;

  const row = game.ended
    ? null
    : new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("pass_potato")
          .setLabel("Pass Potato")
          .setEmoji("🥔")
          .setStyle(ButtonStyle.Primary),
      );

  const percent = (game.endTime - Date.now()) / game.maxTime;

  let stage;

  if (percent > 0.875) stage = potatoStages[0];
  else if (percent > 0.75) stage = potatoStages[1];
  else if (percent > 0.625) stage = potatoStages[2];
  else if (percent > 0.5) stage = potatoStages[3];
  else if (percent > 0.375) stage = potatoStages[4];
  else if (percent > 0.25) stage = potatoStages[5];
  else if (percent > 0.125) stage = potatoStages[6];
  else stage = potatoStages[7];

  const displayStatus = customStatus || stage;

await safeEdit(
    game.statusMessage,
    {
        embeds: [
            createEmbed({
                ...game,
                status: displayStatus,
            }),
        ],
        components: row ? [row] : [],
    },
    () => {
        game.ended = true;

        if (game.warningTimeout)
            clearTimeout(game.warningTimeout);

        hotPotatoes.delete(game.voiceChannelId);
    }
);
}
module.exports = {
  name: "hotpotato",

  async execute(message) {
    			const remaining = checkCooldown(message.author.id, "iq", 60);

	if (remaining) {
		return message.reply(
			`⏳ Please wait **${remaining}s** The potato is being prepared.`
		);

	}
    const vc = message.member.voice.channel;

    if (!vc) return message.reply("Join a voice channel first.");

    const players = [...vc.members.values()].filter((m) => !m.user.bot);

    if (players.length < 2) return message.reply("Need at least 2 players.");

    if (hotPotatoes.has(vc.id))
      return message.reply("A potato game is already running!");

    const holder = players[Math.floor(Math.random() * players.length)];

    const explodeTime = (Math.floor(Math.random() * 61) + 30) * 1000;

    const game = {
      holderId: holder.id,
      voiceChannelId: vc.id,
      endTime: Date.now() + explodeTime,
      maxTime: explodeTime,
      status: potatoStages[0],
      lastActivity: "Game Started",
      statusLocked: false,
    };

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("pass_potato")
        .setLabel("Pass Potato")
        .setEmoji("🥔")
        .setStyle(ButtonStyle.Primary),
    );

    const statusMessage = await message.channel.send({
      embeds: [createEmbed(game, message.guild)],
      components: [row],
    });

    game.statusMessage = statusMessage;

    const holderMessage = await message.channel.send(
      `🥔 <@${holder.id}> has the potato!`,
    );

    game.holderMessage = holderMessage;

    hotPotatoes.set(vc.id, game);

    const collector = statusMessage.createMessageComponentCollector({
      time: explodeTime,
    });

    collector.on("collect", async (i) => {
      const currentGame = hotPotatoes.get(vc.id);

      if (!currentGame) return;

      if (i.user.id !== currentGame.holderId) {
        return i.reply({
          content: "You do not have the potato!",
          ephemeral: true,
        });
      }

      const availablePlayers = [...vc.members.values()].filter(
        (m) => !m.user.bot && m.id !== currentGame.holderId,
      );

      if (availablePlayers.length === 0) {
        return i.reply({
          content: "Nobody to pass to.",
          ephemeral: true,
        });
      }

      const target =
        availablePlayers[Math.floor(Math.random() * availablePlayers.length)];

      const percent = (currentGame.endTime - Date.now()) / currentGame.maxTime;

      const explodeChance = getPrematureChance(percent);

      if (Math.random() < explodeChance) {
        collector.stop();

        const warning =
          dangerMessages[Math.floor(Math.random() * dangerMessages.length)];

        await updateBoard(
          currentGame,
          `# 💥 MID-PASS DETONATION\nPotato exploded on <@${currentGame.holderId}>`,
        );

        await message.channel.send(
          `${warning}\n💥 THE POTATO DETONATED MID-PASS!`,
        );

        currentGame.ended = true;

        const victim = message.guild.members.cache.get(currentGame.holderId);

        try {
          if (victim?.voice.channel) await victim.voice.setChannel(null);
        } catch {}

        currentGame.ended = true;

        await currentGame.holderMessage.edit(
          `💀 <@${victim.id}> was vaporized by the potato!`,
        );

        await safeEdit(currentGame.statusMessage, {
    components: [],
});
        hotPotatoes.delete(vc.id);

        return;
      }

      const currentHolder = message.guild.members.cache.get(
        currentGame.holderId,
      );

      currentGame.lastActivity = `${currentHolder.displayName} passed the 🥔 to ${target.displayName}`;

      currentGame.holderId = target.id;

      await i.deferUpdate();

      await updateBoard(currentGame);

      await safeEdit(currentGame.holderMessage, {
    content: `🥔 <@${target.id}> has the potato!`,
});
    });

    const scheduleWarning = async () => {
      const currentGame = hotPotatoes.get(vc.id);

      if (!currentGame) return;

      if (Math.random() < 0.15) {
        const fakeText =
          dangerMessages[Math.floor(Math.random() * dangerMessages.length)];

        const fakeMsg = await message.channel.send(fakeText);
        currentGame.statusLocked = true;

        // Stage 1: warning appears
        await updateBoard(currentGame, `# ${fakeText}\nSomething is wrong...`);

        setTimeout(async () => {
          // Stage 2: reveal false alarm
          await updateBoard(currentGame, `# 🚨 FALSE ALARM\n${fakeText}`);

          try {
            await fakeMsg.edit(`${fakeText}\n😏 False alarm.`);

            setTimeout(async () => {
              // Stage 3: return to normal status
              currentGame.statusLocked = false;

              await updateBoard(currentGame);

              await fakeMsg.delete().catch(() => {});
            }, 2500);
          } catch {}
        }, 1500);
      } else {
        await updateBoard(currentGame);
      }

      const nextDelay = Math.floor(Math.random() * 6000) + 4000;

      currentGame.warningTimeout = setTimeout(scheduleWarning, nextDelay);
    };

    game.warningTimeout = setTimeout(
      scheduleWarning,
      Math.floor(Math.random() * 6000) + 4000,
    );

    setTimeout(async () => {
      const currentGame = hotPotatoes.get(vc.id);

      if (!currentGame) return;

      collector.stop();

      clearTimeout(currentGame.warningTimeout);

      if (Math.random() < 0.01) {
        await updateBoard(
          currentGame,
          "# ☢️ NUCLEAR POTATO DETONATED ☢️\n💀 Everybody died.",
        );

        currentGame.ended = true;

        await currentGame.statusMessage.edit({
          components: [],
        });

        for (const member of vc.members.values()) {
          if (!member.user.bot && member.voice.channel) {
            try {
              await member.voice.setChannel(null);
            } catch {}
          }
        }

        hotPotatoes.delete(vc.id);

        return;
      }

      const victim = vc.members.get(currentGame.holderId);

      if (victim?.voice.channel) {
        try {
          const warning =
            dangerMessages[Math.floor(Math.random() * dangerMessages.length)];

          await updateBoard(
            currentGame,
            `# ${warning}\nThe potato can no longer be contained...`,
          );

          await new Promise((r) => setTimeout(r, 1500));

          await victim.voice.setChannel(null);
          currentGame.ended = true;

          await updateBoard(
            currentGame,
            `# 💥 POTATO DETONATED\nPotato exploded on <@${victim.id}>`,
          );

          await safeEdit(currentGame.holderMessage, {
    content: `💀 <@${victim.id}> was vaporized by the potato!`,
});

          await message.channel.send(
            `🥔 ${victim} was vaporized by the potato.`,
          );
        } catch (err) {
          console.error(err);
        }
      }

      await safeEdit(statusMessage, {
    components: [],
});

      hotPotatoes.delete(vc.id);
    }, explodeTime);
  },
};
