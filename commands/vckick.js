const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

function parseTime(input) {
    if (!input) return 10000;

    if (/^\d+$/.test(input))
        return parseInt(input) * 1000;

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

function formatTime(ms) {
    const s = Math.floor(ms / 1000);

    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;

    const out = [];

    if (h) out.push(`${h}h`);
    if (m) out.push(`${m}m`);
    if (sec || !out.length) out.push(`${sec}s`);

    return out.join(" ");
}

async function scheduleMassAction({
    message,
    members,
    delayMs,
    title,
    emoji,
    completeText,
    action,
    cancelId,
}) {
    const embed = new EmbedBuilder()
        .setColor("Orange")
        .setTitle(`${emoji} ${title} Scheduled`)
        .setDescription(
            `👥 **Targets:** ${members.length}\n` +
            `⏳ **Timer:** ${formatTime(delayMs)}`
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(cancelId)
            .setLabel("Cancel")
            .setEmoji("❌")
            .setStyle(ButtonStyle.Danger)
    );

    const msg = await message.channel.send({
        embeds: [embed],
        components: [row],
    });

    let cancelled = false;

    const timeout = setTimeout(async () => {
        if (cancelled) return;

        for (const member of members) {
            try {
                if (!member.voice.channel) continue;
                await action(member);
            } catch (err) {
                console.error(err);
            }
        }

        await msg.edit({
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle(`${emoji} ${title} Complete`)
                    .setDescription(completeText(members.length)),
            ],
            components: [],
        });
    }, delayMs);

    const collector = msg.createMessageComponentCollector({
        time: delayMs,
    });

    collector.on("collect", async (i) => {
        if (i.user.id !== message.author.id) {
            return i.reply({
                content: "Only the command author can cancel this.",
                ephemeral: true,
            });
        }

        cancelled = true;
        clearTimeout(timeout);

        await i.update({
            embeds: [
                new EmbedBuilder()
                    .setColor("Green")
                    .setTitle(`✅ ${title} Cancelled`)
                    .setDescription("🕊️ Everyone has been spared."),
            ],
            components: [],
        });

        collector.stop();
    });
}

module.exports = {
    name: "vckick",

    aliases: [
        "yeet",
        "yeetall",
        "muteall",
        "unmuteall",
        "deafenall",
        "undeafenall",
    ],

    async execute(message, args = [], client, invokedName) {

        let sub = null;

        const commands = [
            "yeet",
            "yeetall",
            "muteall",
            "unmuteall",
            "deafenall",
            "undeafenall",
        ];

        if (commands.includes(invokedName))
            sub = invokedName;
        else if (
            args[0] &&
            commands.includes(args[0].toLowerCase())
        )
            sub = args.shift().toLowerCase();

                    // ---------------- YEET ----------------

        if (sub === "yeet") {
            const member = message.mentions.members.first();
            const delayMs = parseTime(args[1]);

            if (!member)
                return message.reply("Mention a user.");

            if (!member.voice.channel)
                return message.reply("That user is not in VC.");

            const embed = new EmbedBuilder()
                .setColor("Orange")
                .setTitle("💨 VC Yeet Scheduled")
                .setDescription(
                    `👤 **Target:** ${member.user.tag}\n` +
                    `⏳ **Timer:** ${formatTime(delayMs)}`
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("cancel_yeet")
                    .setLabel("Cancel")
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Danger)
            );

            const msg = await message.channel.send({
                embeds: [embed],
                components: [row],
            });

            let cancelled = false;

            const timeout = setTimeout(async () => {
                if (cancelled) return;

                try {
                    if (member.voice.channel)
                        await member.voice.setChannel(null);
                } catch (err) {
                    console.error(err);
                }

                await msg.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Red")
                            .setTitle("💨 VC Yeet Complete")
                            .setDescription(
                                `💀 ${member.user.tag} has been disconnected.`
                            ),
                    ],
                    components: [],
                });
            }, delayMs);

            const collector = msg.createMessageComponentCollector({
                time: delayMs,
            });

            collector.on("collect", async (i) => {
                if (i.user.id !== message.author.id) {
                    return i.reply({
                        content: "Only the command author can cancel this.",
                        ephemeral: true,
                    });
                }

                cancelled = true;
                clearTimeout(timeout);

                await i.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("Green")
                            .setTitle("✅ VC Yeet Cancelled")
                            .setDescription(
                                `🕊️ ${member.user.tag} has been spared.`
                            ),
                    ],
                    components: [],
                });

                collector.stop();
            });

            return;
        }

        // ---------------- MASS COMMANDS ----------------

        const massActions = {
            yeetall: {
                title: "Mass VC Yeet",
                emoji: "💨",
                complete: (n) =>
                    `💀 ${n} users were disconnected.`,
                action: (m) => m.voice.setChannel(null),
            },

            muteall: {
                title: "Mass VC Mute",
                emoji: "🔕",
                complete: (n) =>
                    `🔕 ${n} users were server muted.`,
                action: (m) => m.voice.setMute(true),
            },

            unmuteall: {
                title: "Mass VC Unmute",
                emoji: "🔔",
                complete: (n) =>
                    `🔔 ${n} users were server unmuted.`,
                action: (m) => m.voice.setMute(false),
            },

            deafenall: {
                title: "Mass VC Deafen",
                emoji: "🔇",
                complete: (n) =>
                    `🔇 ${n} users were server deafened.`,
                action: (m) => m.voice.setDeaf(true),
            },

            undeafenall: {
                title: "Mass VC Undeafen",
                emoji: "🔊",
                complete: (n) =>
                    `🔊 ${n} users were server undeafened.`,
                action: (m) => m.voice.setDeaf(false),
            },
        };

        if (massActions[sub]) {

            const vc = message.member.voice.channel;

            if (!vc)
                return message.reply(
                    "Join a voice channel first."
                );

            const members = [...vc.members.values()]
                .filter(m => !m.user.bot);

            if (!members.length)
                return message.reply(
                    "No members found."
                );

            await scheduleMassAction({
                message,
                members,
                delayMs: parseTime(args[0]),
                title: massActions[sub].title,
                emoji: massActions[sub].emoji,
                completeText: massActions[sub].complete,
                action: massActions[sub].action,
                cancelId: `cancel_${sub}`,
            });

            return;
        }

                return message.reply(
            [
                "Usage:",
                "`!yeet @user 30s`",
                "`!yeet @user 1m30s`",
                "`!yeetall 2m`",
                "`!muteall 30s`",
                "`!unmuteall 30s`",
                "`!deafenall 30s`",
                "`!undeafenall 30s`",
            ].join("\n")
        );
    },
};