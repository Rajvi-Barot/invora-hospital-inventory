const mongoose = require("mongoose");

const responseSchema = new mongoose.Schema({
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
    enum: ["accepted", "rejected", "pending"],
    default: "pending"
  },
  message: {
    type: String,
    default: ""
  },
  respondedAt: {
    type: Date
  }
}, { _id: false });

const emergencyRequestSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["blood", "supplies", "doctor"],
    required: true
  },

  urgency: {
    type: String,
    enum: ["critical", "high", "medium", "low"],
    default: "high"
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  quantity: {
    type: String
  },

  fromHospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true
  },

  toHospitals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital"
    }
  ],

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "dispatched"],
    default: "pending"
  },

  responses: [responseSchema]

}, { timestamps: true });

module.exports = mongoose.model("EmergencyRequest", emergencyRequestSchema);