const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  // joinRecords: [{ guildId, joinedAt, campaignId, holdingExpiresAt }]
  joinRecords: [{ guildId: String, joinedAt: Date, campaignId: String, holdingExpiresAt: Date }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('User', UserSchema);
