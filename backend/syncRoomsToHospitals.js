const mongoose = require("mongoose");
const Hospital = require("./models/Hospital");
const Room = require("./models/Rooms");

const MONGO_URI = "mongodb://localhost:27017/YOUR_DB_NAME"; // Replace with your DB name

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

(async () => {
  try {
    const hospitals = await Hospital.find();

    for (const hospital of hospitals) {
      const rooms = await Room.find({ hospital: hospital._id });
      hospital.rooms = rooms.map((room) => room._id);
      await hospital.save();
      console.log(`Updated ${hospital.name} with ${rooms.length} rooms`);
    }

    console.log("✅ All hospitals updated with their rooms.");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    mongoose.disconnect();
  }
})();