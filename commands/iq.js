const { EmbedBuilder } = require("discord.js");

function getTitle(iq) {
	if (iq <= 25) return "🥔 Potato Brain";
	if (iq <= 50) return "😵 Confused";
	if (iq <= 75) return "🙂 Average Discord User";
	if (iq <= 100) return "🧠 Normal";
	if (iq <= 125) return "🧠 Smart";
	if (iq <= 150) return "🤓 Genius";
	if (iq <= 200) return "🚀 Built Different";
	return "👽 Not Human?";
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = {
	name: "iq",

	async execute(message) {
		const target = message.mentions.members.first() || message.member;

		const msg = await message.channel.send({
			embeds: [
				new EmbedBuilder()
					.setColor("Blue")
					.setTitle("🧠 IQ SCANNER ACTIVE")
					.setDescription(`**Subject:** ${target.toString()}\n\nInitializing scan...\nIQ: \`--\``),
			],
		});

		const finalIQ = Math.floor(Math.random() * 230) + 1;
		let current = Math.floor(Math.random() * 230) + 1;

		const scanStates = [
			"Scanning neural pathways...",
			"Reading brain activity...",
			"Decoding thought patterns...",
			"Analyzing memory clusters...",
			"Detecting cognitive signals...",
			"Stabilizing neural output...",
			"Calibrating intelligence matrix...",
			"Locking final estimate...",
		];

		const steps = scanStates.length;

		for (let i = 0; i < steps; i++) {
			// smooth convergence toward final IQ
			current = Math.round(current + (finalIQ - current) * 0.35);

			// small noise for realism
			current += Math.floor(Math.random() * 5) - 2;

			if (current < 1) current = 1;
			if (current > 230) current = 230;

			await sleep(450);

			await msg.edit({
				embeds: [
					new EmbedBuilder()
						.setColor("Blue")
						.setTitle("🧠 IQ SCANNER ACTIVE")
						.setDescription(
							`**Subject:** ${target.toString()}\n\n` +
							`${scanStates[i]}\n\n` +
							`IQ: \`${current}\``
						),
				],
			});
		}

		await sleep(700);

		await msg.edit({
			embeds: [
				new EmbedBuilder()
					.setColor("DarkBlue")
					.setTitle("🧠 IQ SCAN COMPLETE")
					.setDescription(
						`**Subject:** ${target.toString()}\n\n` +
						`Final Stabilized IQ:\n` +
						`## 🧠 \`${finalIQ}\`\n\n` +
						`**Classification:** ${getTitle(finalIQ)}`
					)
					.setFooter({ text: "neural scan stabilized" }),
			],
		});
	},
};