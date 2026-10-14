const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");

// ✅ GET all unresolved alerts (for admin bell)
router.get("/", async (req, res) => {
  try {
    const alerts = await Alert.find({ resolved: false })
      .sort({ createdAt: -1 });

    res.status(200).json({ alerts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Mark alert as resolved
router.patch("/:id/resolve", async (req, res) => {
  try {
    await Alert.findByIdAndUpdate(req.params.id, { resolved: true });

    res.status(200).json({ message: "Alert resolved" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;