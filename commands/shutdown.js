module.exports = {
    name: "shutdown",

    aliases: [
        "stopbot",
        "offline"
    ],

    async execute(message, args, client) {
        if (message.author.id !== process.env.OWNER_ID) {
            return message.reply("❌ You cannot shut me down.");
        }


        await message.reply("🛑 Shutting down...");


        setTimeout(() => {
            client.destroy();

            console.log("Bot shut down.");
        }, 1000);
    },
};