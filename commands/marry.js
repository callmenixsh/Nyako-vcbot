const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const marriageManager = require("../utils/marriageManager");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
  name: "marry",

  async execute(message) {
    const target = message.mentions.members.first();

    // -----------------------
    // Validation
    // -----------------------

    if (!target) return message.reply("Mention someone to propose to.");

    if (target.id === message.client.user.id) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("#FF69B4")
            .setTitle("💍 Proposal Rejected")
            .setDescription(
              [
                "Aww... that's sweet. 💕",
                "",
                "But if I got married, who would run all the commands around here?",
                "",
                "I'd hate to play favorites.",
              ].join("\n"),
            ),
        ],
      });
    }

    if (target.user.bot)
      return message.reply("Bots cannot legally marry someone.");

    if (target.id === message.author.id)
      return message.reply(
        "You can't marry yourself... probably for the best.",
      );

    if (marriageManager.isMarried(message.author.id))
      return message.reply("You're already married.");

    if (marriageManager.isMarried(target.id))
      return message.reply(`${target.displayName} is already married.`);

    if (
      marriageManager.hasActiveProposal(message.author.id) ||
      marriageManager.hasActiveProposal(target.id)
    )
      return message.reply("One of you already has a pending proposal.");

    // Lock proposal
    marriageManager.createProposal(message.author.id, target.id);

    // -----------------------
    // Marriage Registration Animation
    // -----------------------

    const proposalEnds = Math.floor(Date.now() / 1000) + 60;

    const proposalMsg = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor("#FFD166")
          .setTitle("💍 Marriage Office")
          .setDescription(
            [
              "Preparing your request...\n",
              "⏳ Verifying identities",
              "⬜ Checking marriage records",
              "⬜ Preparing certificate",
              "⬜ Delivering proposal",
            ].join("\n"),
          ),
      ],
    });

    await sleep(700);

    await proposalMsg.edit({
      embeds: [
        new EmbedBuilder()
          .setColor("#FFD166")
          .setTitle("💍 Marriage Office")
          .setDescription(
            [
              "Preparing your request...\n",
              "✅ Verifying identities",
              "⏳ Checking marriage records",
              "⬜ Preparing certificate",
              "⬜ Delivering proposal",
            ].join("\n"),
          ),
      ],
    });

    await sleep(700);

    await proposalMsg.edit({
      embeds: [
        new EmbedBuilder()
          .setColor("#FFD166")
          .setTitle("💍 Marriage Office")
          .setDescription(
            [
              "Preparing your request...\n",
              "✅ Verifying identities",
              "✅ Checking marriage records",
              "⏳ Preparing certificate",
              "⬜ Delivering proposal",
            ].join("\n"),
          ),
      ],
    });

    await sleep(700);

    await proposalMsg.edit({
      embeds: [
        new EmbedBuilder()
          .setColor("#FFD166")
          .setTitle("💍 Marriage Office")
          .setDescription(
            [
              "Preparing your request...\n",
              "✅ Verifying identities",
              "✅ Checking marriage records",
              "✅ Preparing certificate",
              "⏳ Delivering proposal",
            ].join("\n"),
          ),
      ],
    });

    await sleep(800);

    // -----------------------
    // Buttons
    // -----------------------

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`marry_accept_${proposalMsg.id}`)
        .setLabel("Accept")
        .setEmoji("❤️")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId(`marry_decline_${proposalMsg.id}`)
        .setLabel("Decline")
        .setEmoji("💔")
        .setStyle(ButtonStyle.Secondary),
    );

    await proposalMsg.edit({
      embeds: [
        new EmbedBuilder()
          .setColor("#FF69B4")
          .setTitle("💍 Marriage Proposal")
          .setDescription(
            [
              `${message.author} wants to marry ${target}.`,
              "",
              "**Will you accept this proposal?**",
              "",
              `⏳ Expires <t:${proposalEnds}:R>`,
            ].join("\n"),
          )
          .setThumbnail(message.author.displayAvatarURL()),
      ],
      components: [row],
      allowedMentions: {
        parse: ["users"],
      },
    });
    // -----------------------
    // Collector
    // -----------------------

    const collector = proposalMsg.createMessageComponentCollector({
      time: 60000,
      filter: (interaction) =>
        interaction.customId === `marry_accept_${proposalMsg.id}` ||
        interaction.customId === `marry_decline_${proposalMsg.id}`,
    });

    collector.on("collect", async (interaction) => {
      // Only the proposed user can respond
      if (interaction.user.id !== target.id) {
        return interaction.reply({
          content: "This proposal isn't for you.",
          ephemeral: true,
        });
      }

      collector.stop(interaction.customId);

      const disabledRow = new ActionRowBuilder().addComponents(
        ButtonBuilder.from(row.components[0]).setDisabled(true),
        ButtonBuilder.from(row.components[1]).setDisabled(true),
      );

      if (interaction.customId === `marry_accept_${proposalMsg.id}`) {
        marriageManager.marry(
          {
            id: message.author.id,
            name: message.member.displayName,
            avatar: message.author.displayAvatarURL({
              extension: "png",
              size: 512,
            }),
          },
          {
            id: target.id,
            name: target.displayName,
            avatar: target.user.displayAvatarURL({
              extension: "png",
              size: 512,
            }),
          },
        );

        marriageManager.removeProposal(message.author.id, target.id);

        return interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor("#57CC99")
              .setTitle("💒 Marriage Registered")
              .setDescription(
                [
                  `${message.author} ❤️ ${target}`,
                  "",
                  `📅 **Married**`,
                  `<t:${Math.floor(Date.now() / 1000)}:F>`,
                  "",
                  `💖 **Together**`,
                  `<t:${Math.floor(Date.now() / 1000)}:R>`,
                ].join("\n"),
              )
              .setThumbnail(
                "https://em-content.zobj.net/source/apple/391/ring_1f48d.png",
              )
              .setFooter({
                text: "Use nya!partner to view your marriage certificate.",
              }),
          ],
          components: [],
        });
      }

      marriageManager.removeProposal(message.author.id, target.id);

      return interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor("#EF476F")
            .setTitle("💔 Proposal Declined")
            .setDescription(`${target} declined ${message.author}'s proposal.`),
        ],
        components: [],
      });
    });

    collector.on("end", async (_, reason) => {
      // Already handled by Accept/Decline
      if (reason !== "time") return;

      marriageManager.removeProposal(message.author.id, target.id);

      const disabledRow = new ActionRowBuilder().addComponents(
        ButtonBuilder.from(row.components[0]).setDisabled(true),
        ButtonBuilder.from(row.components[1]).setDisabled(true),
      );

      try {
        await proposalMsg.edit({
          embeds: [
            new EmbedBuilder()
              .setColor("#A0A0A0")
              .setTitle("⌛ Proposal Expired")
              .setDescription(
                `No response was received.\n\nThe proposal has expired.`,
              ),
          ],
          components: [],
        });
      } catch {}
    });
  },
};
