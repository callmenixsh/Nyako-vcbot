const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require('discord.js');

module.exports = {
    name: 'roulette',

    async execute(message) {
        const voiceChannel = message.member.voice.channel;

        if (!voiceChannel)
            return message.reply('Join a voice channel first.');

        let players = [...voiceChannel.members.values()]
            .filter(m => !m.user.bot);

        if (players.length < 2)
            return message.reply('Need at least 2 players.');

        let round = 1;
        let chamber = Math.floor(Math.random() * 6);
        let position = 0;
        let gameActive = true;

        let turnIndex = 0; // 🔥 FAIR CIRCLE SYSTEM

        const embed = (desc) =>
            new EmbedBuilder()
                .setTitle('🎲 VC Roulette')
                .setDescription(desc)
                .setColor('Red');

        const gameMsg = await message.channel.send({
            embeds: [embed('Loading chamber...')],
        });

        const nextTurn = async () => {
            if (!gameActive) return;

            players = players.filter(p => p.voice.channel);

            if (players.length <= 1) {
                gameActive = false;
                return gameMsg.edit({
                    embeds: [
                        embed(
                            `🏁 Winner: **${players[0]?.user.tag || 'Nobody'}**`
                        ),
                    ],
                    components: [],
                });
            }

            // 🔥 CIRCULAR TURN PICK (FAIR)
            if (turnIndex >= players.length) turnIndex = 0;
            const player = players[turnIndex];
            turnIndex++;

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('pull_trigger')
                    .setLabel('🔫 Pull Trigger')
                    .setStyle(ButtonStyle.Danger)
            );

            await gameMsg.edit({
                embeds: [
                    embed(
                        `Round **${round}**\n\n👉 ${player.user.tag}'s turn`
                    ),
                ],
                components: [row],
            });

            let acted = false;

            const collector = gameMsg.createMessageComponentCollector({
                time: 5000,
            });

            collector.on('collect', async (i) => {
                if (i.user.id !== player.id) {
                    return i.reply({
                        content: 'Not your turn 😏',
                        ephemeral: true,
                    });
                }

                acted = true;

                await i.deferUpdate();

                if (position === chamber) {
                    try {
                        await player.voice.setChannel(null);
                    } catch {}

                    players = players.filter((p) => p.id !== player.id);

                    gameActive = false;

                    return gameMsg.edit({
                        embeds: [
                            embed(
                                `💥 **BANG!**\n${player.user.tag} was eliminated`
                            ),
                        ],
                        components: [],
                    });
                }

                await gameMsg.edit({
                    embeds: [
                        embed(`😮 Click...\n${player.user.tag} survived`),
                    ],
                    components: [],
                });

                position = (position + 1) % 6;
                round++;

                setTimeout(nextTurn, 2000);
            });

            collector.on('end', async () => {
                if (acted || !gameActive) return;

                try {
                    await player.voice.setChannel(null);
                } catch {}

                players = players.filter((p) => p.id !== player.id);

                await gameMsg.edit({
                    embeds: [
                        embed(
                            `⏰ ${player.user.tag} hesitated...\n💥 Punishment shot fired`
                        ),
                    ],
                    components: [],
                });

                position = (position + 1) % 6;
                round++;

                setTimeout(nextTurn, 5000);
            });
        };

        nextTurn();
    },
};