const { SlashCommandBuilder } = require('@discordjs/builders');
const { v4: uuidv4 } = require('uuid');
const { runExclusive } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Kullanıcıya coin gönderir')
    .addUserOption(opt => opt.setName('user').setDescription('Alıcı').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Miktar').setRequired(true)),
  async execute(interaction) {
    const fromId = interaction.user.id;
    const toUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    if (amount <= 0) return interaction.reply({ content: 'Miktar pozitif olmalıdır.', ephemeral: true });
    if (toUser.id === fromId) return interaction.reply({ content: 'Kendine gönderemezsin.', ephemeral: true });

    try {
      const result = await runExclusive(async (db) => {
        db.users = db.users || [];
        db.transactions = db.transactions || [];
        let from = db.users.find(u => u.userId === fromId);
        if (!from) {
          from = { userId: fromId, balance: 0, totalEarned: 0, joinRecords: [], createdAt: new Date().toISOString() };
          db.users.push(from);
        }
        let to = db.users.find(u => u.userId === toUser.id);
        if (!to) {
          to = { userId: toUser.id, balance: 0, totalEarned: 0, joinRecords: [], createdAt: new Date().toISOString() };
          db.users.push(to);
        }
        if (from.balance < amount) return { ok: false, reason: 'Yetersiz bakiye.' };
        from.balance -= amount;
        to.balance += amount;
        to.totalEarned += amount;
        const tx = { txId: uuidv4(), from: fromId, to: toUser.id, amount, type: 'transfer', createdAt: new Date().toISOString() };
        db.transactions.push(tx);
        return { ok: true };
      });

      if (!result.ok) return interaction.reply({ content: result.reason || 'İşlem başarısız.', ephemeral: true });
      return interaction.reply({ content: `Başarılı: ${amount} coin gönderildi.` });
    } catch (err) {
      console.error('transfer error', err);
      return interaction.reply({ content: 'İşlem sırasında hata oluştu.', ephemeral: true });
    }
  }
};
