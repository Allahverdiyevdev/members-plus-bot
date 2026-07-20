const { getSnapshot } = require('../db');

module.exports = {
  async findOne(query) {
    const db = await getSnapshot();
    return db.users.find(u => u.userId === query.userId) || null;
  }
};
