const { MessageButton } = require("discord.js");
const { MessageActionRow } = require("discord.js");
const { Client, CommandInteraction, MessageEmbed, Permissions } = require("discord.js");

module.exports = {
    name: "voice",
    description: "Sesli kanal ayarları",
    type: 1,
    //default_member_permissions: "",
    options: [
        {
            name: "ayarla",
            description:"Özel kanal sistemini ayarlarsınız",
            type: 2,
            options: [
                {
                    name: "kapat",
                    description: "Özel kanal sistemini kapatırsınız",
                    type: 1
                },
                {
                    name: "aç",
                    description: "Özel kanal sistemini açarsınız",
                    type: 1,
                    options: [
                        {
                            name: "kanal",
                            description: "katıl ve oluştur kanalı",
                            type: 7,
                            channel_types: [2],
                            required: true
                        }
                    ]
                },
            ],

        },
        {
            name: "isim",
            description: "Sesli odanın adını değiştirir",
            options: [
                {
                    name: "ad",
                    description: "Yeni sesli kanal adı",
                    type: 3,
                    required: true
                }],
            type: 1,
        },
        {
            name: "limit",
            description: "Sesli kanal kullanıcı limitini ayarlar",
            options: [
                {
                    name: "value",
                    description: "Sesli kanal kullanıcı limiti (0 LİMİTİ KALDIRIR!)",
                    type: 4,
                    required: true
                }],
            type: 1,
        },
        {
            name: "davet",
            description: "Seçtiğiniz kişiyi sesli kanala davet eder",
            options: [
                {
                    name: "kullanıcı",
                    description: "Davet edilecek kişi",
                    type: 6,
                    required: true
                }],
            type: 1
        },
        {
            name: "genel",
            description: "Kanalı herkesi açık/kapalı hale getirir",
            options: [
                {
                    name: "durum",
                    description: "Kanalın durumu",
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: "açık",
                            value: "true"
                        },
                        {
                            name: "kapalı",
                            value: "false"
                        }]
                }],
            type: 1
        },
        {
            name: "at",
            description: "Belirtilen kişiyi kanaldan atar",
            options: [
                {
                    name: "kullanıcı",
                    description: "Kanaldan atılacak kullanıcı",
                    type: 6,
                    required: true
                }],
            type: 1
        },
        {
            name: "yasakla",
            description: "Belirtilen kişiyi kanaldan uzaklaştırır",
            options: [
                {
                    name: "kullanıcı",
                    description: "Kanaldan uzaklaştırılacak kullanıcı",
                    type: 6,
                    required: true
                }],
            type: 1
        },
        {
            name: "yasak-kaldır",
            description: "Kanaldan yasağı kaldırılacak kullanıcı",
            options: [
                {
                    name: "kullanıcı",
                    description: "Kanaldan yasağı kaldırılacak kullanıcı",
                    type: 6,
                    required: true
                }],
            type: 1
        },
        {
            name: "sahiplen",
            description: "Kanalı Sahiplenirsiniz",
            options: [],
            type: 1
        }
    ],
    /**
     * 
     * @param {Client} client 
     * @param {CommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const sys = require("../models/guild");
        const model = require("../models/voice");
        const sbc = interaction.options.getSubcommand();

        switch (sbc) {
            case "aç": {
                if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD))
                    return interaction.reply("Bu komutu kullanmaya yetkin yok");

                const chl = interaction.options.getChannel("kanal");
                const seg = new sys(
                    {
                        GuildID: interaction.guild.id,
                        SysDurum: true,
                        j2tChannelId: chl.id
                    })
                seg.save();

                return interaction.reply("Özel oda sistemi aktif edildi");
            }
                break;
            case "kapat": {
                if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_GUILD))
                    return interaction.reply("Bu komutu kullanamazsın");

                await sys.deleteOne({ GuildID: interaction.guild.id });
                return interaction.reply("Özel oda sistemi pasif hale getirildi");
            }
                break;
        }
        const { SysDurum } = await sys.findOne({ GuildID: interaction.guild.id }) ? await sys.findOne({ GuildID: interaction.guild.id }) :
            { SysDurum: false };
        if (SysDurum == false) return interaction.reply({ content: "Bu sunucu için özel oda sistemi ayarlanmamış", ephemeral: true });
        const voiceCh = interaction.member.voice.channel;
        if (!voiceCh) return interaction.reply("Lütfen bir sisreli kanalak atılın!");

        const { channelId, memberId, owner } = await model.findOne({ channelId: voiceCh.id }) ? await model.findOne({ channelId: voiceCh.id }) : { channelId: null, memberId: null };

        switch (sbc) {

            case "isim": {
                if (voiceCh.id !== channelId) {
                    return interaction.reply({content:"Bu kanalda yapamazsın"});
                }
                if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)
                    && interaction.member.id !== owner) {
                    interaction.reply({content:"Bu kanal sana ait değil"});
                    return;
                }



                const newName = interaction.options.getString("ad");
                if (newName.length > 22 || newName.length < 1)
                    return interaction.reply({
                        embeds: [new MessageEmbed()
                            .setDescription("Kanal adı 1 ile 22 karakter arasında olmalıdır")
                            .setColor("RED")
                        ]
                    });

                voiceCh.edit({ name: `${newName}` });
                await interaction.reply({
                    embeds: [new MessageEmbed()
                        .setDescription(`Kanal adı \`${newName}\` olarak değiştirildi`)
                        .setColor("GREEN")
                    ]
                })
                break;
            }

            case "limit": {
                if ((!channelId || channelId !== voiceCh.id) && (interaction.member.id !== owner || interaction.member.id !== interaction.guild.ownerId))
                    return interaction.reply("Bu kanal sana ait değil");
                let newLimit = interaction.options.getInteger("value");
                if (newLimit < 0) newLimit = 0; //return interaction.reply({embeds:[new MessageEmbed().setDescription("Kanal kullanıcı limiti 0'dan küçük olamaz").setColor("RED")]});
                if (newLimit > 99) newLimit = 99;// return interaction.reply({embeds:[new MessageEmbed().setDescription("Kanal kullanıcı limiti 99'dan büyük olamaz").setColor("RED")]});
                voiceCh.edit({ userLimit: newLimit });
                interaction.reply({
                    embeds: [new MessageEmbed()
                        .setDescription(`Kanal kullanıcı limiti \`${newLimit}\` olarak değiştirildi`)
                        .setColor("GREEN")
                    ]
                });
                break;
            }

            case "davet": {
                if ((!channelId || channelId !== voiceCh.id) && (interaction.member.id !== owner || interaction.member.id !== interaction.guild.ownerId))
                    return interaction.reply("Bu kanal sana ait değil");
                const user = interaction.options.getMember("kullanıcı");
                if (user.id === interaction.member.id) return interaction.reply("kendini davet edemezsin");
                voiceCh.permissionOverwrites.edit(user.id, { CONNECT: true, SPEAK: true, STREAM: true, USE_VAD: true });
                interaction.reply({
                    embeds: [new MessageEmbed()
                        .setDescription(`${user} kullanıcısı davet edildi`)
                    ]
                })
                try {
                    await user.send(`${interaction.member} kullanıcısı seni sesli kanala davet etti. => ${voiceCh}`);
                }
                catch (e) { () => { } }
                break;
            }

            case "genel": {
                if ((!channelId || channelId !== voiceCh.id) && (interaction.member.id !== owner || interaction.member.id !== interaction.guild.ownerId))
                    return interaction.reply("Bu kanal sana ait değil");
                const status = interaction.options.getString("durum");
                if (status == "true") {
                    voiceCh.permissionOverwrites.edit(interaction.guild.id, { CONNECT: true, SPEAK: true, STREAM: true, USE_VAD: true });
                    interaction.reply({
                        embeds: [new MessageEmbed()
                            .setDescription(`Kanal **herkese açık** olarak değiştirildi`)
                        ]
                    });
                } else {
                    voiceCh.permissionOverwrites.edit(interaction.guild.id, { CONNECT: false, SPEAK: false, STREAM: false, USE_VAD: false });
                    interaction.reply({
                        embeds: [new MessageEmbed()
                            .setDescription(`Kanal **herkese kapalı** olarak değiştirildi`)
                        ]
                    });
                }
                break;
            }

            case "at": {
                if ((!channelId || channelId !== voiceCh.id) && (interaction.member.id !== owner || interaction.member.id !== interaction.guild.ownerId))
                    return interaction.reply("Bu kanal sana ait değil");
                const user = interaction.options.getMember("kullanıcı");
                const id = user.voice.channel ? user.voice.channel.id : null;

                if (user.id === interaction.member.id)
                    return interaction.reply({ embeds: [new MessageEmbed().setDescription("Bunu kendinde kullanamazsın").setColor("RED")] });

                if (id !== voiceCh.id)
                    return interaction.reply({ embeds: [new MessageEmbed().setDescription("Kullanıcı başka bir kanalda").setColor("RED")] });

                user.voice.disconnect();
                interaction.reply({ embeds: [new MessageEmbed().setDescription(`${user} isimli kullanıcı kanaldan atıldı`)] })
                break;
            }

            case "yasakla": {
                if ((!channelId || channelId !== voiceCh.id) && (interaction.member.id !== owner || interaction.member.id !== interaction.guild.ownerId))
                    return interaction.reply("Bu kanal sana ait değil");
                const user = interaction.options.getMember("kullanıcı");
                if (user.id === interaction.member.id)
                    return interaction.reply({ embeds: [new MessageEmbed().setDescription("Bunu kendinde kullanamazsın").setColor("RED")] });

                const id = user.voice.channel ? user.voice.channel.id : null;
                if (id !== voiceCh.id)
                    return interaction.reply({ embeds: [new MessageEmbed().setDescription("Kullanıcı başka bir kanalda").setColor("RED")] });
                voiceCh.permissionOverwrites.edit(user.id, { CONNECT: false, VIEW_CHANNEL: false, SPEAK: false, STREAM: false, USE_VAD: false });
                user.voice.disconnect();
                interaction.reply({ embeds: [new MessageEmbed().setDescription(`${user} isimli kullanıcı kanaldan yasaklandı`)] })
                break;
            }
            case "yasak-kaldır": {
                if ((!channelId || channelId !== voiceCh.id) && (interaction.member.id !== owner || interaction.member.id !== interaction.guild.ownerId))
                    return interaction.reply("Bu kanal sana ait değil");
                const user = interaction.options.getMember("kullanıcı");
                if (user.id === interaction.member.id) return interaction.reply("Bunu kendinde kullanamazsın");
                voiceCh.permissionOverwrites.edit(user.id, { CONNECT: true, VIEW_CHANNEL: true, SPEAK: true, STREAM: true, USE_VAD: true });
                interaction.reply({ embeds: [new MessageEmbed().setDescription(`${user} isimli kullanıcının yasağı kaldırıldı`)] })
                break;
            }
            case "sahiplen": {
                const r = require("../models/request.js");
                if (!owner) {
                    await model.updateOne({ channelId: voiceCh.id }, { memberId: interaction.member.id, owner: interaction.member.id });
                    interaction.reply({ content: "Artık bu kanalın sahibisin!" })
                    return;
                }
                if (interaction.member.id == owner) return interaction.reply({ content: "Zaten bu kanalın sahibisin", ephemeral: true });
                interaction.reply({ content: "Bu kanal zaten sahiplenilmiş. Lütfen kanal sahibinin sahiplenme isteğini yanıtlanasını bekleyin, Eğer kabul ederse yeni sahip siz olacaksınız." });
                try {
                    interaction.guild.members.cache.get(memberId).send({
                        embeds: [new MessageEmbed().setDescription(`${interaction.member} kullanıcısı ${voiceCh} kanalını sahiplenmek istiyor`)],
                        components: [new MessageActionRow().addComponents(new MessageButton().setLabel("Kabul Et").setStyle("SUCCESS").setCustomId("kabuledildi"), new MessageButton().setLabel("Reddet").setStyle("DANGER").setCustomId("reddet"))]
                    });
                    await r.updateOne({ kanalId: channelId }, { guildId: interaction.guild.id, isteyen: interaction.member.id }, { upsert: true });
                }
                catch {
                    interaction.channel.send({ content: "Bu kallnıcıya özel mesaj gönderemiyorum" })
                }
                break;
            }
        }
    }
}