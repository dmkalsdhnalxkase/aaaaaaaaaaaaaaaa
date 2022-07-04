const mongoose = require("mongoose");

const chSh = new mongoose.Schema({
    guildId: String,
    isteyen: String,
    kanalId: String
   });
   
   module.exports = mongoose.model("requests", chSh);