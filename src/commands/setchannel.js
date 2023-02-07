const {
  EmbedBuilder,
  PermissionsBitField,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const db = require("orio.db");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("kanal-ayarla")
    .setDescription("Mesajın gönderileceği kanalı ayarlarsınız")
    .addChannelOption((option) =>
      option
        .setName("kanal")
        .setDescription("Mesajın gönderileceği kanalı etiketleyin")
        // Ensure the user can only select a TextChannel for output
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  // komutu geliştirmek istersen guide: https://discordjs.guide/slash-commands/advanced-creation.html
  run: async (client, interaction) => {
    const channel = interaction.options.getChannel("kanal");
    if (db.get(`serverWebhook_${interaction.guild.id}`)) {
      interaction.reply(
        "Sistem bu sunuda aktif lütfen kapatma komutunu kullanınız `/sistem-kapat`"
      );
    } else {
      channel
        .createWebhook({
          name: "Deprem Bilgi",
          avatar:
            "https://cdn.discordapp.com/attachments/935097817763033109/1072570846759092295/deprem.png",
        })
        .then((webhook) => {
          db.push("webhooks", `${webhook.url}`);
          db.set("serverWebhook_" + interaction.guild.id, `${webhook.url}`);
          interaction.reply("Başarılı");
        })
        .catch(console.error);
    }
  },
};
