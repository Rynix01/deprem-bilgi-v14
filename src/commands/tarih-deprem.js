const {
  EmbedBuilder,
  PermissionsBitField,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  WebhookClient,
  SelectMenuBuilder,
  PermissionFlagsBits,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("deprem")
    .setDescription("Girdiğiniz tarihe ait 10 deprem gösterir!")
    .addStringOption((option) =>
      option.setName("tarih").setDescription("Bir tarih girin Örn: 2022-02-21")
    ), // komutu geliştirmek istersen guide: https://discordjs.guide/slash-commands/advanced-creation.html
  run: async (client, interaction) => {
    const tarih = interaction.options.getString("tarih");
    const x = new Date(tarih);
    const y = new Date();
    const z = new Date("2017-01-01");
    if (`${x}` === "Invalid Date")
      return interaction.reply("Lütfen geçerli bir tarih girin.");
    if (x > y) {
      interaction.reply("Geleceği göremem");
    } else if (x < z) {
      interaction.reply("01 01 2017'den itibaren görebilirsiniz.");
    } else {
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
        url: `https://api.orhanaydogdu.com.tr/deprem/index.php?date=${tarih}&limit=1`,
      }).then(function (response) {
        let color =
          `${response?.data?.result?.map((x) => x.mag)}` > "3" &&
          `${response?.data?.result?.map((x) => x.mag)}` < "5"
            ? Colors.Yellow
            : `${response?.data?.result?.map((x) => x.mag)}` > "5"
            ? Colors.Red
            : Colors.Green;
        if (response.data.status === false)
          return interaction.reply(
            "Deprem bilgisi bulunamadı veya API kaynaklı sorun yaşandı"
          );

        const embed = new EmbedBuilder()
          .addFields(
            {
              name: "Tarih (TS)",
              value: `${response?.data?.result?.map((x) => x.date)}`,
            },
            {
              name: "Koordinatlar ",
              value: `${response?.data?.result?.map(
                (x) => x.geojson.coordinates
              )}`,
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
          .setColor(color);
        interaction.deferReply();
        interaction.deleteReply();
        interaction.channel
          .send({
            embeds: [embed],
            components: [new ActionRowBuilder().addComponents(menu)],
          })
          .then(async (msg) => {
            const filter = (x) => x.user.id === interaction.user.id;
            const collector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 150000,
              });

            collector.on("collect", (m) => {
              let choices = Number(m.values[0]);
              axios({
                method: "get",
                url: `https://api.orhanaydogdu.com.tr/deprem/index.php?date=${tarih}&limit=10`,
              }).then(function (response) {
                let color =
                  `${response?.data?.result
                    ?.map((x) => x.mag)
                    .slice(choices - 1, choices)}` > "3" &&
                  `${response?.data?.result
                    ?.map((x) => x.mag)
                    .slice(choices - 1, choices)}` < "5"
                    ? Colors.Yellow
                    : `${response?.data?.result
                        ?.map((x) => x.mag)
                        .slice(choices - 1, choices)}` > "5"
                    ? Colors.Red
                    : Colors.Green;
                const embed = new EmbedBuilder()
                  .addFields(
                    {
                      name: "Tarih (TS)",
                      value: `${response?.data?.result
                        ?.map((x) => x.date)
                        .slice(choices - 1, choices)}`,
                    },
                    {
                      name: "Koordinatlar ",
                      value: `${response?.data?.result?.map(
                        (x) => x.geojson.coordinates
                      )}`,
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
                  .setColor(color);

                msg.edit({ embeds: [embed] });
                m.deferUpdate();
              });
            });

            collector.on("end", (collected) => {});
          });
      });
    }
  },
};
