const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true
    },

    entity: {
      type: String,
      enum: ["Hospital", "Room", "Rack", "Bin", "Order"],
      required: true
    },

    // entityName: {
    //   type: String,
    //   required: true
    // },

    user: {
      type: String,
      required: true
      // Optional improvement:
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "User"
    },

    details: {
      type: String
    },

    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("History", historySchema);