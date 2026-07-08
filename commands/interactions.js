const {
    EmbedBuilder
} = require("discord.js");


const pats = [
    "🐱 *purrs happily* Thank you for the pats <3",
    "😸 *ears wiggle* More pats please!",
    "✨ *happy cat noises* That feels nice.",
    "🐾 *leans into your hand*"
];


const hugs = [
    "🤗 *hugs back* Thank you <3",
    "🐱 *snuggles closer* I appreciate it.",
    "💙 *warm virtual hug*",
    "✨ Sending a big hug back!"
];


module.exports = {

    name: "pat",

    aliases: [
        "hug"
    ],


    async execute(message, args, client, invokedName) {


        let response;


        if (invokedName === "hug") {

            response =
                hugs[
                    Math.floor(Math.random() * hugs.length)
                ];

        } else {

            response =
                pats[
                    Math.floor(Math.random() * pats.length)
                ];

        }



        const embed =
            new EmbedBuilder()
                .setColor(0xff9bd5)
                .setDescription(
                    response
                )
                .setFooter({
                    text:
                    `${message.author.username} <3`
                });


        message.channel.send({
            embeds: [
                embed
            ]
        });

    }

};