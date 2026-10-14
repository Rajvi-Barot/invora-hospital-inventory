const mongoose = require("mongoose");

const requestResponseSchema = new mongoose.Schema({

  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmergencyRequest"
  },

  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital"
  },

  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["Accepted", "Rejected"],
    required: true
  },

  message: String

}, { timestamps: true });

module.exports = mongoose.model("RequestResponse", requestResponseSchema);