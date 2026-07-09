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

const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

const embed = new EmbedBuilder()
  .setColor("#5865F2")
  .setAuthor({
    name: target.author.tag,
    iconURL: target.author.displayAvatarURL(),
  })
  .setDescription(target.content || "*No text content*")
  .setTimestamp(target.createdTimestamp);

if (target.attachments.size) {
  const firstAttachment = target.attachments.first();

  if (firstAttachment.contentType?.startsWith("image/")) {
    embed.setImage(firstAttachment.url);
  } else {
    embed.addFields({
      name: "📎 Attachment",
      value: firstAttachment.url,
    });
  }
}

const row = new ActionRowBuilder().addComponents(
  new ButtonBuilder()
    .setLabel("Jump to Message")
    .setStyle(ButtonStyle.Link)
    .setURL(target.url)
);

await clipChannel.send({
  content: `📸 Clipped by ${message.author}`,
  embeds: [embed],
  components: [row],
});

await message.reply(`📸 Clipped and saved in ${clipChannel}`);
  },
};
