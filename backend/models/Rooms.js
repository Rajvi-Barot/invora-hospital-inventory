const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true
    },

    floor: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "ICU",
        "Operating",
        "Emergency",
        "General Ward",
        "Private Room",
        "Surgery Room"
      ],
      required: true
    },

    status: {
      type: String,
      enum: ["Operational", "Maintenance", "Inactive"],
      default: "Operational"
    },

    inventory: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);

// const mongoose = require("mongoose");

// const roomSchema = new mongoose.Schema({
//   name: { type: String, required: true },                  // "Operating Room 1"
//   floor: { type: String, required: true },                 // "1st Floor"
//   type: { type: String, required: true },                  // "Surgery"
//   isAvailable: { type: Boolean, default: true },
//   hospital: { type: mongoose.Schema.Types.ObjectId, ref: "Hospital", required: true }
// });

// module.exports = mongoose.model("Room", roomSchema);