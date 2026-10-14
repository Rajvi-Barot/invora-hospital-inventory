const mongoose = require("mongoose");

const binSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true
    },

    rack: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rack",
      required: true
    },

    contents: {
      type: String,
      required: true
    },

    temperature: {
      type: Number,
      required: true
    },

    quantity: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bin", binSchema);