const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
  sensorId: String,
  binId: String,
  tempC: Number,
  status: {
    type: String,
    enum: ["SAFE", "UNSAFE"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SensorReading", sensorSchema);
