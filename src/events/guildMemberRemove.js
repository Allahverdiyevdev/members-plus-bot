// early-leave penalty skeleton using JSON DB
const { runExclusive, getSnapshot } = require('../db');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const dbSnapshot = await getSnapshot();
    const u = (dbSnapshot.users || []).find(x => x.userId === member.id);
    if (!u) return;
    const rec = (u.joinRecords || []).find(r => r.guildId === member.guild.id);
    if (!rec) return;
    if (rec.holdingExpiresAt && new Date() < new Date(rec.holdingExpiresAt)) {
      const penaltyAmount = rec.rewardGivenAmount || 0;
      if (penaltyAmount <= 0) return;
      await runExclusive(async (db) => {
        db.users = db.users || [];
        const user = db.users.find(x => x.userId === member.id);
        if (!user) return;
        user.balance = Math.max(0, (user.balance || 0) - penaltyAmount);
        db.transactions = db.transactions || [];
        db.transactions.push({ txId: uuidv4(), from: member.id, to: null, amount: penaltyAmount, type: 'penalty', meta: { guildId: member.guild.id }, createdAt: new Date().toISOString() });
      });
    }
  }
};
