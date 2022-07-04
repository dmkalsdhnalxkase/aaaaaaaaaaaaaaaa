const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const mongoose = require("mongoose");
const fs = require("fs");
const { Client, Collection,VoiceState } = require('discord.js');
const client = new Client({ intents: 647 });


    const token = "";
    const mongoDB ="";


mongoose.connect(mongoDB)
    .then(() => console.log("MongoDB Bağlantısı Başarılı"))
    .catch((e) => console.log("MongoDB Bağlantısı Başarısız, Hata: " + e));

client.j2c = new Collection();
global.client = client;
client.commands = (global.commands = []);

fs.readdir("./komutlar/", (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        let props = require(`./komutlar/${file}`);

        client.commands.push({
            name: props.name.toLowerCase(),
            description: props.description,
            options: props.options,
            type: props.type,
        })
        console.log(`👌 Slash Komut Yüklendi: ${props.name}`);
    });
});
fs.readdir("./events/", (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];

        console.log(`👌 Event yüklendi: ${eventName}`);
        client.on(eventName, (...args) => {
            event(client, ...args);
        });
    });
});
/**
 * @param {VoiceState} oldState
 * @param {VoiceState} newState
 */

client.on("voiceStateUpdate", async (oldState, newState) => {
    const sys = require("./models/guild");
    const model = require("./models/voice");
    const { SysDurum, j2tChannelId } = await sys.findOne({ GuildID: newState.guild.id }) ? await sys.findOne({ GuildID: newState.guild.id }) :
        { SysDurum: false, j2tChannelId: null };
    if (SysDurum == false) return;


    const { member, guild } = newState;
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;
    const jtc = j2tChannelId;

    const {channelId, memberId} = await model.findOne({channelId: oldChannel?.id}) ? await model.findOne({channelId: oldChannel.id}) : {channelId: null};

    if (oldChannel && channelId && oldChannel.id === channelId && (!newChannel || newChannel.id !== channelId)) {

        if (oldChannel.members.size == 0) {
            await oldChannel.delete();
            await model.deleteOne({ channelId: oldChannel.id });
            return;
        }
        if(!oldChannel.members.has(memberId))
        return await model.updateOne({ channelId: oldChannel.id }, { owner: null });
    }

    if (newChannel && oldChannel !== newChannel && newChannel.id === jtc) {
        const voiceChannel = await guild.channels.create(member.user.tag, {
            type: "GUILD_VOICE",
            userLimit: 3,
            parent: newChannel.parent,
            permissionOverwrites: [
                { id: member.id, allow: ["CONNECT", "SPEAK", "STREAM", "USE_VAD"] },
                { id: guild.id, deny: ["CONNECT"] }
            ]
        });


        new model(
            {
                memberId: member.id,
                channelId: voiceChannel.id,
                owner: member.id
            }).save();
        client.j2c.set(member.id, voiceChannel.id);
        return member.voice.setChannel(voiceChannel);
    }


});

client.on("ready", async () => {
    console.log("Ready!");
    client.user.setActivity("Join 2 Create!", { type: "LISTENING" });
    const rest = new REST({ version: "10" }).setToken(token);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), {
            body: commands,
        });
    } catch (error) {
        console.error(error);
    }
});

client.login(token);