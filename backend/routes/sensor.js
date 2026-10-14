
const express = require("express");
const router = express.Router();
const SensorReading = require("../models/SensorReading");
const Alert = require("../models/Alert");

let lastSensorUpdate = Date.now();
let latestReading = null;

setInterval(async () => {
  const now = Date.now();

  const lastICU = await SensorReading
    .findOne({ sensorId: "ICU_SENSOR" })
    .sort({ timestamp: -1 });

  const lastBB = await SensorReading
    .findOne({ sensorId: "BLOOD_SENSOR" })
    .sort({ timestamp: -1 });

  if (lastICU && now - new Date(lastICU.timestamp).getTime() > 10000) {
    console.log("⚠ ICU SENSOR OFFLINE");
  }

  if (lastBB && now - new Date(lastBB.timestamp).getTime() > 10000) {
    console.log("⚠ BLOOD BANK SENSOR OFFLINE");
  }

}, 5000);

// POST /api/sensors
router.post("/", async (req, res) => {
  try {
    const { sensorId, binId, tempC } = req.body || {};

    if (!sensorId || !binId || tempC === undefined) {
      return res.status(400).json({ error: "Invalid sensor data" });
    }

    let status = "SAFE";
    if (tempC < 2 || tempC > 8) status = "UNSAFE";

    lastSensorUpdate = Date.now();

    const reading = await SensorReading.create({
      sensorId,
      binId,
      tempC,
      status
    });

    latestReading = reading;

    // ✅ Prevent duplicate UNSAFE alerts
    if (status === "UNSAFE") {
      const existingAlert = await Alert.findOne({
        type: "UNSAFE",
        referenceId: sensorId,
        resolved: false
      });

      if (!existingAlert) {
        await Alert.create({
          type: "UNSAFE",
          referenceId: sensorId,
          message: `${sensorId} temperature is out of safe range (2-8°C)`
        });
      }
    }

    // ✅ Auto resolve when sensor becomes SAFE
    if (status === "SAFE") {
      await Alert.updateMany(
        {
          type: "UNSAFE",
          referenceId: sensorId,
          resolved: false
        },
        { resolved: true }
      );
    }

    console.log("📡 Sensor Reading:", reading);

    res.status(201).json({ message: "Saved", status });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/latest/:sensorId", async (req, res) => {
  try {
    const reading = await SensorReading
      .findOne({ sensorId: req.params.sensorId })
      .sort({ timestamp: -1 });

    if (!reading) {
      return res.status(404).json({ message: "No data found" });
    }

    res.json(reading);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const SensorReading = require("../models/SensorReading");
// const Alert = require("../models/Alert");

// let lastSensorUpdate = Date.now();
// let latestReading = null;

// setInterval(async () => {
//   const now = Date.now();

//   const lastICU = await SensorReading
//     .findOne({ sensorId: "ICU_SENSOR" })
//     .sort({ timestamp: -1 });

//   const lastBB = await SensorReading
//     .findOne({ sensorId: "BLOOD_SENSOR" })
//     .sort({ timestamp: -1 });

//   if (lastICU && now - new Date(lastICU.timestamp).getTime() > 10000) {
//     console.log("⚠ ICU SENSOR OFFLINE");
//   }

//   if (lastBB && now - new Date(lastBB.timestamp).getTime() > 10000) {
//     console.log("⚠ BLOOD BANK SENSOR OFFLINE");
//   }

// }, 5000);

// // POST /api/sensors
// router.post("/", async (req, res) => {
//   try {
//     const { sensorId, binId, tempC } = req.body || {};

//     if (!sensorId || !binId || tempC === undefined) {
//       return res.status(400).json({ error: "Invalid sensor data" });
//     }

//     let status = "SAFE";
//     if (tempC < 2 || tempC > 8) status = "UNSAFE";

//     lastSensorUpdate = Date.now();

//     const reading = await SensorReading.create({
//       sensorId,
//       binId,
//       tempC,
//       status
//     });
//     latestReading = reading;

//     console.log("📡 Sensor Reading:", reading);

//     res.status(201).json({ message: "Saved", status });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// });

// router.get("/latest/:sensorId", async (req, res) => {
//   try {
//     const reading = await SensorReading
//       .findOne({ sensorId: req.params.sensorId })
//       .sort({ timestamp: -1 });

//     if (!reading) {
//       return res.status(404).json({ message: "No data found" });
//     }

//     res.json(reading);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;