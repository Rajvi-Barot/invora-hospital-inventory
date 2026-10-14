const express = require("express");
const router = express.Router();
const multer = require("multer");
const User = require("../models/User");
const SensorReading = require("../models/SensorReading");

// const { login,register, dashboard, getAllUsers, getAllHospitals, addHospital, getHospitalById, updateHospital, deleteHospital, getAllRooms, getHospitalsWithID, getRoomsForHospital, getAllBins, addBin, createHospitalWithRooms, getProfile, deleteUser, editUser, addRoom, updateRoom, deleteRoom, getAllRacks, deleteRack, updateRack, addRack, createBin, updateBin, deleteBin, getAllHistory, getAllProducts, createOrder, updateProfile, getAllNurses, createNurse, deleteNurse, updateNurse, getOrders, updateOrderStatus} = require("../controllers/user");
const {
  // Auth
  login,
  register,
  dashboard,
  getProfile,
  updateProfile,
  resetPassword,

  // Users
  getAllUsers,
  editUser,
  deleteUser,

  // Hospitals
  getAllHospitals,
  getHospitalById,
  getHospitalsWithID,
  addHospital,
  updateHospital,
  deleteHospital,
  createHospitalWithRooms,

  // Rooms
  getAllRooms,
  getRoomsForHospital,
  addRoom,
  updateRoom,
  deleteRoom,

  // Racks
  getAllRacks,
  addRack,
  updateRack,
  deleteRack,

  // Bins
  getAllBins,
  addBin,
  createBin,
  updateBin,
  deleteBin,

  // Products / Inventory
  getAllProducts,
  getAllHistory,

  // Orders
  createOrder,
  getOrders,
  updateOrderStatus,

  // Nurses
  getAllNurses,
  createNurse,
  updateNurse,
  deleteNurse,

  //Emergency Requests
  createEmergencyRequest,
  getEmergencyRequests,
  getEmergencyResponses,
  respondEmergencyRequest,

} = require("../controllers/user");

const authMiddleware = require('../middleware/auth')
const Leave = require("../models/LeaveRequest");
const Alert = require("../models/Alert");

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/dashboard").get(authMiddleware, dashboard);
router.route("/users").get(getAllUsers);
router.put("/reset-password", resetPassword);
// router.route("/hospitals").get(getAllHospitals);
 
// GET all hospitals
router.route("/hospitals")
  .get(getAllHospitals)
  .post(addHospital);

// Single hospital routes
router.route("/hospitals/:id")
  .get(getHospitalById)
  .put(updateHospital)
  .delete(deleteHospital);

router.route("/rooms")
  .get(getAllRooms)
  .post(addRoom);

router.route("/rooms/:id")
  .put(updateRoom)
  .delete(deleteRoom);

router.route("/racks")
  .get(getAllRacks)
  .post(addRack);

router.route("/racks/:id")
  .put(updateRack)
  .delete(deleteRack);

router.route("/bins")
  .get(getAllBins)
  .post(createBin);

router.route("/bins/:id")
  .put(updateBin)
  .delete(deleteBin);

router.get("/history", getAllHistory);
router.get("/products", getAllProducts);
router.post("/orders", createOrder);
router.get("/orders", getOrders);
router.put("/orders/:id/status", updateOrderStatus);


router.get("/nurses", authMiddleware, getAllNurses);
router.post("/nurses", authMiddleware, createNurse);
router.put("/nurses/:id", authMiddleware, updateNurse);
router.delete("/nurses/:id", authMiddleware, deleteNurse);

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

router.put(
  "/upload-profile-pic",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No file uploaded" });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePic: req.file.filename },
        { new: true }
      );

      return res.status(200).json({ user }); // ✅ IMPORTANT return

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      return res.status(500).json({ msg: "Upload failed" });
    }
  }
);

router.get("/latest", async (req, res) => {
  try {
    const reading = await SensorReading.findOne().sort({ timestamp: -1 });
    res.json(reading);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/leave", async (req, res) => {
  try {
    const { nurseId, nurseName, from, to, reason } = req.body;

    if (!nurseId || !from || !to || !reason) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const leave = await Leave.create({
      nurseId,
      nurseName,
      from,
      to,
      reason,
      status: "PENDING"
    });

    await Alert.create({
      type: "LEAVE_REQUEST",
      referenceId: nurseId,
      message: `${nurseName} submitted a leave request`
    });

    res.status(201).json({ message: "Leave request submitted", leave });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/leave/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["APPROVED", "DECLINED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    await Alert.updateMany(
      {
        type: "LEAVE_REQUEST",
        referenceId: leave.nurseId,
        resolved: false
      },
      { resolved: true }
    );

    res.json({ message: "Leave updated", leave });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/leaves", async (req, res) => {
  try {
    const leaves = await Leave.find().sort({ createdAt: -1 });
    res.json({ leaves });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/hospitals/:hospitalId/rooms", authMiddleware, getRoomsForHospital);
router.get("/rooms/:roomId/bins", authMiddleware, getAllBins);
router.post("/rooms/:roomId/bins", authMiddleware, addBin);
router.delete("/bins/:binId", authMiddleware, deleteBin);
// router.get("/bins", authMiddleware, getAllBins); 
router.post("/with-rooms", authMiddleware, createHospitalWithRooms);
router.delete('/users/:id', deleteUser);
router.put('/users/:id', editUser);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

router.post("/emergency-requests", authMiddleware, createEmergencyRequest);
router.get("/emergency-requests", authMiddleware, getEmergencyRequests);
router.post(
  "/emergency-requests/:id/respond",
  authMiddleware,
  respondEmergencyRequest
);
// router.post("/emergency-requests/:id/respond", authMiddleware, respondToEmergencyRequest);
// router.get("/emergency-requests/:id/responses", authMiddleware, getEmergencyResponses);

// router.put("/emergency-requests/:id/approve", authMiddleware, approveEmergencyRequest);
// router.put("/emergency-requests/:id/reject", authMiddleware, rejectEmergencyRequest);

module.exports = router;