const mongoose = require("mongoose");

const EmergencyResponseSchema = new mongoose.Schema({

  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EmergencyRequest",
    required: true
  },

  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  responder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  status: {
    type: String,
    enum: ["ACCEPTED", "REJECTED"],
    required: true
  },

  message: String

}, { timestamps: true });

module.exports = mongoose.model("EmergencyResponse", EmergencyResponseSchema);