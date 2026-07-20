const { SlashCommandBuilder } = require('@discordjs/builders');
const User = require('../models/User');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bal')
    .setDescription('Kullanıcının bakiye bilgisini gösterir')
    .addUserOption(opt => opt.setName('user').setDescription('Hedef kullanıcı')),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    let u = await User.findOne({ userId: target.id });
    if (!u) return interaction.reply({ content: `${target.username} için bakiye bulunamadı.`, ephemeral: true });
    // son 5 işlem için Transaction model sorgulanabilir (örnek yok)
    return interaction.reply({ content: `${target.username} — Bakiye: ${u.balance} coins\nToplam: ${u.totalEarned}` });
  }
};
