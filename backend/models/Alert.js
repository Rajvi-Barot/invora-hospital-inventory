const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["UNSAFE", "LEAVE_REQUEST"],
  },
  referenceId: String,
  message: String,
  resolved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Alert", alertSchema);

// const mongoose = require("mongoose");

// const alertSchema = new mongoose.Schema({
//   type: {
//     type: String,
//     enum: ["UNSAFE", "LEAVE_REQUEST"],
//   },
//   message: String,
//   referenceId: String, // sensorId or nurseId
//   timestamp: {
//     type: Date,
//     default: Date.now,
//   },
//   resolved: {
//     type: Boolean,
//     default: false,
//   },
// });

// module.exports = mongoose.model("Alert", alertSchema);