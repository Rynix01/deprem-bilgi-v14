const {
  Client,
  Collection,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  Colors,
  WebhookClient,
} = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
  shards: "auto",
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Reaction,
    Partials.GuildScheduledEvent,
    Partials.User,
    Partials.ThreadMember,
  ],
});
const db = require("orio.db");
const config = require("./src/config.js");
const { readdirSync } = require("fs");
const moment = require("moment");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");

let token = config.token;

client.commands = new Collection();

const rest = new REST({ version: "10" }).setToken(token);

const log = (l) => {
  console.log(`[${moment().format("DD-MM-YYYY HH:mm:ss")}] ${l}`);
};

//command-handler
const commands = [];
readdirSync("./src/commands").forEach(async (file) => {
  const command = require(`./src/commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
});

client.on("ready", async () => {
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: commands,
    });
  } catch (error) {
    console.error(error);
  }
  log(`${client.user.username} Aktif Edildi!`);
});

//event-handler
readdirSync("./src/events").forEach(async (file) => {
  const event = require(`./src/events/${file}`);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
});

//nodejs-events
process.on("unhandledRejection", (e) => {
  console.log(e);
});
process.on("uncaughtException", (e) => {
  console.log(e);
});
process.on("uncaughtExceptionMonitor", (e) => {
  console.log(e);
});
//

client.login(token);
const axios = require("axios");
client.on("ready", async () => {
  axios({
    method: "get",
    url: "https://api.orhanaydogdu.com.tr/deprem/live.php?limit=1",
  }).then(function (response) {
    console.log(response?.data?.result);
    db.set("sondeprem", `${response?.data?.result?.map((x) => x.date)}`);

    setInterval(() => {
      axios({
        method: "get",
        url: "https://api.orhanaydogdu.com.tr/deprem/live.php?limit=1",
      }).then(function (response) {
        if (
          db.get("sondeprem") ===
          `${response?.data?.result?.map((x) => x.date)}`
        ) {
          console.log("Deprem olmadı");
        } else {
          if (response.data.status === false) return;
          let color =
            `${response?.data?.result?.map((x) => x.mag)}` > "3" &&
            `${response?.data?.result?.map((x) => x.mag)}` < "5"
              ? Colors.Yellow
              : `${response?.data?.result?.map((x) => x.mag)}` >= "5"
              ? Colors.Red
              : Colors.Green;
          const embed = new EmbedBuilder()
            .setTitle("Deprem Oldu!")
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
            .setColor(color)
            .setThumbnail(
              "https://cdn.discordapp.com/attachments/935097817763033109/1072570846759092295/deprem.png"
            );
          const veri = db.get("webhooks");
          if (!veri) return;
          veri.map((x) => {
            const webhookClient = new WebhookClient({
              url: `${x}`,
            });
            webhookClient.send({ embeds: [embed] }).catch(() => {});
          });

          db.set("sondeprem", `${response?.data?.result?.map((x) => x.date)}`);
        }
      });
    }, 60000);
  });
});
