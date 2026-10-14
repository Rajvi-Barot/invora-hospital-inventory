const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    location: {
      type: String,
      required: true
    },

    beds: {
      type: Number,
      required: true,
      min: 0
    },

    contact: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["safe", "low-stock", "unsafe"],
      default: "safe"
    },

    monitoredRooms: {
      type: Number,
      default: 0
    },

    lowStockCount: {
      type: Number,
      default: 0
    },

    unsafeRooms: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);
hospitalSchema.virtual("rooms", {
  ref: "Room",
  localField: "_id",
  foreignField: "hospital"
});

hospitalSchema.set("toObject", { virtuals: true });
hospitalSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Hospital", hospitalSchema);

// const mongoose = require("mongoose");

// const hospitalSchema = new mongoose.Schema({
//   hosp_name: { type: String, required: true },                  // "Central Hospital"
//   address: { type: String, required: true },               // "123 Main St"
//   phone: { type: String },                                 // "(212) 555-1234"
//   rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }], // Related rooms
//   dateCreated: { type: Date, default: Date.now },
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
// });

// module.exports = mongoose.model("Hospital", hospitalSchema);