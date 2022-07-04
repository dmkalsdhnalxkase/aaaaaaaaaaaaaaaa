const { MessageButton } = require("discord.js");
const { MessageEmbed, Client, CommandInteraction, MessageActionRow } = require("discord.js");
module.exports = {
    name: "istatistik",
    description: 'bot hakkında bilgiler',
    options: [],
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const embed = new MessageEmbed()
            .setTitle(`📊 ${client.user.username} İstatistikleri!`)
            .addField(`Bot Sahibi`, `<@586822327568695317> | Gweep Creative#0001`, false)

            
            
            .addField(`Gecikme süresi`, `\n${client.ws.ping.toLocaleString()}ms`, true)
            .addField(`Kullanıcı Sayısı`, `\n${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString()}`, true)
            .addField(`Sunucu Sayısı`, `${client.guilds.cache.size}`, true)

            .addField(`Komut Sayısı`, `${client.commands.length}`, true)
            
            
            .setThumbnail(client.user.avatarURL({ size: 1024, dynamic: true }))
            .setFooter({
                text: `${interaction.member.user.tag} tarafından istendi © 2022 Friday`,
                iconURL: interaction.member.user.avatarURL({ size: 1024, dynamic: true })
            })
            .setColor("BLUE");
        interaction.reply(
            {
                embeds: [embed],
            });

    }
};