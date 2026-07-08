const {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require("discord.js");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const marriageManager = require("../utils/marriageManager");

module.exports = {
	name: "divorce",

	async execute(message) {
		const marriage = marriageManager.getMarriage(message.author.id);

		if (!marriage)
			return message.reply("💔 You are not married.");

		const partner = marriage.users.find(
			(u) => u.id !== message.author.id,
		);

		if (
			marriageManager.hasActiveDivorce(message.author.id) ||
			marriageManager.hasActiveDivorce(partner.id)
		)
			return message.reply(
				"A divorce request is already pending.",
			);

		marriageManager.createDivorce(
			message.author.id,
			partner.id,
		);

		const partnerMember = await message.guild.members
			.fetch(partner.id)
			.catch(() => null);

		if (!partnerMember) {
			marriageManager.removeDivorce(
				message.author.id,
				partner.id,
			);

			return message.reply(
				"Your partner is no longer in this server."
			);
		}

const requestEnds = Math.floor(Date.now() / 1000) + 60;

const loadingMsg = await message.channel.send({
	embeds: [
		new EmbedBuilder()
			.setColor("#F4A261")
			.setTitle("⚖️ Family Court")
			.setDescription([
				"Preparing your request...\n",
				"⏳ Retrieving marriage records",
				"⬜ Preparing divorce papers",
				"⬜ Sending request",
			].join("\n")),
	],
});

await sleep(700);

await loadingMsg.edit({
	embeds: [
		new EmbedBuilder()
			.setColor("#F4A261")
			.setTitle("⚖️ Family Court")
			.setDescription([
				"Preparing your request...\n",
				"✅ Retrieving marriage records",
				"⏳ Preparing divorce papers",
				"⬜ Sending request",
			].join("\n")),
	],
});

await sleep(700);

await loadingMsg.edit({
	embeds: [
		new EmbedBuilder()
			.setColor("#F4A261")
			.setTitle("⚖️ Family Court")
			.setDescription([
				"Preparing your request...\n",
				"✅ Retrieving marriage records",
				"✅ Preparing divorce papers",
				"⏳ Sending request",
			].join("\n")),
	],
});

await sleep(800);

const uniqueId = Date.now().toString();

const row = new ActionRowBuilder().addComponents(
	new ButtonBuilder()
		.setCustomId(`divorce_accept_${uniqueId}`)
		.setLabel("Finalize Divorce")
		.setEmoji("💔")
		.setStyle(ButtonStyle.Secondary),

	new ButtonBuilder()
		.setCustomId(`divorce_decline_${uniqueId}`)
		.setLabel("Stay Together")
		.setEmoji("❤️")
		.setStyle(ButtonStyle.Secondary),
);

await loadingMsg.edit({
	content: `<@${partner.id}>`,
	embeds: [
		new EmbedBuilder()
			.setColor("#E76F51")
			.setTitle("💔 Divorce Request")
			.setAuthor({
				name: `${message.member.displayName}'s Request`,
				iconURL: message.author.displayAvatarURL(),
			})
			.setDescription([
				`${message.author} wishes to end their marriage with ${partnerMember}.`,
				"",
				"**Do you agree to the divorce?**",
				"",
				`⏳ Expires <t:${requestEnds}:R>`,
			].join("\n")),
	],
	components: [row],
	allowedMentions: {
		parse: ["users"],
	},
});

const msg = loadingMsg;

const collector = msg.createMessageComponentCollector({
	time: 60000,
	filter: (i) =>
		i.user.id === partner.id &&
		(i.customId === `divorce_accept_${uniqueId}` ||
			i.customId === `divorce_decline_${uniqueId}`),
});


		collector.on("collect", async (interaction) => {
			const disabledRow =
				new ActionRowBuilder().addComponents(
					ButtonBuilder.from(
						row.components[0],
					).setDisabled(true),
					ButtonBuilder.from(
						row.components[1],
					).setDisabled(true),
				);

			if (
				interaction.customId ===
				`divorce_accept_${uniqueId}`
			) {
				marriageManager.divorce(
					message.author.id,
				);

				marriageManager.removeDivorce(
					message.author.id,
					partner.id,
				);

				collector.stop("accepted");

				return interaction.update({
					embeds: [
						new EmbedBuilder()
	.setColor("#D62828")
.setTitle("💔 Divorce Finalized")
.setDescription([
	`${message.author} and ${partnerMember} have officially divorced.`,
	"",
	"Both parties have signed the papers.",
].join("\n"))
					],
					components: [],
				});
			}

			marriageManager.removeDivorce(
				message.author.id,
				partner.id,
			);

			collector.stop("declined");

			return interaction.update({
				embeds: [
					new EmbedBuilder()
	.setColor("#57CC99")
	.setTitle("❤️ Marriage Preserved")
	.setDescription([
		`${partnerMember} declined the divorce request.`,
		"",
		"The marriage remains intact.",
	].join("\n")),
				],
				components: [],
			});
		});

		collector.on("end", async (_, reason) => {
			if (reason !== "time") return;

			marriageManager.removeDivorce(
				message.author.id,
				partner.id,
			);

			const disabledRow =
				new ActionRowBuilder().addComponents(
					ButtonBuilder.from(
						row.components[0],
					).setDisabled(true),
					ButtonBuilder.from(
						row.components[1],
					).setDisabled(true),
				);

			try {
				await msg.edit({
					embeds: [
						new EmbedBuilder()
	.setColor("#9E9E9E")
	.setTitle("⌛ Divorce Request Expired")
	.setDescription([
		"No response was received.",
		"",
		"The request has expired.",
	].join("\n")),
					],
					components: [],
				});
			} catch {}
		});
	},
};