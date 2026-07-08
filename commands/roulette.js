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

        let eliminated = [];

        let round = 1;
        let chamber = Math.floor(Math.random() * 6);
        let position = 0;
        let turnIndex = 0;
        let gameActive = false;

        const createGameEmbed = (
            players,
            eliminated,
            currentPlayer,
            round,
            position,
            chamber,
            text = ''
        ) => {
            const chamberVisual = Array.from(
                { length: 6 },
                (_, i) => {
                    if (i < position)
                        return '🟩';

                    if (i === position)
                        return '🎯';

                    return '⬛';
                }
            ).join(' ');

            const alivePlayers = players.length
                ? players.map(p =>
                    p.id === currentPlayer?.id
                        ? `🔫 ${p.user.username} `
                        : `❤️ ${p.user.username}`
                ).join('\n')
                : 'None';

            const deadPlayers = eliminated.length
                ? eliminated.map(p => `☠️ ${p}`).join('\n')
                : 'None';

            return new EmbedBuilder()
                .setColor('#c1121f')
                .setTitle('🎲 Russian Roulette')
                .setAuthor({
                    name: `Started by ${message.author.tag}`,
                })
                .setDescription(
                    `🎯 Round ${round}\n\n${text}`
                )
                .addFields(
                    {
                        name: 'Alive',
                        value: alivePlayers,
                        inline: true,
                    },
                    {
                        name: 'Eliminated',
                        value: deadPlayers,
                        inline: true,
                    },
                    {
                        name: '\u200B',
                        value: '\u200B',
                        inline: true,
                    },
                    {
                        name: '🎰 Chamber Progress',
                        value: `${chamberVisual}\nShot ${Math.min(position + 1, 6)}/6`,
                        inline: false,
                    }
                )
                .setFooter({
                    text: `${players.length} player(s) remaining`,
                })
                .setTimestamp();
        };

        const startRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('roulette_start')
                .setLabel('Start')
                .setEmoji('▶️')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('roulette_cancel')
                .setLabel('Cancel')
                .setEmoji('❌')
                .setStyle(ButtonStyle.Danger)
        );

        const gameMsg = await message.channel.send({
            embeds: [
                createGameEmbed(
                    players,
                    eliminated,
                    null,
                    round,
                    position,
                    chamber,
                    '-# The revolver is loaded.\nPress **Start** to begin.'
                ),
            ],
            components: [startRow],
        });

        const lobbyCollector =
            gameMsg.createMessageComponentCollector({
                time: 30000,
            });

        lobbyCollector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({
                    content: 'Only the host can do that.',
                    ephemeral: true,
                });
            }

            if (i.customId === 'roulette_cancel') {
                lobbyCollector.stop();

                return i.update({
                    embeds: [
                        createGameEmbed(
                            players,
                            eliminated,
                            null,
                            round,
                            position,
                            chamber,
                            '❌ Roulette cancelled.'
                        ),
                    ],
                    components: [],
                });
            }

            if (i.customId === 'roulette_start') {
                lobbyCollector.stop();

                gameActive = true;

                await i.update({
                    embeds: [
                        createGameEmbed(
                            players,
                            eliminated,
                            null,
                            round,
                            position,
                            chamber,
                            '🎲 Spinning the chamber...'
                        ),
                    ],
                    components: [],
                });

                setTimeout(nextTurn, 2000);
            }
        });

        lobbyCollector.on('end', async (_, reason) => {
            if (reason === 'time' && !gameActive) {
                await gameMsg.edit({
                    embeds: [
                        createGameEmbed(
                            players,
                            eliminated,
                            null,
                            round,
                            position,
                            chamber,
                            '⌛ Lobby expired.'
                        ),
                    ],
                    components: [],
                });
            }
        });

        const nextTurn = async () => {
            if (!gameActive) return;

            players = players.filter(
                p => p.voice.channel
            );

            if (players.length <= 1) {
                gameActive = false;

                return gameMsg.edit({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Gold')
                            .setTitle('🏆 Roulette Completed')
                            .setDescription(
                                `👑 **${players[0]?.user.tag || 'Nobody'}**`
                            )
                            .addFields({
                                name: '-----------------------',
                                value:
                                    eliminated.length
                                        ? eliminated
                                            .map(player => `💀 ${player}`)
                                            .join('\n')
                                        : 'Nobody', 
                            })
                            .setTimestamp(),
                    ],
                    components: [],
                });
            }

            if (turnIndex >= players.length)
                turnIndex = 0;

            const player = players[turnIndex];
            turnIndex++;

            await gameMsg.edit({
                embeds: [
                    createGameEmbed(
                        players,
                        eliminated,
                        player,
                        round,
                        position,
                        chamber,
                        `📢 **${player.user.tag}'s turn**`
                    ),
                ],
            });

            setTimeout(async () => {
                if (!gameActive) return;

                if (position === chamber) {
                    try {
                        await player.voice.setChannel(null);
                    } catch {}

                    eliminated.push(player.user.tag);

                    players = players.filter(
                        p => p.id !== player.id
                    );

                    if (turnIndex > players.length)
                        turnIndex = 0;

                    await gameMsg.edit({
                        embeds: [
                            createGameEmbed(
                                players,
                                eliminated,
                                null,
                                round,
                                position,
                                chamber,
                                `💥 **BANG!**\n${player.user.tag} has been eliminated.`
                            ),
                        ],
                    });
round++;
                    chamber = Math.floor(
                        Math.random() * 6
                    );
                    position = 0;
                } else {
                    await gameMsg.edit({
                        embeds: [
                            createGameEmbed(
                                players,
                                eliminated,
                                player,
                                round,
                                position + 1,
                                chamber,
                                `😮 **Click...**\n${player.user.tag} survived.`
                            ),
                        ],
                    });

                    position++;
                }


                setTimeout(nextTurn, 2000);
            }, 2000);
        };
    },
};
