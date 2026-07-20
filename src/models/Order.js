const { getSnapshot } = require('../db');

module.exports = {
  async findOne(query) {
    const db = await getSnapshot();
    return db.orders.find(o => o.orderId === query.orderId) || null;
  }
};
