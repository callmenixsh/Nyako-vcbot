const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/marriages.json");

let data = {
  marriages: [],
  proposals: [],
  divorces: [],
};

function ensureFile() {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}

function normalize(raw) {
  return {
    marriages: Array.isArray(raw.marriages) ? raw.marriages : [],
    proposals: Array.isArray(raw.proposals) ? raw.proposals : [],
    divorces: Array.isArray(raw.divorces) ? raw.divorces : [],
  };
}

function load() {
  try {
    ensureFile();
    const raw = fs.readFileSync(filePath, "utf8");
    data = normalize(raw ? JSON.parse(raw) : {});
  } catch (err) {
    console.error("Failed to load marriages:", err);
    data = {
      marriages: [],
      proposals: [],
      divorces: [],
    };
  }
}

function save() {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function getMarriage(userId) {
  return data.marriages.find((m) => m.users.some((u) => u.id === userId)) || null;
}

function isMarried(userId) {
  return !!getMarriage(userId);
}

function getPartner(userId) {
  const marriage = getMarriage(userId);
  if (!marriage) return null;
  return marriage.users.find((u) => u.id !== userId) || null;
}

function marry(user1, user2) {
  data.marriages.push({
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
  const index = data.marriages.findIndex((m) =>
    m.users.some((u) => u.id === userId)
  );

  if (index === -1) return false;

  data.marriages.splice(index, 1);
  save();
  return true;
}

function hasActiveProposal(userId) {
  return data.proposals.some((p) => p.user1 === userId || p.user2 === userId);
}

function createProposal(user1, user2) {
  data.proposals.push({
    user1,
    user2,
    at: Date.now(),
  });
  save();
}

function removeProposal(user1, user2) {
  data.proposals = data.proposals.filter(
    (p) =>
      !(
        (p.user1 === user1 && p.user2 === user2) ||
        (p.user1 === user2 && p.user2 === user1)
      )
  );
  save();
}

function hasActiveDivorce(userId) {
  return data.divorces.some((d) => d.user1 === userId || d.user2 === userId);
}

function createDivorce(user1, user2) {
  data.divorces.push({
    user1,
    user2,
    at: Date.now(),
  });
  save();
}

function removeDivorce(user1, user2) {
  data.divorces = data.divorces.filter(
    (d) =>
      !(
        (d.user1 === user1 && d.user2 === user2) ||
        (d.user1 === user2 && d.user2 === user1)
      )
  );
  save();
}

function getAllMarriages() {
  return data.marriages;
}

function getMarriageCount() {
  return data.marriages.length;
}

function updateMarriageUser(userId, updates) {
  const marriage = getMarriage(userId);
  if (!marriage) return false;

  const user = marriage.users.find((u) => u.id === userId);
  if (!user) return false;

  if (updates.name) user.name = updates.name;
  if (updates.avatar) user.avatar = updates.avatar;

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