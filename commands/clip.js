const { createCanvas, loadImage } = require("canvas");
const { AttachmentBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const https = require("https");

const configPath = path.join(__dirname, "../clipConfig.json");

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}));
  }

  return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
}

function getImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const data = [];

      res.on("data", (chunk) => {
        data.push(chunk);
      });

      res.on("end", async () => {
        try {
          const img = await loadImage(Buffer.concat(data));

          resolve(img);
        } catch (err) {
          reject(err);
        }
      });
    });
  });
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(" ");
  let line = "";
  let lines = [];

  for (const word of words) {
    const test = line + word + " ";

    if (ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word + " ";
    } else {
      line = test;
    }
  }

  lines.push(line);

  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);

    lines[maxLines - 1] = lines[maxLines - 1].trimEnd() + "...";
  }

  lines.forEach((line, i) => {
    ctx.fillText(line.trimEnd(), x, y + i * lineHeight);
  });
}

module.exports = {
  name: "clip",

  aliases: ["screenshot"],

  async execute(message, args) {
    const config = loadConfig();

    // ---------------- SETUP ----------------

    if (args[0] === "setup") {
      const channel = message.mentions.channels.first();

      if (!channel) {
        return message.reply(
          "Mention a channel.\nExample: `nya!clip setup #clips`",
        );
      }

      config[message.guild.id] = {
        channelId: channel.id,
      };

      saveConfig(config);

      return message.reply(`Clip channel set to ${channel}`);
    }

    // ---------------- CHECK SETUP ----------------

    const guildConfig = config[message.guild.id];

    if (!guildConfig) {
      return message.reply(
        "Clip channel is not setup yet.\n\nUse:\n`nya!clip setup #channel`",
      );
    }

    const clipChannel = message.guild.channels.cache.get(guildConfig.channelId);

    if (!clipChannel) {
      return message.reply("❌ Saved clip channel no longer exists.");
    }

    // ---------------- MESSAGE CHECK ----------------

    if (!message.reference) {
      return message.reply("Reply to a message to clip it.");
    }

    const target = await message.channel.messages.fetch(
      message.reference.messageId,
    );

    // ---------------- CANVAS ----------------

    const width = 900;

    const text = target.content || "[No text]";

    const estimatedLines = Math.min(Math.ceil(text.length / 45), 8);

    const height =
      90 + estimatedLines * 30 + (target.attachments.size ? 40 : 0);

    const canvas = createCanvas(900, height);

    const ctx = canvas.getContext("2d");

    // background

    ctx.fillStyle = "#313338";

    ctx.fillRect(0, 0, width, height);

    // avatar

    try {
      const avatar = await getImage(
        target.author.displayAvatarURL({
          extension: "png",
          size: 128,
        }),
      );

      ctx.save();

      ctx.beginPath();

      ctx.arc(70, 80, 40, 0, Math.PI * 2);

      ctx.clip();

      ctx.drawImage(avatar, 30, 40, 80, 80);

      ctx.restore();
    } catch (err) {
      console.log("Avatar failed");
    }

    // username

    ctx.font = "bold 28px Arial";

    ctx.fillStyle = "#ffffff";

    ctx.fillText(target.author.username, 140, 70);

    // timestamp

    ctx.font = "18px Arial";

    ctx.fillStyle = "#949ba4";

    ctx.fillText(new Date(target.createdTimestamp).toLocaleString(), 140, 100);

    // message
    ctx.font = "20px Arial";
    ctx.fillStyle = "#dbdee1";


    wrapText(ctx, text, 140, 140, 700, 30, 5);

    // attachments

    if (target.attachments.size) {
      ctx.font = "20px Arial";

      ctx.fillStyle = "#00a8fc";

      ctx.fillText("📎 Attachment included", 140, 210);
    }

    const image = new AttachmentBuilder(canvas.toBuffer(), {
      name: "clip.png",
    });

    await clipChannel.send({
      content: `📸 Clipped by ${message.author}`,

      files: [image],
    });

    await message.reply(`📸 Clipped and saved in ${clipChannel}`);
  },
};
