const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',

    async execute(message) {

        const embed = new EmbedBuilder()
            .setTitle('📖 Commands List')
            .setColor('Red')
            .addFields(
                {
                    name: '🥔 Hot Potato',
                    value:
                        '`!hotpotato` Start a Hot Potato game\n' +
                        '`!pass @user` Pass the potato',
                },
                {
                    name: '🎲 VC Roulette',
                    value:
                        '`!roulette` Start a turn-based VC roulette game\n'
                },
                {
                    name: '💨 VC Yeet',
                    value:
                        '`!yeet @user [seconds]` Kick a user after delay\n' +
                        '`!yeetall [seconds]` Kick EVERYONE in VC after delay',
                },
                {
                    name: '📖 Help',
                    value:
                        '`!help` Show this menu',
                }
            )
            .setFooter({
                text: 'Gimme more ideas'
            });

        await message.channel.send({
            embeds: [embed]
        });
    }
};