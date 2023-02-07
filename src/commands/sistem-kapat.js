const {
  EmbedBuilder,
  PermissionsBitField,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  WebhookClient,
  PermissionFlagsBits,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const db = require("orio.db");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("sistem-kapat")
    .setDescription("Deprem bilgi sistemini kapatırsınız!")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  // komutu geliştirmek istersen guide: https://discordjs.guide/slash-commands/advanced-creation.html
  run: async (client, interaction) => {
    if (!db.get(`serverWebhook_${interaction.guild.id}`)) {
      interaction.reply("Sistem zaten kapalı ayarlamak için `/kanal-ayarla`");
    } else {
      const data = db.get(`serverWebhook_${interaction.guild.id}`);
      const webhookClient = new WebhookClient({
        url: `${data}`,
      });

      webhookClient.delete().catch((err) => {});
      db.delete(`serverWebhook_${interaction.guild.id}`);
      interaction.reply("Başarıyla silindi");
    }
  },
};
