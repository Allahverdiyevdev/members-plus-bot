const { getSnapshot, runExclusive } = require('../db');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async create({ amount, createdBy, expiresAt }) {
    const code = uuidv4().split('-')[0].toUpperCase();
    await runExclusive(async (db) => {
      db.giftcodes = db.giftcodes || [];
      db.giftcodes.push({ code, amount, createdBy, redeemedBy: [], expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null, createdAt: new Date().toISOString() });
    });
    return code;
  },
  async findByCode(code) {
    const db = await getSnapshot();
    return (db.giftcodes || []).find(g => g.code === code) || null;
  }
};
