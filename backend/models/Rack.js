const mongoose = require("mongoose");

const rackSchema = new mongoose.Schema({
  name: { type: String, required: true },

  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Room",
    required: true
  },

  capacity: {
    type: Number,
    required: true,
    min: 0
  },

  used: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["Active", "Maintenance"],
    default: "Active"
  },

  type: {
    type: String,
    default: "General"
  }

}, { timestamps: true });

module.exports = mongoose.model("Rack", rackSchema);

// const mongoose = require("mongoose");

// const rackSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true
//     },

//     room: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Room",
//       required: true
//     },

//     capacity: {
//       type: Number,
//       required: true,
//       min: 0
//     },

//     used: {
//       type: Number,
//       default: 0,
//       min: 0
//     },

//     status: {
//       type: String,
//       enum: ["Active", "Maintenance"],
//       default: "Active"
//     },

//     type: {
//       type: String,
//       enum: ["Medication", "Surgical", "Emergency", "General", "Cold Storage"],
//       required: true
//     }
//   },
//   { timestamps: true }
// );

// // Virtual field for available space
// rackSchema.virtual("available").get(function () {
//   return this.capacity - this.used;
// });

// module.exports = mongoose.model("Rack", rackSchema);