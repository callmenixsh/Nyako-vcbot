const { EmbedBuilder } = require("discord.js");

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function progressBar(percent, size = 20) {
  const filled = Math.round((percent / 100) * size);
  return "█".repeat(filled) + "░".repeat(size - filled);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  name: "sacrifice",

  async execute(message) {
    try {
      if (!message.guild) return;

      const mentioned = message.mentions.members.first();

      let fetched;
      try {
        fetched = await message.guild.members.fetch();
      } catch {
        fetched = message.guild.members.cache;
      }

      const members = [...fetched.values()].filter((m) => !m.user.bot);

      let targets = [];
      let isMulti = false;

      const roll = Math.random();

      // =========================
      // MULTI MODE
      // =========================
      if (roll < 0.1) {
        isMulti = true;

        const pool = members.filter((m) => m.id !== message.member?.id);

        const count = Math.min(Math.floor(Math.random() * 3) + 2, pool.length);

        while (targets.length < count) {
          const pickUser = pool[Math.floor(Math.random() * pool.length)];

          if (pickUser && !targets.includes(pickUser)) {
            targets.push(pickUser);
          }
        }
      }

      // =========================
      // NORMAL MODE (FIXED)
      // =========================
      else {
        if (mentioned) {
          targets.push(mentioned);
        } else {
          const pool = members.filter((m) => m.id !== message.member?.id);

          targets.push(pool[Math.floor(Math.random() * pool.length)]);
        }
      }

      const fmt = (m) => `<@${m.id}>`;

      const formatTargets = (arr) => {
        if (arr.length === 1) return arr[0];
        if (arr.length === 2) return `${arr[0]} & ${arr[1]}`;
        return `${arr.slice(0, -1).join(" ")} & ${arr[arr.length - 1]}`;
      };

      const build = (title, desc, color) =>
        new EmbedBuilder().setColor(color).setTitle(title).setDescription(desc);

      // =========================
      // INITIAL
      // =========================
      const msg = await message.channel.send({
        embeds: [
          build(
            "☠️ THE RITUAL AWAKENS",
            isMulti ? "…something is wrong." : "a presence has been marked.",
            "DarkRed",
          ),
        ],
        allowedMentions: { parse: ["users"] },
      });

      await sleep(1200);

      await msg.edit({
        embeds: [
          build("☠️ SIGNAL ACQUIRED", "the system is listening…", "Red"),
        ],
      });

      await sleep(1200);

      await msg.edit({
        embeds: [
          build(
            "🩸 SOMETHING IS RESPONDING",
            isMulti
              ? "…too many echoes detected"
              : "subject instability rising",
            "DarkOrange",
          ),
        ],
      });

      await sleep(1200);

      // =========================
      // SMOOTH CONTAINMENT COLLAPSE (REPLACE STAGE 3)
      // =========================
      // =========================
      // SMOOTH + GLITCHED CONTAINMENT COLLAPSE
      // =========================

      const fractureStates = [
        "the ritual begins to take shape...",
        "offerings are being evaluated...",
        "the void hesitates...",
        "selection pressure increasing...",
        "the ritual cannot stabilize...",
        "judgement fractures forming...",
        "the offering resists completion...",
      ];

      const glitchTexts = [
        "▓▒░ SIGNAL BREACH ░▒▓",
        "▒▒▒ REALITY DESYNC ▒▒▒",
        "▓▓ VOID INTERFERENCE ▓▓",
        "░ CLASSIFICATION LOST ░",
        "▓▓▓ OFFERING CORRUPTED ▓▓▓",
      ];

      const makeGlitchBar = (percent, size = 20) => {
        let bar = "";
        for (let i = 0; i < size; i++) {
          const r = Math.random();

          if (i < (percent / 100) * size) {
            bar += r < 0.2 ? "░" : r < 0.5 ? "▓" : "█";
          } else {
            bar += r < 0.15 ? "▓" : "░";
          }
        }
        return bar;
      };

      let percent = 35;
      let peak = 60;

      const clamp = (v) => Math.max(5, Math.min(95, v));
      for (let i = 0; i < fractureStates.length; i++) {
        for (let j = 0; j < 3; j++) {
          // controlled instability
          if (i < 2) percent += Math.random() * 8 + 4;
          else if (i < 4) percent -= Math.random() * 10 + 3;
          else if (i < 6) percent += Math.random() * 9 + 5;
          else percent -= Math.random() * 6 + 2;

          percent = Math.max(5, Math.min(95, percent));

          // ONLY ONE BAR SOURCE (no duplication)
          const bar = makeGlitchBar(percent);

          let base = `${fractureStates[i]}\n\n${bar}\n\`stability: ${Math.floor(percent)}%\``;

          // glitch corruption (TEXT ONLY)
          if (Math.random() < 0.22) {
            base = base
              .split("")
              .map((c) => {
                const chars = "▓▒░#*&@%$!";
                return Math.random() < 0.08
                  ? chars[Math.floor(Math.random() * chars.length)]
                  : c;
              })
              .join("");
          }

          await msg.edit({
            embeds: [build("☠️ RITUAL IN PROGRESS", base, "Orange")],
          });

          await sleep(450);
        }
      }

      // =========================
      // CRASH MOMENT (NEW FINAL FRAME)
      // =========================

      await msg.edit({
        embeds: [
          build(
            "☠️ RITUAL CONVERGENCE",
            `THE OFFERING HAS RESOLVED\n\n${progressBar(100)}\n\`FINAL SELECTION DONE\``,
            "DarkRed",
          ),
        ],
      });
      await sleep(900);

      await sleep(1200);

      await msg.edit({
        embeds: [
          build(
            "☠️ ENTITY DECIDING OUTCOME",
            isMulti ? "It is no longer one target…" : "Judgement is IMMINENT",
            "Red",
          ),
        ],
      });

      await sleep(1200);

      // =========================
      // OUTCOME
      // =========================
      const outcomeRoll = Math.random();

      let outcome;
      if (outcomeRoll < 0.5) outcome = "accepted";
      else if (outcomeRoll < 0.85) outcome = "rejected";
      else outcome = "backfire";

      const acceptedTexts = [
        "was consumed without resistance.",
        "was accepted into the void.",
        "was quietly absorbed.",
        "was faded out of existence.",
        "was erased like it was nothing.",
        "was thrown into the ritual.",
        "was taken without resistance.",
        "was consumed by the ritual.",
      ];

      const rejectedTexts = [
        "slipped away just in time.",
        "was overlooked by the ritual.",
        "barely avoided being taken.",
        "was ignored by the void.",
        "escaped the ritual unnoticed.",
        "was not consumed this time.",
        "got skipped by the ritual flow.",
        "was left out of the ritual.",
      ];

      const backfireTexts = [
        "fell into the ritual instead.",
        "got caught in the ritual by accident.",
        "slipped into the offering circle.",
        "was dragged into the ritual flow.",
        "walked straight into the sacrifice instead.",
        "ended up inside the ritual somehow.",
        "became part of the ritual instead.",
        "accidentally joined the sacrifice.",
        "got exchanged with the ritual's sacrifice.",
        "was pulled into the ritual instead.",
      ];

      let text;
      let color = "DarkRed";

      // =========================
      // MULTI MODE FINAL (FRAME REVEAL)
      // =========================
      if (isMulti) {
        const names = targets.map(fmt);

        const frames = [
          `${names[0]}`,
          `${formatTargets(names.slice(0, 2))}`,
          `${formatTargets(names.slice(0, 3))}`,
          `${formatTargets(names)} ${pick([
            "were taken all at once… system couldn’t hold it.",
            "were consumed together in one pull.",
            "were swallowed by the ritual simultaneously.",
            "got caught in the same ritual surge.",
            "were pulled in as a group offering.",
            "were taken all at once.",
            "were all included in the outcome at once.",
            "vanished together without separation.",
          ])}`,
        ];
        color = "Purple";

        for (let i = 0; i < frames.length; i++) {
          await msg.edit({
            embeds: [
              new EmbedBuilder()
                .setColor(
                  i === 0
                    ? "DarkRed"
                    : i === 1
                      ? "Red"
                      : i === 2
                        ? "Orange"
                        : "Purple",
                )
                .setTitle("☠️ SACRIFICE RESULT")
                .setDescription(frames[i]),
            ],
          });

          await sleep(800);
        }

        text = frames[frames.length - 1];
      }

      // =========================
      // SINGLE MODE
      // =========================
      else {
        const originalTarget = targets[0];
        const target = outcome === "backfire" ? message.member : originalTarget;

        await msg.edit({
          embeds: [build("☠️ SACRIFICE RESULT", `${fmt(target)}`, "Blue")],
        });

        await sleep(900);

        await msg.edit({
          embeds: [
            build("☠️ SACRIFICE RESULT", `${fmt(target)} ...`, "Orange"),
          ],
        });

        await sleep(900);

        text = `${fmt(target)} ${pick(
          outcome === "accepted"
            ? acceptedTexts
            : outcome === "rejected"
              ? rejectedTexts
              : backfireTexts,
        )}`;

        color =
          outcome === "accepted"
            ? "Green"
            : outcome === "rejected"
              ? "Orange"
              : "Red";
      }

      // =========================
      // FINAL OUTPUT
      // =========================
      await msg.edit({
        embeds: [
          new EmbedBuilder()
            .setColor(color)
            .setTitle("☠️ SACRIFICE RESULT")
            .setDescription(text)
            .setFooter({
              text: "something is still listening...",
            }),
        ],
        allowedMentions: { parse: ["everyone", "users"] },
      });
    } catch (err) {
      console.error(err);
      return message.reply("the ritual failed to stabilize.");
    }
  },
};
