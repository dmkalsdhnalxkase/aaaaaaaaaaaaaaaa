const mongoose = require("mongoose");

const voicedSh = new mongoose.Schema({
    memberId: String,
    channelId: String,
    owner: String,
   });
   
   module.exports = mongoose.model("voices", voicedSh);