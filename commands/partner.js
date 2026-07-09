const { EmbedBuilder } = require("discord.js");

const { checkCooldown } = require("../utils/cooldowns");
const marriageManager = require("../utils/marriageManager");

module.exports = {
  name: "partner",

  async execute(message) {
    const remaining = checkCooldown(message.author.id, "iq", 10);

    if (remaining) {
      return message.reply(
        `⏳ Please wait **${remaining}s** A certificate was recently printed.`,
      );
    }

    try {
      const member = message.mentions.members.first() || message.member;

      const marriage = marriageManager.getMarriage(member.id);

      if (!marriage) {
        return message.reply(
          member.id === message.author.id
            ? "💔 You aren't married."
            : `${member.displayName} isn't married.`,
        );
      }

      marriageManager.updateMarriageUser(member.id, {
        name: member.displayName,
        avatar: member.user.displayAvatarURL({
          extension: "png",
          size: 512,
        }),
      });

      const partnerData = marriage.users.find((u) => u.id !== member.id);

      const partner = await message.guild.members
        .fetch(partnerData.id)
        .catch(() => null);

      if (partner) {
        marriageManager.updateMarriageUser(partner.id, {
          name: partner.displayName,
          avatar: partner.user.displayAvatarURL({
            extension: "png",
            size: 512,
          }),
        });
      }

      const leftData = marriage.users.find((u) => u.id === member.id);
      const rightData = marriage.users.find((u) => u.id !== member.id);

      const marriedDate = new Date(marriage.marriedAt * 1000);

      const dateString = marriedDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      function getDuration() {
        const now = Date.now();

        let seconds = Math.floor(
          (now - marriage.marriedAt * 1000) / 1000,
        );

        const years = Math.floor(seconds / 31536000);
        seconds %= 31536000;

        const months = Math.floor(seconds / 2592000);
        seconds %= 2592000;

        const days = Math.floor(seconds / 86400);

        const parts = [];

        if (years) parts.push(`${years} year${years !== 1 ? "s" : ""}`);
        if (months) parts.push(`${months} month${months !== 1 ? "s" : ""}`);
        if (days || !parts.length)
          parts.push(`${days} day${days !== 1 ? "s" : ""}`);

        return parts.join(", ");
      }
const embed = new EmbedBuilder()
  .setColor("#ff7eb6")
  .setTitle("💕 Partner")
  .setThumbnail(leftData.avatar)
  .setImage(rightData.avatar)
  .setDescription(
    [
      `## <@${leftData.id}> ❤ <@${rightData.id}>`,
      "",
      `💍 Together for **${getDuration()}**`,
      `📅 Since **${dateString}**`,
      "",
      "*A bond recognized by Nyako.*",
    ].join("\n"),
  )

      return message.channel.send({
        embeds: [embed],
      });
    } catch (err) {
      console.error("partner command error:", err);

      return message.reply({
        content: `❌ Something went wrong: \`${err.message}\``,
        allowedMentions: { parse: [] },
      });
    }
  },
};