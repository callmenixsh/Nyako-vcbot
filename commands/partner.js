const { AttachmentBuilder } = require("discord.js");

const { createCanvas, loadImage } = require("canvas");

const marriageManager = require("../utils/marriageManager");

module.exports = {
  name: "partner",

  async execute(message) {
    			const remaining = checkCooldown(message.author.id, "iq", 10);

	if (remaining) {
		return message.reply(
			`⏳ Please wait **${remaining}s** A certificate was recently printed.`
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

    const canvas = createCanvas(1100, 750);
    const ctx = canvas.getContext("2d");

    // =========================
    // Background
    // =========================

    ctx.fillStyle = "#f6ecd3";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // subtle paper texture

    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle =
        Math.random() > 0.5 ? "rgba(0,0,0,0.02)" : "rgba(255,255,255,0.03)";

      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2,
      );
    }

    // =========================
    // Border
    // =========================

    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 12;

    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50);

    ctx.lineWidth = 3;

    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    // =========================
    // Title
    // =========================

    ctx.fillStyle = "#5d4037";
    ctx.textAlign = "center";

    ctx.font = "bold 56px serif";

    ctx.fillText("Marriage Certificate", canvas.width / 2, 95);

    ctx.font = "28px serif";

    ctx.fillText("Officially Certified by Nyako", canvas.width / 2, 135);

    // =========================
    // Load avatars
    // =========================

    const leftData = marriage.users.find((u) => u.id === member.id);
    const rightData = marriage.users.find((u) => u.id !== member.id);

    const leftAvatar = await loadImage(leftData.avatar);

    const rightAvatar = await loadImage(rightData.avatar);
    // =========================
    // Helper
    // =========================

    function drawAvatar(img, x, y, size) {
      ctx.save();

      ctx.beginPath();

      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);

      ctx.closePath();

      ctx.clip();

      ctx.drawImage(img, x, y, size, size);

      ctx.restore();

      ctx.lineWidth = 6;
      ctx.strokeStyle = "#b8860b";

      ctx.beginPath();

      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);

      ctx.stroke();
    }

    drawAvatar(leftAvatar, 180, 210, 180);
    drawAvatar(rightAvatar, 740, 210, 180);

    // ---------- PART 2 BELOW ----------        // =========================
    // Heart
    // =========================

    ctx.font = "90px serif";
    ctx.fillStyle = "#d7263d";
    ctx.fillText("❤", canvas.width / 2, 325);

    // =========================
    // Wedding Rings
    // =========================

    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 8;

    // Left Ring
    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 18, 390, 30, 0, Math.PI * 2);
    ctx.stroke();

    // Left Diamond
    ctx.fillStyle = "#b9f2ff";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 18, 345);
    ctx.lineTo(canvas.width / 2 - 10, 355);
    ctx.lineTo(canvas.width / 2 - 18, 365);
    ctx.lineTo(canvas.width / 2 - 26, 355);

    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#88d8ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right Ring
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.arc(canvas.width / 2 + 18, 390, 30, 0, Math.PI * 2);
    ctx.stroke();

    // Right Diamond
    ctx.fillStyle = "#b9f2ff";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 + 18, 345);
    ctx.lineTo(canvas.width / 2 + 26, 355);
    ctx.lineTo(canvas.width / 2 + 18, 365);
    ctx.lineTo(canvas.width / 2 + 10, 355);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#88d8ff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // =========================
    // Names
    // =========================

    ctx.fillStyle = "#3d2b1f";
    ctx.font = "bold 38px serif";

    ctx.fillText(leftData.name, 270, 440);
    ctx.fillText(rightData.name, 830, 440);

    // =========================
    // Divider
    // =========================

    ctx.strokeStyle = "#b8860b";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(150, 500);
    ctx.lineTo(950, 500);
    ctx.stroke();

    // =========================
    // Marriage Details
    // =========================

    const marriedDate = new Date(marriage.marriedAt * 1000);

    const dateString = marriedDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    function getDuration() {
      const now = Date.now();

      let seconds = Math.floor((now - marriage.marriedAt * 1000) / 1000);

      const years = Math.floor(seconds / 31536000);
      seconds %= 31536000;

      const months = Math.floor(seconds / 2592000);
      seconds %= 2592000;

      const days = Math.floor(seconds / 86400);

      const parts = [];

      if (years) parts.push(`${years} year${years > 1 ? "s" : ""}`);

      if (months) parts.push(`${months} month${months > 1 ? "s" : ""}`);

      if (days || !parts.length)
        parts.push(`${days} day${days !== 1 ? "s" : ""}`);

      return parts.join(", ");
    }

    ctx.font = "30px serif";
    ctx.fillStyle = "#5d4037";

    ctx.fillText(`Married on ${dateString}`, canvas.width / 2, 560);

    ctx.font = "26px serif";

    ctx.fillText(`Together for ${getDuration()}`, canvas.width / 2, 610);

    // =========================
    // Footer
    // =========================

    ctx.font = "24px serif";

    ctx.fillStyle = "#7a5a40";

    ctx.fillText("Certified by Nyako ❤", canvas.width / 2, 660);

    // =========================
    // Send
    // =========================

    const attachment = new AttachmentBuilder(canvas.toBuffer("image/png"), {
      name: "marriage-certificate.png",
    });

    return message.channel.send({
      files: [attachment],
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
