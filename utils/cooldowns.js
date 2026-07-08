const cooldowns = new Map();

function checkCooldown(userId, command, seconds) {
    const key = `${userId}:${command}`;
    const now = Date.now();

    if (cooldowns.has(key)) {
        const expires = cooldowns.get(key);

        if (now < expires) {
            return Math.ceil((expires - now) / 1000);
        }
    }

    cooldowns.set(key, now + seconds * 1000);
    return 0;
}

module.exports = { checkCooldown };