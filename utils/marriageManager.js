const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/marriages.json");

let marriages = [];
const activeProposals = new Map();
const activeDivorces = new Map();

function load() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    }

    marriages = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!Array.isArray(marriages)) marriages = [];
  } catch (err) {
    console.error("Failed to load marriages:", err);
    marriages = [];
  }
}

function save() {
  fs.writeFileSync(filePath, JSON.stringify(marriages, null, 2));
}

// --------------------
// Marriage
// --------------------

function getMarriage(userId) {
  return marriages.find((m) => m.users.some((u) => u.id === userId)) || null;
}

function isMarried(userId) {
  return !!getMarriage(userId);
}

function getPartner(userId) {
  const marriage = getMarriage(userId);

  if (!marriage) return null;

  return marriage.users.find((u) => u.id !== userId);
}

function marry(user1, user2) {
  marriages.push({
    users: [
      {
        id: user1.id,
        name: user1.name,
        avatar: user1.avatar,
      },
      {
        id: user2.id,
        name: user2.name,
        avatar: user2.avatar,
      },
    ],
    marriedAt: Math.floor(Date.now() / 1000),
  });

  save();
}
function divorce(userId) {
  const index = marriages.findIndex((m) =>
    m.users.some((u) => u.id === userId),
  );

  if (index === -1) return false;

  marriages.splice(index, 1);

  save();

  return true;
}

// --------------------
// Proposal Manager
// --------------------

function hasActiveProposal(userId) {
  return activeProposals.has(userId);
}

function createProposal(user1, user2) {
  activeProposals.set(user1, user2);
  activeProposals.set(user2, user1);
}

function removeProposal(user1, user2) {
  activeProposals.delete(user1);
  activeProposals.delete(user2);
}
// --------------------
// Divorce Manager
// --------------------

function hasActiveDivorce(userId) {
  return activeDivorces.has(userId);
}

function createDivorce(user1, user2) {
  activeDivorces.set(user1, user2);
  activeDivorces.set(user2, user1);
}

function removeDivorce(user1, user2) {
  activeDivorces.delete(user1);
  activeDivorces.delete(user2);
}

// --------------------
// Helpers
// --------------------

function getAllMarriages() {
  return marriages;
}

function getMarriageCount() {
  return marriages.length;
}

function updateMarriageUser(userId, data) {
  const marriage = getMarriage(userId);

  if (!marriage) return false;

  const user = marriage.users.find((u) => u.id === userId);

  if (!user) return false;

  if (data.name) user.name = data.name;
  if (data.avatar) user.avatar = data.avatar;

  save();
  return true;
}

load();

module.exports = {
  load,
  save,

  getMarriage,
  isMarried,
  getPartner,
  marry,
  divorce,

  hasActiveProposal,
  createProposal,
  removeProposal,

  hasActiveDivorce,
  createDivorce,
  removeDivorce,

  getAllMarriages,
  getMarriageCount,
  updateMarriageUser,
};
