// Transaction model placeholder for compatibility. We don't use mongoose; transactions are stored in the JSON DB.
const { runExclusive } = require('../db');

module.exports = {
  async insert(tx) {
    await runExclusive(async (db) => {
      db.transactions = db.transactions || [];
      db.transactions.push(tx);
    });
  }
};
