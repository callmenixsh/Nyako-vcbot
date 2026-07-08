const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  name: "help",

  async execute(message, args = []) {
    // NEW FUN TAB (iq, sacrifice, sleep, sus, judge)
    const funEmbed = new EmbedBuilder()
      .setColor("#e74c3c")
      .setTitle("🎉 Nyako")
      .setDescription(
        [
          "**Fun Commands**",
          "",
          "`nya!iq` :: Check your or someone else's IQ.",
          "",
          "`nya!sacrifice` :: Put someone up for sacrifice.",
          "",
          "`nya!sleep` :: Idk should you?",
          "",
          "`nya!sus` :: Are you sus? 👀",
          "",
          "`nya!judge` :: Judge guilty or not",
        ].join("\n"),
      )
      .setFooter({
        text: "Page 1/6 • Nyako",
      });

    // ORIGINAL GAMES TAB (renamed internally)
    const gamesEmbed = new EmbedBuilder()
      .setColor("#e74c3c")
      .setTitle("🎮 Nyako")
      .setDescription(
        [
          "**Games**",
          "",
          "`nya!hotpotato` :: Pass the potato before it explodes.",
          "",
          "`nya!roulette` :: Take turns spinning the chamber.",
        ].join("\n"),
      )
      .setFooter({
        text: "Page 2/6 • Nyako",
      });

    const vcEmbed = new EmbedBuilder()
      .setColor("#e74c3c")
      .setTitle("🎤 Nyako • Voice")
      .setDescription(
        [
          "**Single User**",
          "`nya!yeet @user <time>` • Disconnect a user.",
          "`nya!mute @user <time>` • Server mute a user.",
          "`nya!unmute @user <time>` • Remove server mute.",
          "`nya!deafen @user <time>` • Server deafen a user.",
          "`nya!undeafen @user <time>` • Remove server deafen.",
          "",
          "**Everyone in VC**",
          "`nya!yeetall <time>` • Disconnect everyone.",
          "`nya!muteall <time>` • Server mute everyone.",
          "`nya!unmuteall <time>` • Remove server mute.",
          "`nya!deafenall <time>` • Server deafen everyone.",
          "`nya!undeafenall <time>` • Remove server deafen.",
          "",
          "**Utils**",
          "`nya!afkvc/stayvc/keepvcalive` • Joins the VC and keeps it up.",
          "`nya!leavevc/stopvcalive/leave` • Leaves the VC",
          "",
          "━━━━━━━━━━━━━━━━━━",
          "⏱ **Time:** `30s` • `2m` • `1h30m` • `2h15m10s`",
        ].join("\n"),
      )
      .setFooter({
        text: "Page 3/6 • Nyako",
      });

    const utilityEmbed = new EmbedBuilder()
      .setColor("#e74c3c")
      .setTitle("🛠️ Nyako")
      .setDescription(
        [
          "**Utility**",
          "",
          "`nya!timer <time> [message]` :: Start a personal timer.",
          "`nya!timerall <time> [message]` :: Notify everyone when the timer ends.",
          "",
          "`nya!remind <time> [message]` :: Create a personal reminder.",
          "`nya!remindall <time> [message]` :: Create a reminder for everyone.",
          "",
          "`nya!clip` :: Clip a message.",
          "━━━━━━━━━━━━━━━━━━",
          "⏱ `<time>` usage :: `30s` • `2m` • `1h30m` • `2h15m10s`",
        ].join("\n"),
      )
      .setFooter({
        text: "Page 4/6 • Nyako",
      });

    const nyakoEmbed = new EmbedBuilder()
      .setColor("#ff9bd5")
      .setTitle("🐱 Nyako")
      .setDescription(
        [
          "**Interact with Nyako**",
          "",
          "**Friendly**",
          "`nya!pat` `nya!pet` `nya!hug` `nya!boop`",
          "`nya!kiss` `nya!cuddle`",
          "",
          "**Gifts**",
          "`nya!cookie` `nya!feed` `nya!fish`",
          "`nya!coffee` `nya!flower` `nya!gift`",
          "",
          "**Chaos**",
          "`nya!kill` `nya!bully` `nya!poke`",
          "`nya!bonk` `nya!throw` `nya!insult`",
          "`nya!scare`",
          "",
          "**Comfort**",
          "`nya!comfort` `nya!apologize` `nya!care`",
          "",
          "*There may be a few hidden interactions...* 👀",
        ].join("\n"),
      )
      .setFooter({
        text: "Page 5/6 • Nyako",
      });

    const miscEmbed = new EmbedBuilder()
      .setColor("#e74c3c")
      .setTitle("⚙️ Nyako")
      .setDescription(
        [
          "**Misc**",
          "",
          "`nya!help` :: Opens this help menu.",
          "`nya!marry @user` :: Propose to another user.",
          "`nya!divorce` :: Divorce your current partner.",
          "`nya!marriage` :: View your marriage information.",
          "",
          "**Jump directly to a page**",
          "`nya!help fun`",
          "`nya!help games`",
          "`nya!help vc`",
          "`nya!help utility`",
          "`nya!help nyako`",
          "`nya!help misc`",
        ].join("\n"),
      )
      .setFooter({
        text: "Page 6/6 • Nyako",
      });

    const createButtons = (page) => [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("fun")
          .setLabel("🎉 Fun")
          .setStyle(
            page === "fun" ? ButtonStyle.Primary : ButtonStyle.Secondary,
          ),

        new ButtonBuilder()
          .setCustomId("games")
          .setLabel("🎮 Games")
          .setStyle(
            page === "games" ? ButtonStyle.Primary : ButtonStyle.Secondary,
          ),

        new ButtonBuilder()
          .setCustomId("vc")
          .setLabel("🎤 Voice")
          .setStyle(
            page === "vc" ? ButtonStyle.Primary : ButtonStyle.Secondary,
          ),

        new ButtonBuilder()
          .setCustomId("utility")
          .setLabel("🛠️ Utility")
          .setStyle(
            page === "utility" ? ButtonStyle.Primary : ButtonStyle.Secondary,
          ),

        new ButtonBuilder()
          .setCustomId("nyako")
          .setLabel("🐱 Nyako")
          .setStyle(
            page === "nyako" ? ButtonStyle.Primary : ButtonStyle.Secondary,
          ),
      ),

      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("misc")
          .setLabel("⚙️ Misc")
          .setStyle(
            page === "misc" ? ButtonStyle.Primary : ButtonStyle.Secondary,
          ),
      ),
    ];

    const page = (args[0] || "").toLowerCase();

    let embed = funEmbed;
    let buttonPage = "fun";

    if (["fun"].includes(page)) {
      embed = funEmbed;
      buttonPage = "fun";
    } else if (["games", "game"].includes(page)) {
      embed = gamesEmbed;
      buttonPage = "games";
    } else if (["vc", "voice", "controls"].includes(page)) {
      embed = vcEmbed;
      buttonPage = "vc";
    } else if (["utility", "util"].includes(page)) {
      embed = utilityEmbed;
      buttonPage = "utility";
    } else if (["nyako", "interactions", "interaction"].includes(page)) {
      embed = nyakoEmbed;
      buttonPage = "nyako";
    } else if (["misc"].includes(page)) {
      embed = miscEmbed;
      buttonPage = "misc";
    }

    const msg = await message.channel.send({
      embeds: [embed],
      components: createButtons(buttonPage),
    });

    const collector = msg.createMessageComponentCollector({
      time: 60000,
    });

    collector.on("collect", async (interaction) => {
      if (interaction.user.id !== message.author.id) {
        return interaction.reply({
          content:
            "Only the person who used the command can use these buttons.",
          ephemeral: true,
        });
      }

      switch (interaction.customId) {
        case "fun":
          return interaction.update({
            embeds: [funEmbed],
            components: createButtons("fun"),
          });

        case "games":
          return interaction.update({
            embeds: [gamesEmbed],
            components: createButtons("games"),
          });

        case "vc":
          return interaction.update({
            embeds: [vcEmbed],
            components: createButtons("vc"),
          });

        case "utility":
          return interaction.update({
            embeds: [utilityEmbed],
            components: createButtons("utility"),
          });
        case "nyako":
          return interaction.update({
            embeds: [nyakoEmbed],
            components: createButtons("nyako"),
          });

        case "misc":
          return interaction.update({
            embeds: [miscEmbed],
            components: createButtons("misc"),
          });
      }
    });

    collector.on("end", async () => {
      const disabledRows = [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("fun_disabled")
            .setLabel("🎉 Fun")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),

          new ButtonBuilder()
            .setCustomId("games_disabled")
            .setLabel("🎮 Games")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),

          new ButtonBuilder()
            .setCustomId("vc_disabled")
            .setLabel("🎤 Voice")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),

          new ButtonBuilder()
            .setCustomId("utility_disabled")
            .setLabel("🛠️ Utility")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),

          new ButtonBuilder()
            .setCustomId("nyako_disabled")
            .setLabel("🐱 Nyako")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        ),

        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("misc_disabled")
            .setLabel("⚙️ Misc")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true),
        ),
      ];

      try {
        await msg.edit({ components: disabledRows });
      } catch {}
    });
  },
};
