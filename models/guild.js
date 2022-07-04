const mongoose = require("mongoose");

const guildSh = new mongoose.Schema({
    GuildID: String,
    SysDurum: Boolean,
    j2tChannelId: String,
   });
   
   module.exports = mongoose.model("guild", guildSh);