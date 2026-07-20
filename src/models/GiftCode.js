const { Schema, model } = require('mongoose');

const GiftCodeSchema = new Schema({
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  createdBy: { type: String, required: true },
  redeemedBy: [{ userId: String, redeemedAt: Date }],
  expiresAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('GiftCode', GiftCodeSchema);
