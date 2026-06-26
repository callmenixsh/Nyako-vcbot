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

module.exports = { animateEmbed };