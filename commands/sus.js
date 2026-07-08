const { EmbedBuilder } = require("discord.js");
const { animateEmbed } = require("../utils/animateEmbed");
const { checkCooldown } = require("../utils/cooldowns");
module.exports = {
    name: "sus",

    async execute(message) {
        			const remaining = checkCooldown(message.author.id, "sus", 10);

	if (remaining) {
		return message.reply(
			`⏳ Please wait **${remaining}s** The vents are clear`
		);

	}
        const mentioned = message.mentions.members.first();

        let target;
        let isMentioned = false;

        if (mentioned) {
            target = mentioned;
            isMentioned = true;
        } else {
            let members;

            try {
                members = await message.guild.members.fetch();
            } catch {
                members = message.guild.members.cache;
            }

            const pool = [...members.values()].filter(
                (m) => !m.user.bot && m.id !== message.author.id
            );

            if (!pool.length) {
                return message.reply("No valid members found.");
            }

            target = pool[Math.floor(Math.random() * pool.length)];
        }

        // 🔥 10% BACKFIRE ONLY WHEN MENTIONING SOMEONE
        if (isMentioned && Math.random() < 0.1) {
            target = message.member;
        }

        const build = (title, desc, color) =>
            new EmbedBuilder()
                .setColor(color)
                .setTitle(title)
                .setDescription(desc);

        const susReasons = [
            "acting suspicious.",
            "definitely up to something.",
            "giving major sus energy.",
            "hiding something for sure.",
        ];

        const reason =
            susReasons[Math.floor(Math.random() * susReasons.length)];

        const isNotSus =
            isMentioned && target.id !== message.member.id
                ? Math.random() < 0.3
                : false;

        const stages = [];

        // =========================
        // RANDOM FLOW
        // =========================
        if (!isMentioned || target.id !== message.mentions.members.first()?.id) {
            stages.push(
                build(
                    "👀 Looking for sus activities...",
                    "Scanning server members...",
                    "Orange"
                )
            );

            stages.push(
                build(
                    "🔍 Searching for sus...",
                    "Checking behaviour patterns...",
                    "Yellow"
                )
            );

            stages.push(
                build(
                    "⏳ Processing data...",
                    "Analyzing inconsistencies...",
                    "Yellow"
                )
            );

            stages.push(
                build(
                    "⚙️ Forming results...",
                    "Compiling final report...",
                    "Orange"
                )
            );

            stages.push(
                build(
                    "👀 Final Sus Verdict",
                    `${target.toString()} is ${reason}`,
                    "Red"
                )
            );
        }

        // =========================
        // MENTION FLOW
        // =========================
        else {
            stages.push(
                build(
                    "👀 Looking for sus activities...",
                    `Scanning ${target.toString()}...`,
                    "Orange"
                )
            );

            stages.push(
                build(
                    "🔍 Searching for sus...",
                    `Analyzing behaviour of ${target.toString()}...`,
                    "Yellow"
                )
            );

            stages.push(
                build(
                    "⏳ Processing data...",
                    "Checking inconsistencies...",
                    "Yellow"
                )
            );

            stages.push(
                build(
                    "⚙️ Forming results...",
                    "Finalizing verdict...",
                    "Orange"
                )
            );

            stages.push(
                build(
                    "👀 Final Sus Verdict",
                    target.id === message.member.id
                        ? `💀 Plot twist... YOU are SUS`
                        : isNotSus
                            ? `${target.toString()} is NOT sus 😇`
                            : `${target.toString()} is ${reason}`,
                    target.id === message.member.id
                        ? "DarkRed"
                        : isNotSus
                            ? "Green"
                            : "Red"
                )
            );
        }

        await animateEmbed({
            message,
            stages,
            interval: 1200,
        });
    },
};