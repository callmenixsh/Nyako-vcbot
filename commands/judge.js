const { EmbedBuilder } = require("discord.js");
const { safeEdit } = require("../utils/safeEdit");
const { checkCooldown } = require("../utils/cooldowns");
function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
	name: "judge",
	aliases: [],

	async execute(message) {
					const remaining = checkCooldown(message.author.id, "judge", 10);

	if (remaining) {
		return message.reply(
			`⏳ Please wait **${remaining}s** The blance is realigning.`
		);

	}
		const target =
			message.mentions.members.first() || message.member;

		// ---------------- INITIAL ----------------
		const msg = await message.channel.send({
			embeds: [
				new EmbedBuilder()
					.setColor("Gold")
					.setTitle("⚖️ Court Session Started")
					.setDescription(`Defendant: **${target.user.tag}**`),
			],
		});

		await sleep(1200);

		// ---------------- PROCESS ----------------
		const stages = [
			"Reviewing evidence...",
			"Listening to arguments...",
			"Jury is discussing...",
			"Final decision being made...",
		];

		for (const stage of stages) {
			if (!(await safeEdit(msg, {
				embeds: [
					new EmbedBuilder()
						.setColor("Orange")
						.setTitle("⚖️ Court in Progress")
						.setDescription(stage),
				],
			}))) return;

			await sleep(1000);
		}

		// ---------------- VERDICT ----------------
		const verdicts = [
			"GUILTY",
			"INNOCENT",
			"NOT ENOUGH EVIDENCE",
			"CASE DISMISSED",
			"JURY IS CONFUSED",
		];

		const punishments = [
			"must buy everyone cookies.",
			"has to carry the next game.",
			"must say 'I am the impostor' in VC.",
			"is banned from touching grass for 24h.",
			"must send a compliment to everyone.",
			"gets sentenced to silence for 10 minutes.",
			"must host the next event.",
			"gets emotional damage.",
			"must do 10 pushups (real or imaginary).",
		];

		const verdict = pick(verdicts);
		const punishment = pick(punishments);

		const color =
			verdict === "GUILTY"
				? "Red"
				: verdict === "INNOCENT"
					? "Green"
					: "Grey";

		await sleep(1200);

		if (!(await safeEdit(msg, {
			embeds: [
				new EmbedBuilder()
					.setColor(color)
					.setTitle("⚖️ Court Verdict")
					.addFields(
						{
							name: "Defendant",
							value: target.user.tag,
							inline: false,
						},
						{
							name: "Verdict",
							value: `**${verdict}**`,
							inline: false,
						},
						{
							name: "Sentence",
							value:
								verdict === "GUILTY"
									? punishment
									: "No punishment assigned.",
							inline: false,
						},
					)
					.setFooter({ text: "Court session ended" }),
			],
		}))) return;
	},
};