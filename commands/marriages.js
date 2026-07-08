const { EmbedBuilder } = require("discord.js");
const marriageManager = require("../utils/marriageManager");

module.exports = {
  name: "marriages",

  async execute(message) {
    
    const marriages = [...marriageManager.getAllMarriages()];

    if (!marriages.length) {
      return message.reply("💔 Nobody is married yet.");
    }

    // Oldest marriages first
    marriages.sort((a, b) => a.marriedAt - b.marriedAt);

    const top = marriages.slice(0, 10);

    const lines = top.map((marriage, index) => {
      const user1 = marriage.users[0];
      const user2 = marriage.users[1];

      const mention1 = `<@${user1.id}>`;
      const mention2 = `<@${user2.id}>`;

      const medal =
        index === 0
          ? "🥇"
          : index === 1
            ? "🥈"
            : index === 2
              ? "🥉"
              : `**${index + 1}.**`;

      return (
        `${medal} ${mention1} ❤️ ${mention2}\n` +
        `> 📅 Married <t:${marriage.marriedAt}:D>\n` +
        `> ⏳ Together for <t:${marriage.marriedAt}:R>`
      );
    });

    const embed = new EmbedBuilder()
      .setColor("#FF69B4")
      .setTitle("💍 Marriage Hall of Fame")
      .setDescription(
        lines.join("\n\n") +
          `\n\n━━━━━━━━━━━━━━━━━━\n` +
          `\n💞 **Total Marriages:** \`${marriageManager.getMarriageCount()}\`` +
          `\n🏆 **Showing:** Top ${Math.min(10, marriageManager.getMarriageCount())}`,
      )
      .setFooter({
        text: "Oldest marriages are displayed first",
      })
      .setTimestamp();

    return message.channel.send({
      embeds: [embed],
      allowedMentions: {
        parse: ["users"],
      },
    });
  },
};
