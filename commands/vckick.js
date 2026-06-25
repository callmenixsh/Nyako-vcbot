module.exports = {
    name: 'vckick',
    aliases: ['yeet', 'yeetall'],

    async execute(message, args = [], client, invokedName) {
        // Determine subcommand: either invoked via alias (`yeet`/`yeetall`)
        // or as `!vckick yeet ...` / `!vckick yeetall ...`
        let sub = null;

        if (invokedName === 'yeet' || invokedName === 'yeetall') {
            sub = invokedName;
        } else if (args[0] && ['yeet', 'yeetall'].includes(args[0].toLowerCase())) {
            sub = args.shift().toLowerCase();
        }

        if (sub === 'yeet') {
            const member = message.mentions.members.first();
            const delay = parseInt(args[1]) || 10;

            if (!member)
                return message.reply('Mention a user.');

            if (!member.voice.channel)
                return message.reply('That user is not in VC.');

            message.reply(
                `${member.user.tag} will be disconnected in ${delay} seconds.`
            );

            setTimeout(async () => {
                try {
                    if (member.voice.channel) {
                        await member.voice.setChannel(null);
                    }
                } catch (err) {
                    console.error(err);
                }
            }, delay * 1000);

            return;
        }

        if (sub === 'yeetall') {
            // When called as `!yeetall 15` args[0] is the delay.
            // When called as `!vckick yeetall 15` args[0] is the delay after shifting.
            const delay = parseInt(args[0]) || 10;

            const vc = message.member.voice.channel;

            if (!vc)
                return message.reply('Join a voice channel first.');

            const membersToKick = [...vc.members.values()]
                .filter(m => !m.user.bot);

            if (membersToKick.length === 0)
                return message.reply('No members to disconnect.');

            message.channel.send(
                `${membersToKick.length} users will be disconnected in ${delay} seconds.`
            );

            setTimeout(async () => {
                for (const m of membersToKick) {
                    try {
                        if (m.voice.channel) {
                            await m.voice.setChannel(null);
                        }
                    } catch (err) {
                        console.error(err);
                    }
                }

                message.channel.send('Bye-bye everyone ❤️');
            }, delay * 1000);

            return;
        }

        // No subcommand provided — show usage
        return message.reply('Usage: `!yeet @user [seconds]` or `!yeetall [seconds]`');
    }
};
