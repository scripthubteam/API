const { Schema, model } = require("mongoose");

const botSchema = new Schema({
  ownerId: {
    type: String
  },
  botId: {
    type: String
  },
  nQueue: {
    type: Number
  },
  prefix: {
    type: String
  },
  approvedDate: {
    type: Number,
    default: 0
  },
  info: {
    type: String,
    default: "Un bot simple"
  },
  certified: {
    type: Boolean,
    default: false
  },
  requested: {
    type: Number
  },
  votes: {
    type: Array,
    default: []
  },
  votes_plus: {
    type: Number,
    default: 0
  },
  votes_negative: {
    type: Number,
    default: 0
  }
});

module.exports = model("bots", botSchema);
