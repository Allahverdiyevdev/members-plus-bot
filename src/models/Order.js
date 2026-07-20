const { Schema, model } = require('mongoose');

const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true },
  guildId: { type: String, required: true },
  targetMembers: { type: Number, required: true },
  currentMembers: { type: Number, default: 0 },
  rewardPerMember: { type: Number, required: true },
  invite: { type: String, required: true },
  status: { type: String, enum: ['open','in_progress','completed','cancelled'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Order', OrderSchema);
