const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const activeLocks = new Set();

async function animateEmbed({
    message,
    stages = [],
    interval = 1200,
}) {
    const key = `${message.channel.id}:${message.id}`;

    // ❗ prevent overlapping animations in same channel/message flow
    if (activeLocks.has(key)) return;

    activeLocks.add(key);

    try {
        let msg = await message.channel.send({
            embeds: [stages[0]],
        });

        for (let i = 1; i < stages.length; i++) {
            await sleep(interval);

            try {
                await msg.edit({
                    embeds: [stages[i]],
                });
            } catch {
                break; // stop safely if rate limited or deleted
            }
        }

        return msg;
    } finally {
        activeLocks.delete(key);
    }
}

// Interaction equivalent of animateEmbed. There's no message.channel.send
// step for slash commands — the first "message" has to be interaction.reply
// (or editReply if already deferred), and every subsequent stage becomes
// interaction.editReply. Locking is keyed on the interaction id since that's
// the stable identifier across the whole reply/edit chain.
async function animateEmbedInteraction({
    interaction,
    stages = [],
    interval = 1200,
}) {
    const key = `interaction:${interaction.id}`;

    if (activeLocks.has(key)) return;

    activeLocks.add(key);

    try {
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ embeds: [stages[0]] });
        } else {
            await interaction.reply({ embeds: [stages[0]] });
        }

        for (let i = 1; i < stages.length; i++) {
            await sleep(interval);

            try {
                await interaction.editReply({ embeds: [stages[i]] });
            } catch {
                break; // stop safely if the interaction token expired
            }
        }
    } finally {
        activeLocks.delete(key);
    }
}

module.exports = { animateEmbed, animateEmbedInteraction };