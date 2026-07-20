const { SlashCommandBuilder } = require('@discordjs/builders');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { mongoose } = require('../db');

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

    // atomic transfer using mongoose transaction
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const [from, to] = await Promise.all([
        User.findOneAndUpdate({ userId: fromId }, { $setOnInsert: { userId: fromId } }, { upsert: true, new: true, session }),
        User.findOneAndUpdate({ userId: toUser.id }, { $setOnInsert: { userId: toUser.id } }, { upsert: true, new: true, session })
      ]);
      if (from.balance < amount) {
        await session.abortTransaction();
        return interaction.reply({ content: 'Yetersiz bakiye.', ephemeral: true });
      }
      from.balance -= amount;
      to.balance += amount;
      to.totalEarned += amount;
      await from.save({ session });
      await to.save({ session });

      const tx = new Transaction({ txId: uuidv4(), from: fromId, to: toUser.id, amount, type: 'transfer' });
      await tx.save({ session });

      await session.commitTransaction();
      return interaction.reply({ content: `Başarılı: ${amount} coin gönderildi.` });
    } catch (err) {
      await session.abortTransaction();
      console.error('transfer error', err);
      return interaction.reply({ content: 'İşlem sırasında hata oluştu.', ephemeral: true });
    } finally {
      session.endSession();
    }
  }
};
