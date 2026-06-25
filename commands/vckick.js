const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

function parseTime(input) {
    if (!input) return 10000;

    if (/^\d+$/.test(input))
        return parseInt(input) * 1000;

    let ms = 0;

    const matches = input.matchAll(/(\d+)([smh])/gi);

    for (const match of matches) {
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        if (unit === 's') ms += value * 1000;
        if (unit === 'm') ms += value * 60000;
        if (unit === 'h') ms += value * 3600000;
    }

    return ms || 10000;
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [];

    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds || parts.length === 0)
        parts.push(`${seconds}s`);

    return parts.join(' ');
}

module.exports = {
    name: 'vckick',
    aliases: ['yeet', 'yeetall'],

    async execute(message, args = [], client, invokedName) {
        let sub = null;

        if (invokedName === 'yeet' || invokedName === 'yeetall') {
            sub = invokedName;
        } else if (
            args[0] &&
            ['yeet', 'yeetall'].includes(args[0].toLowerCase())
        ) {
            sub = args.shift().toLowerCase();
        }

        // ---------------- YEET ----------------

        if (sub === 'yeet') {
            const member = message.mentions.members.first();
            const delayMs = parseTime(args[1]);

            if (!member)
                return message.reply('Mention a user.');

            if (!member.voice.channel)
                return message.reply('That user is not in VC.');

            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('💨 VC Yeet Scheduled')
                .setDescription(
                    `👤 **Target:** ${member.user.tag}\n` +
                    `⏳ **Timer:** ${formatTime(delayMs)}`
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('cancel_yeet')
                    .setLabel('Cancel')
                    .setEmoji('❌')
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
                            .setColor('Red')
                            .setTitle('💨 VC Yeet Complete')
                            .setDescription(
                                `💀 ${member.user.tag} has been disconnected.`
                            ),
                    ],
                    components: [],
                });
            }, delayMs);

            const collector =
                msg.createMessageComponentCollector({
                    time: delayMs,
                });

            collector.on('collect', async (i) => {
                if (i.user.id !== message.author.id) {
                    return i.reply({
                        content:
                            'Only the command author can cancel this.',
                        ephemeral: true,
                    });
                }

                cancelled = true;
                clearTimeout(timeout);

                await i.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Green')
                            .setTitle('✅ VC Yeet Cancelled')
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

        // ---------------- YEET ALL ----------------

        if (sub === 'yeetall') {
            const delayMs = parseTime(args[0]);

            const vc = message.member.voice.channel;

            if (!vc)
                return message.reply(
                    'Join a voice channel first.'
                );

            const membersToKick = [...vc.members.values()]
                .filter((m) => !m.user.bot);

            if (!membersToKick.length)
                return message.reply(
                    'No members to disconnect.'
                );

            const embed = new EmbedBuilder()
                .setColor('Orange')
                .setTitle('💨 Mass VC Yeet Scheduled')
                .setDescription(
                    `👥 **Targets:** ${membersToKick.length}\n` +
                    `⏳ **Timer:** ${formatTime(delayMs)}`
                );

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('cancel_yeetall')
                    .setLabel('Cancel')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Danger)
            );

            const msg = await message.channel.send({
                embeds: [embed],
                components: [row],
            });

            let cancelled = false;

            const timeout = setTimeout(async () => {
                if (cancelled) return;

                for (const m of membersToKick) {
                    try {
                        if (m.voice.channel)
                            await m.voice.setChannel(null);
                    } catch (err) {
                        console.error(err);
                    }
                }

                await msg.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('💨 Mass VC Yeet Complete')
                            .setDescription(
                                `💀 ${membersToKick.length} users were disconnected.`
                            ),
                    ],
                    components: [],
                });
            }, delayMs);

            const collector =
                msg.createMessageComponentCollector({
                    time: delayMs,
                });

            collector.on('collect', async (i) => {
                if (i.user.id !== message.author.id) {
                    return i.reply({
                        content:
                            'Only the command author can cancel this.',
                        ephemeral: true,
                    });
                }

                cancelled = true;
                clearTimeout(timeout);

                await i.update({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Green')
                            .setTitle('✅ Mass VC Yeet Cancelled')
                            .setDescription(
                                '🕊️ Everyone has been spared.'
                            ),
                    ],
                    components: [],
                });

                collector.stop();
            });

            return;
        }

        return message.reply(
            'Usage:\n`!yeet @user 30s`\n`!yeet @user 1m30s`\n`!yeetall 2m`'
        );
    },
};