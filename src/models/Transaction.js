const { Schema, model } = require('mongoose');

const TransactionSchema = new Schema({
  txId: { type: String, required: true, unique: true },
  from: { type: String, default: null }, // null = system/top-up
  to: { type: String, default: null },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['transfer','giftcode','order','penalty','reward','system'], default: 'transfer' },
  meta: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Transaction', TransactionSchema);
