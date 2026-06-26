const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");

module.exports = {
	name: "help",

	async execute(message, args = []) {
		const funEmbed = new EmbedBuilder()
			.setColor("#e74c3c")
			.setTitle("🎮 Nyako")
			.setDescription(
				[
					"**Fun Games**",
					"",
					"`nya!hotpotato`:: Pass the potato before it explodes.",
					"",
					"`nya!roulette`:: Take turns spinning the chamber.",
				].join("\n"),
			)
			.setFooter({
				text: "Page 1/3 • Nyako",
			});

		const vcEmbed = new EmbedBuilder()
			.setColor("#e74c3c")
			.setTitle("🎤 Nyako")
			.setDescription(
				[
					"**Voice Controls**",
					"",
					"💨 `nya!yeet @user <time>`:: Disconnect the user.",
					"",
					"💀 `nya!yeetall <time>`:: Disconnect everyone.",
					"",
					"🔇 `nya!muteall <time>`:: Server mute everyone.",
					"",
					"🔊 `nya!unmuteall <time>`:: Remove server mute from everyone.",
					"",
					"🔕 `nya!deafenall <time>`:: Server deafen everyone.",
					"",
					"🔔 `nya!undeafenall <time>`:: Remove server deafen from everyone.",
					"",
					"━━━━━━━━━━━━━━━━━━",
					"⏱ `<time>` usage :: `30s` • `2m` • `1h30m` • `2h15m10s`",
				].join("\n"),
			)
			.setFooter({
				text: "Page 2/3 • Nyako",
			});

		const utilityEmbed = new EmbedBuilder()
			.setColor("#e74c3c")
			.setTitle("🛠️ Nyako")
			.setDescription(
				[
					"**Utility**",
					"",
					"⏳ `nya!timer <time> [message]` :: Start a personal timer.",
					"",
					"📢 `nya!timerall <time> [message]` :: Notify everyone when the timer ends.",
					"",
					"⏰ `nya!remind <time> [message]` :: Create a personal reminder.",
					"",
					"📣 `nya!remindall <time> [message]` :: Create a reminder for everyone.",
					"",
					"━━━━━━━━━━━━━━━━━━",
					"⏱ `<time>` usage :: `30s` • `2m` • `1h30m` • `2h15m10s`",
				].join("\n"),
			)
			.setFooter({
				text: "Page 3/4 • Nyako",
			});

		const miscEmbed = new EmbedBuilder()
			.setColor("#e74c3c")
			.setTitle("⚙️ Nyako")
			.setDescription(
				[
					"**Misc**",
					"",
					"📖 `nya!help` :: Opens this help menu.",
					"",
					"",
					"**Jump directly to a page**",
					"`nya!help games/game`",
					"`nya!help vc/voice/controls`",
					"`nya!help utility/util`",
					"`nya!help misc`",
					"",
				].join("\n"),
			)
			.setFooter({
				text: "Page 4/4 • Nyako",
			});
		const createButtons = (page) =>
			new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId("fun")
					.setLabel("🎮 Games")
					.setStyle(
						page === "fun" ? ButtonStyle.Primary : ButtonStyle.Secondary,
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
					.setCustomId("misc")
					.setLabel("⚙️ Misc")
					.setStyle(
						page === "misc" ? ButtonStyle.Primary : ButtonStyle.Secondary,
					),
			);
		const page = (args[0] || "").toLowerCase();

		let embed = funEmbed;
		let buttonPage = "fun";

		if (["games", "game"].includes(page)) {
			embed = funEmbed;
			buttonPage = "fun";
		} else if (["vc", "voice", "controls"].includes(page)) {
			embed = vcEmbed;
			buttonPage = "vc";
		} else if (["utility", "util"].includes(page)) {
			embed = utilityEmbed;
			buttonPage = "utility";
		} else if (["misc"].includes(page)) {
			embed = miscEmbed;
			buttonPage = "misc";
		}
		const msg = await message.channel.send({
			embeds: [embed],
			components: [createButtons(buttonPage)],
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
					await interaction.update({
						embeds: [funEmbed],
						components: [createButtons("fun")],
					});
					break;

				case "vc":
					await interaction.update({
						embeds: [vcEmbed],
						components: [createButtons("vc")],
					});
					break;

				case "utility":
					await interaction.update({
						embeds: [utilityEmbed],
						components: [createButtons("utility")],
					});
					break;

				case "misc":
					await interaction.update({
						embeds: [miscEmbed],
						components: [createButtons("misc")],
					});
					break;
			}
		});

		collector.on("end", async () => {
			const disabledRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId("fun_disabled")
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
					.setCustomId("misc_disabled")
					.setLabel("⚙️ Misc")
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(true),
			);
			try {
				await msg.edit({
					components: [disabledRow],
				});
			} catch (err) {}
		});
	},
};
