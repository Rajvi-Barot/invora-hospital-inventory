const mongoose = require("mongoose");

const nurseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    department: {
      type: String,
      required: true
    },

    shift: {
      type: String,
      enum: ["Day", "Night", "Rotating"],
      required: true
    },

    status: {
      type: String,
      enum: ["Active", "On Leave"],
      default: "Active"
    },

    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Nurse", nurseSchema);