const cooldowns = new Map();

const SWEEP_INTERVAL_MS = 5 * 60 * 1000; // sweep every 5 minutes

function sweepExpired() {
  const now = Date.now();
  for (const [key, expires] of cooldowns) {
    if (now >= expires) cooldowns.delete(key);
  }
}

const sweepTimer = setInterval(sweepExpired, SWEEP_INTERVAL_MS);
// Don't let this timer keep the process alive (e.g. during tests/shutdown).
if (typeof sweepTimer.unref === "function") sweepTimer.unref();

/**
 * Check (and start) a cooldown.
 * @param {string} userId
 * @param {string} command
 * @param {number} seconds - cooldown length in seconds
 * @returns {number} 0 if allowed, otherwise seconds remaining
 */
function checkCooldown(userId, command, seconds) {
  const key = `${userId}:${command}`;
  const now = Date.now();
  const expires = cooldowns.get(key);

  if (expires && now < expires) {
    return Math.ceil((expires - now) / 1000);
  }

  cooldowns.set(key, now + seconds * 1000);
  return 0;
}

/**
 * Check remaining cooldown without starting a new one.
 * @param {string} userId
 * @param {string} command
 * @returns {number} seconds remaining, or 0 if not on cooldown
 */
function getRemaining(userId, command) {
  const expires = cooldowns.get(`${userId}:${command}`);
  if (!expires) return 0;
  const remaining = expires - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Manually clear a cooldown (e.g. admin override).
 * @param {string} userId
 * @param {string} command
 */
function resetCooldown(userId, command) {
  cooldowns.delete(`${userId}:${command}`);
}

module.exports = { checkCooldown, getRemaining, resetCooldown };