const {
  EmbedBuilder,
  PermissionsBitField,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  WebhookClient,
  PermissionFlagsBits,
  SelectMenuBuilder,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("son-deprem")
    .setDescription("Son 10 Deprem hakkında bilgi alırsınız!"),
  // komutu geliştirmek istersen guide: https://discordjs.guide/slash-commands/advanced-creation.html
  run: async (client, interaction) => {
    //sayfa sistemi yapmayı bilmediğim için bu şekilde yaptım tecrübeli bir arkadaş yardımcı olursa güncellerim
    const menu = new SelectMenuBuilder()
      .setCustomId("select")
      .setPlaceholder("Nothing selected")
      .addOptions(
        {
          label: "1",
          value: "1",
        },
        {
          label: "2",
          value: "2",
        },
        {
          label: "3",
          value: "3",
        },
        {
          label: "4",
          value: "4",
        },
        {
          label: "5",
          value: "5",
        },
        {
          label: "6",
          value: "6",
        },
        {
          label: "7",
          value: "7",
        },
        {
          label: "8",
          value: "8",
        },
        {
          label: "9",
          value: "9",
        },
        {
          label: "10",
          value: "10",
        }
      );
    axios({
      method: "get",
      url: "https://api.orhanaydogdu.com.tr/deprem/live.php?limit=1",
    }).then(function (response) {
      if (response.data.status === false)
        return interaction.reply("API Kaynaklı gösteremiyorum");

      const embed = new EmbedBuilder()
        .addFields(
          {
            name: "Tarih (TS)",
            value: `${response?.data?.result?.map((x) => x.date)}`,
          },
          {
            name: "Enlem (N)",
            value: `${response?.data?.result?.map((x) => x.lat)}`,
          },
          {
            name: "Boylam (E)",
            value: `${response?.data?.result?.map((x) => x.lng)}`,
          },
          {
            name: "Derinlik (KM)",
            value: `${response?.data?.result?.map((x) => x.depth)}`,
          },
          {
            name: "Büyüklük",
            value: `${response?.data?.result?.map((x) => x.mag)}`,
          },
          {
            name: "Yer",
            value: `${response?.data?.result?.map((x) => x.title)}`,
          }
        )
        .setColor(Colors.Red);
      interaction.deferReply();
      interaction.deleteReply();
      interaction.channel
        .send({
          embeds: [embed],
          components: [new ActionRowBuilder().addComponents(menu)],
        })
        .then(async (msg) => {
          const filter = (x) => x.user.id === interaction.user.id;
          const collector = interaction.channel.createMessageComponentCollector(
            {
              filter,
              time: 150000,
            }
          );

          collector.on("collect", (m) => {
            let choices = Number(m.values[0]);
            axios({
              method: "get",
              url: "https://api.orhanaydogdu.com.tr/deprem/live.php?limit=10",
            }).then(function (response) {
              if (response.data.status === false)
                return interaction.reply("API Kaynaklı gösteremiyorum");

              const embed = new EmbedBuilder()
                .addFields(
                  {
                    name: "Tarih (TS)",
                    value: `${response?.data?.result
                      ?.map((x) => x.date)
                      .slice(choices - 1, choices)}`,
                  },
                  {
                    name: "Enlem (N)",
                    value: `${response?.data?.result
                      ?.map((x) => x.lat)
                      .slice(choices - 1, choices)}`,
                  },
                  {
                    name: "Boylam (E)",
                    value: `${response?.data?.result
                      ?.map((x) => x.lng)
                      .slice(choices - 1, choices)}`,
                  },
                  {
                    name: "Derinlik (KM)",
                    value: `${response?.data?.result
                      ?.map((x) => x.depth)
                      .slice(choices - 1, choices)}`,
                  },
                  {
                    name: "Büyüklük",
                    value: `${response?.data?.result
                      ?.map((x) => x.mag)
                      .slice(choices - 1, choices)}`,
                  },
                  {
                    name: "Yer",
                    value: `${response?.data?.result
                      ?.map((x) => x.title)
                      .slice(choices - 1, choices)}`,
                  }
                )
                .setColor(Colors.Red);

              msg.edit({ embeds: [embed] });
              m.deferUpdate();
            });
          });

          collector.on("end", (collected) => {});
        });
    });
  },
};
