const { Client, CommandInteraction, ButtonInteraction, MessageEmbed,Message, MessageButton, MessageActionRow } = require("discord.js");
const fs = require("fs");

/**
 * 
 * @param {Client} client 
 * @param {CommandInteraction} interaction 
 * @param {ButtonInteraction} button
 */
module.exports = async (client, interaction, button) => {
  if (interaction.isCommand()) {
    try {
      fs.readdir("./komutlar/", (err, files) => {
        if (err) throw err;

        files.forEach(async (f) => {
          const command = require(`../komutlar/${f}`);
          if (
            interaction.commandName.toLowerCase() === command.name.toLowerCase()
          ) {
            return command.run(client, interaction);
          }
        });
      });
    } catch (err) {
      console.error(err);
    }
  }

  if (interaction.isButton()) {
    const model = require("../models/voice");
    const r = require("../models/request")
    const { customId, user, client, message } = interaction;

    const { channelId } = await model.findOne({ memberId: user.id }) ? await model.findOne({ memberId: user?.id }) : { channelId: null };
    if (!channelId) return interaction.reply({ content: "Aktifive bulunamadı" });
    const { guildId, kanalId, isteyen } = await r.findOne({ kanalId: channelId })
    if (customId == "kabuledildi") {
      await model.updateOne({ memberId: user.id }, { owner: isteyen, memberId: isteyen });
      interaction.update({
        components:[
        new MessageActionRow()
        .addComponents(
          new MessageButton()
          .setLabel(`istek kabul edildi`)
          .setStyle('SUCCESS')
          .setCustomId('onayke')
          .setDisabled(true)
          )
      ]
      })
      await client.guilds.cache.get(guildId).members.cache.get(isteyen).send({ content: `Sahiplenme isteğiniz kabul edildi! artık <#${kanalId}> kanalının sahibisin!` })
        .then(async () => { await r.deleteOne({ kanalId }) })
        .catch(() => { });
    }
    else if (customId == "reddet") {
      interaction.update({
        components:[
        new MessageActionRow()
        .addComponents(
          new MessageButton()
          .setLabel(`istek reddedildi`)
          .setStyle('DANGER')
          .setCustomId('kesinred')
          .setDisabled(true)
          )
      ]
      })
      client.guilds.cache.get(guildId).members.cache.get(isteyen).send({ content: `Sahiplenme isteğiniz reddedildi` })
        .then(async () => { await r.deleteOne({ kanalId }) })
        .catch(() => { });
    }
  }

};

