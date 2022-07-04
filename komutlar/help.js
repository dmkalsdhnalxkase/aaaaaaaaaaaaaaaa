const { MessageEmbed,Client,CommandInteraction } = require("discord.js");
module.exports = {
    name:"yardım",
    description: 'yardım menüsü',
    type:1,
    options:[],
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        let s = true;
     const embed = new MessageEmbed()
     .setTitle("📘 Voice Player Commands Menu!")
     .addField("/voice ayarla", "Özel oda sistemini aktif eder",s)
     .addField("/voice kapat", "Özel oda sistemini kapatır",s)
     .addField("/voice ad", "Kanal adını değiştirir",s)
     .addField("/voice limit", "Kanal limitini dğeiştirir",s)
     .addField("/voice davet", "Belirlediğiniz kullanıcıyı kanala davet eder",s)
     .addField("/voice genel", "Kanalı herkse aktif/pasif eder",s)
     .addField("/voice at", "Kullanıcıyı kanaldan atar",s)
     .addField("/voice yasakla", "Kullanıcıyı kanaldan yasaklar",s)
     .addField("/voice yasak-kaldır", "Kullanıcının yasağını kaldırır",s)
     .addField("/voice sahiplen", "Kanalı sahiplenir",s)
     .addField("/ping", "Botun Gecikme süresi", s)
     .addField("/istatistik", "Bot hakkında bilgiler", s)
    .setThumbnail(client.user.avatarURL({size:1024,dynamic:true}))
    .setFooter({
        text: `${interaction.member.user.tag} tarafından istendi © 2022 by Gweep Creative`,
        iconURL: interaction.member.user.avatarURL({size:1024,dynamic:true})
    })

     interaction.reply({embeds:[embed]});
      
}
};