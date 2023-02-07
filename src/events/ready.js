const { ActivityType } = require("discord.js");
module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    let activities = [`Developed by Rynix#6302`, `Geçmiş Olsun Türkiyem`],
      i = 0;
    setInterval(
      () =>
        client.user.setActivity({
          name: `${activities[i++ % activities.length]}`,
          type: ActivityType.Listening,
        }),
      22000
    );
  },
};
