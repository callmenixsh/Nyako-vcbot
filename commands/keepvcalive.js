const {
    joinVoiceChannel,
    getVoiceConnection,
} = require("@discordjs/voice");

module.exports = {
    name: "keepvcalive",

    aliases: [
        "stayvc",
        "afkvc",
        "keepvcalive",
        "stopvcalive",
        "leavevc",
        "thxforkeepingthevcalive",
        "leave"
    ],

    async execute(message, args, client, invokedName) {

        // Disable keepalive
        if (
            ["thxforkeepingthevcalive", "stopvcalive", "leave","leavevc"]
            .includes(invokedName)
        ) {

            const connection = getVoiceConnection(message.guild.id);

            if (!connection) {
                return message.reply("❌ I'm not in a VC.");
            }

            connection.destroy();

            return message.reply(
                "🔇 Keepalive disabled. Left the VC."
            );
        }


        // Enable keepalive
        const vc = message.member.voice.channel;

        if (!vc) {
            return message.reply("🎧 Join a voice channel first.");
        }


        joinVoiceChannel({
            channelId: vc.id,
            guildId: vc.guild.id,
            adapterCreator: vc.guild.voiceAdapterCreator,
            selfDeaf: true,
        });


        message.reply(
            `🔊 Keepalive enabled. Staying in **${vc.name}**.`
        );
    },
};