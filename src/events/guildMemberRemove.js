// early-leave penalty skeleton
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    // 1) Check if user joined via a tracked campaign and their holdingExpiresAt still in future
    // (You must populate joinRecords when user joins campaign — that's Phase 3 implementation)
    const u = await User.findOne({ userId: member.id });
    if (!u) return;
    const rec = (u.joinRecords || []).find(r => r.guildId === member.guild.id);
    if (!rec) return;
    if (rec.holdingExpiresAt && new Date() < new Date(rec.holdingExpiresAt)) {
      // apply penalty: remove rewarded coins for that campaign (policy: remove rewardPerMember or some percentage)
      const penaltyAmount = rec.rewardGivenAmount || 0; // set when rewarding on join
      if (penaltyAmount <= 0) return;
      // atomic penalty
      u.balance = Math.max(0, u.balance - penaltyAmount);
      await u.save();
      await new Transaction({ txId: uuidv4(), from: member.id, to: null, amount: penaltyAmount, type: 'penalty', meta: { guildId: member.guild.id } }).save();
      // Optionally notify admin/log channel
    }
  }
};
