const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema({
  nurseId: String,
  nurseName: String,
  from: Date,
  to: Date,
  reason: String,
  status: {
    type: String,
    default: "PENDING"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Leave", leaveSchema);

// const leaveSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   from: Date,
//   to: Date,
//   reason: String,
//   status: { type: String, default: "pending" }
// }, { timestamps: true });