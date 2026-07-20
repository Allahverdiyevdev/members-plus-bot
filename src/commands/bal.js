const { SlashCommandBuilder } = require('@discordjs/builders');
const { getSnapshot } = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('bal')
    .setDescription('Kullanıcının bakiye bilgisini gösterir')
    .addUserOption(opt => opt.setName('user').setDescription('Hedef kullanıcı')),
  async execute(interaction) {
    const target = interaction.options.getUser('user') || interaction.user;
    const db = await getSnapshot();
    const u = (db.users || []).find(x => x.userId === target.id);
    if (!u) return interaction.reply({ content: `${target.username} için bakiye bulunamadı.`, ephemeral: true });
    return interaction.reply({ content: `${target.username} — Bakiye: ${u.balance} coins\nToplam: ${u.totalEarned}` });
  }
};
