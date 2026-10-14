const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Hospital = require("../models/Hospital");
const Room = require("../models/Rooms");
const Bin = require("../models/Bin");
const Profile = require("../models/Profile");
const Rack = require("../models/Rack");
const History = require("../models/History");
const Product = require("../models/Product");
const Order = require("../models/Order");
const EmergencyRequest = require("../models/EmergencyRequest");
// const RequestResponse = require("../models/RequestResponse");
const EmergencyResponse = require("../models/EmergencyResponse");


const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      msg: "Bad request. Please add email and password in the request body",
    });
  }

  const foundUser = await User.findOne({ email });
  if (!foundUser) {
    return res.status(400).json({ msg: "Bad credentials" });
  }

  if (new Date() > foundUser.passwordExpiresAt) {
    return res.status(403).json({
      msg: "Password expired. Please reset your password."
    });
  }

  const isMatch = await foundUser.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({ msg: "Bad password" });
  }
  const token = jwt.sign(
  { 
    id: foundUser._id, 
    name: foundUser.name,
    role: foundUser.role,
    hospital: foundUser.hospital
  },
  process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
  return res.status(200).json({
    msg: "user logged in",
    token,
    user: {
      id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      hospital: foundUser.hospital
    }
  });
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ msg: "User not found" });

  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  user.passwordExpiresAt = Date.now() + 90*24*60*60*1000;

  await user.save();

  res.json({ msg: "Password reset successful" });
};

const dashboard = async (req, res) => {
  const luckyNumber = Math.floor(Math.random() * 100);

  res.status(200).json({
    msg: `${req.user.name}`,
    secret: `Here is your authorized data, your lucky number is ${luckyNumber}`,
  });
};

const getAllUsers = async (req, res) => {
  let users = await User.find({});

  return res.status(200).json({ users });
};

const getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().populate("rooms"); // ← THIS IS REQUIRED
    res.status(200).json({ success: true, hospitals });
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    res.status(500).json({ success: false, error: "Failed to fetch hospitals" });
  }
};


const addHospital = async (req, res) => {
  try {
    const { name, location, beds, contact } = req.body;

    if (!name || !location || beds === undefined || !contact) {
      return res.status(400).json({ msg: "All fields required" });
    }

    const hospital = await Hospital.create({
      name,
      location,
      beds,
      contact
    });

    res.status(201).json({ hospital });

  } catch (error) {
    console.error(error);
    res.status(400).json({ msg: error.message });
  }
};

const register = async (req, res) => {
  try {

    const { name, email, password, role, hospital } = req.body;

    if (!name || !email || !password || !hospital) {
      return res.status(400).json({
        msg: "Name, email, password and hospital are required"
      });
    }

    const foundUser = await User.findOne({ email });

    if (foundUser) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    const person = new User({
      name,
      email,
      password,
      role: role || "nurse",
      hospital
    });

    await person.save();

    res.status(201).json({ person });

  } catch (err) {

    console.error("Error in register:", err);
    res.status(500).json({ msg: "Server error" });

  }
};

// const register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const foundUser = await User.findOne({ email });

//     if (foundUser) {
//       return res.status(400).json({ msg: "Email already in use" });
//     }

//     if (!name || !email || !password) {
//       return res.status(400).json({ msg: "Please add all values in the request body" });
//     }
//     const person = new User({
//       name: name,
//       email,
//       password,
//       role: role || "nurse", // default to 'nurse' if not provided
//       hospital
//     });

//     await person.save();

//     return res.status(201).json({ person });
//   } catch (err) {
//     console.error("Error in register:", err);
//     return res.status(500).json({ msg: "Server error" });
//   }
// };

const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, error: "Hospital not found" });
    }
    res.json({ success: true, hospital });
  } catch (error) {
    console.error("Fetch Error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch hospital" });
  }
};

const updateHospital = async (req, res) => {
  try {
    const updatedHospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: "Hospital updated successfully", updatedHospital });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ success: false, error: "Failed to update hospital" });
  }
};

const deleteHospital = async (req, res) => {
  try {
    await Hospital.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Hospital deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ success: false, error: "Failed to delete hospital" });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("hospital", "name");

    const formattedRooms = rooms.map(room => ({
      _id: room._id,
      name: room.name,
      hospital: room.hospital?.name,
      floor: room.floor,
      type: room.type,
      status: room.status,
      inventory: room.inventory
    }));

    res.status(200).json({ rooms: formattedRooms });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const addRoom = async (req, res) => {
  try {
    const { name, hospital, floor, type, status, inventory } = req.body;

    const hospitalDoc = await Hospital.findOne({
      name: { $regex: `^${hospital}$`, $options: "i" }
    });

    if (!hospitalDoc) {
      return res.status(400).json({ msg: "Hospital not found" });
    }

    const room = await Room.create({
      name,
      hospital: hospitalDoc._id,
      floor,
      type,
      status,
      inventory
    });

    const populatedRoom = await room.populate("hospital", "name");

    res.status(201).json({
      room: {
        _id: populatedRoom._id,
        name: populatedRoom.name,
        hospital: populatedRoom.hospital.name,
        floor: populatedRoom.floor,
        type: populatedRoom.type,
        status: populatedRoom.status,
        inventory: populatedRoom.inventory
      }
    });

  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const { hospital } = req.body;

    let updateData = { ...req.body };

    if (hospital) {
      const hospitalDoc = await Hospital.findOne({ name: hospital });
      if (!hospitalDoc) {
        return res.status(400).json({ msg: "Hospital not found" });
      }
      updateData.hospital = hospitalDoc._id;
    }

    const room = await Room.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("hospital", "name");

    res.status(200).json({
      room: {
        _id: room._id,
        name: room.name,
        hospital: room.hospital.name,
        floor: room.floor,
        type: room.type,
        status: room.status,
        inventory: room.inventory
      }
    });

  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Room deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch products" });
  }
};


const getAllRacks = async (req, res) => {
  try {
    const racks = await Rack.find().populate("room", "name");

    const formatted = racks.map(r => ({
      _id: r._id,
      name: r.name,
      room: r.room?.name,
      capacity: r.capacity,
      used: r.used,
      status: r.status,
      type: r.type
    }));

    res.status(200).json({ racks: formatted });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

const addRack = async (req, res) => {
  try {
    const { name, room, capacity, used, status, type } = req.body;

    const roomDoc = await Room.findOne({
      name: { $regex: `^${room}$`, $options: "i" }
    });

    if (!roomDoc) {
      return res.status(400).json({ msg: "Room not found" });
    }

    const rack = await Rack.create({
      name,
      room: roomDoc._id,
      capacity,
      used,
      status,
      type
    });

    const populated = await rack.populate("room", "name");

    res.status(201).json({
      rack: {
        _id: populated._id,
        name: populated.name,
        room: populated.room.name,
        capacity: populated.capacity,
        used: populated.used,
        status: populated.status,
        type: populated.type
      }
    });

  } catch (error) {
    console.log("Rack Error:", error);
    res.status(400).json({ msg: error.message });
  }
};

const updateRack = async (req, res) => {
  try {
    let updateData = { ...req.body };

    if (req.body.room) {
      const roomDoc = await Room.findOne({
        name: { $regex: `^${req.body.room}$`, $options: "i" }
      });

      if (!roomDoc) {
        return res.status(400).json({ msg: "Room not found" });
      }

      updateData.room = roomDoc._id;
    }

    const rack = await Rack.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("room", "name");

    res.status(200).json({
      rack: {
        _id: rack._id,
        name: rack.name,
        room: rack.room.name,
        capacity: rack.capacity,
        used: rack.used,
        status: rack.status,
        type: rack.type
      }
    });

  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const deleteRack = async (req, res) => {
  try {
    await Rack.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Rack deleted" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const getAllBins = async (req, res) => {
  try {
    const bins = await Bin.find().populate("rack", "name");

    const formatted = bins.map(b => ({
      _id: b._id,
      label: b.label,
      rack: b.rack?.name || "",
      contents: b.contents,
      temperature: b.temperature,
      quantity: b.quantity
    }));

    res.status(200).json({ bins: formatted });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch bins" });
  }
};

const createBin = async (req, res) => {
  try {
    const { label, rack, contents, temperature, quantity } = req.body;

    const rackDoc = await Rack.findOne({ name: rack });
    if (!rackDoc) {
      return res.status(400).json({ msg: "Rack not found" });
    }

    const bin = await Bin.create({
      label,
      rack: rackDoc._id,
      contents,
      temperature,
      quantity
    });

    res.status(201).json({ bin });
  } catch (err) {
    res.status(400).json({ msg: "Failed to create bin", error: err.message });
  }
};

const updateBin = async (req, res) => {
  try {
    const { label, rack, contents, temperature, quantity } = req.body;

    let rackId;

    if (rack) {
      const rackDoc = await Rack.findOne({ name: rack });
      if (!rackDoc) return res.status(400).json({ msg: "Rack not found" });
      rackId = rackDoc._id;
    }

    const bin = await Bin.findByIdAndUpdate(
      req.params.id,
      {
        label,
        rack: rackId,
        contents,
        temperature: Number(temperature),
        quantity: Number(quantity)
      },
      { new: true }
    );

    if (bin.quantity < 10) {

      const existingDraft = await Order.findOne({
        "items.productId": bin._id,
        status: "Draft"
      });

      if (!existingDraft) {

        const product = await Product.findOne({ name: bin.contents });

        await Order.create({
          user: "System",
          hospital: "Auto Generated",
          department: "Inventory",
          items: [{
            productId: product?._id,
            name: bin.contents,
            price: product?.price || 0,
            quantity: 20
          }],
          totalAmount: (product?.price || 0) * 20,
          status: "Draft",
          autoGenerated: true
        });

      }
    }

    res.status(200).json({ bin });

  } catch (err) {
    console.error(err);
    res.status(400).json({ msg: "Failed to update bin" });
  }
};

const deleteBin = async (req, res) => {
  try {
    await Bin.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Bin deleted" });
  } catch (err) {
    res.status(400).json({ msg: "Failed to delete bin" });
  }
};

const getHospitalsWithID = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, error: "Hospital not found" });
    }

    res.json({ success: true, hospital });
  } catch (error) {
    console.error("Error fetching hospital:", error);
    res.status(500).json({ success: false, error: "Failed to fetch hospital" });
  }
}

const getRoomsForHospital = async (req, res) => {
  try {
    const rooms = await Room.find({ hospital: req.params.hospitalId });

    res.json({ success: true, rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ success: false, error: "Failed to fetch rooms" });
  }
}


const addBin = async (req, res) => {
  try {
    const { binNumber, color, items } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) return res.status(404).json({ success: false, error: "Room not found" });

    if (!["blue", "black", "green"].includes(color)) {
      return res.status(400).json({ success: false, error: "Invalid bin color" });
    }

    const newBin = new Bin({ binNumber, color, items, room: req.params.roomId });
    await newBin.save();

    res.status(201).json({ success: true, message: "Bin added successfully", bin: newBin });
  } catch (error) {
    console.error("Error adding bin:", error);
    res.status(500).json({ success: false, error: "Failed to add bin" });
  }
};

const getAllHistory = async (req, res) => {
  try {
    const logs = await History.find().sort({ timestamp: -1 });

    res.status(200).json({ history: logs });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch history" });
  }
};

const createHospitalWithRooms = async (req, res) => {
  try {
    const { name, address, phone, rooms } = req.body;

    if (!name || !address || !Array.isArray(rooms)) {
      return res.status(400).json({ success: false, error: "Invalid hospital or room data" });
    }

    const hospital = new Hospital({
      name,
      address,
      phone,
      user: req.user.id,
    });
    await hospital.save();

    const roomIds = [];
    for (const room of rooms) {
      const { name, floor, type } = room;
      if (!name || !floor || !type) continue;

      const newRoom = new Room({
        name,
        floor,
        type,
        hospital: hospital._id,
      });
      await newRoom.save();
      roomIds.push(newRoom._id);
    }

    hospital.rooms = roomIds;
    await hospital.save();

    res.status(201).json({ success: true, message: "Hospital and rooms created", hospital });
  } catch (error) {
    console.error("Error creating hospital with rooms:", error);
    res.status(500).json({ success: false, error: "Failed to create hospital and rooms" });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (address !== undefined) updateFields.address = address;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({ user });

  } catch (err) {
    console.error("UPDATE ERROR:", err.message);
    return res.status(500).json({ msg: "Update failed" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    return res.status(200).json({ msg: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ msg: "Server error" });
  }
};

const editUser = async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ msg: "User not found" });

    return res.status(200).json({ msg: "User updated", user: updated });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ msg: "Update failed" });
  }
};

const createOrder = async (req, res) => {
  try {
    const { user, hospital, department, items, totalAmount } = req.body;

    const order = await Order.create({
      user,
      hospital,
      department,
      items,
      totalAmount
    });

    await History.create({
      action: "CREATE",
      entity: "Order",
      entityName: `Order #${order._id.toString().slice(-6)}`,
      user: user,
      details: `Order placed for ${hospital} - ${department}`
    });

    res.status(201).json({ order });

  } catch (err) {
    console.log(err);
    res.status(400).json({
      msg: "Failed to create order",
      error: err.message
    });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    res.status(500).json({ msg: "Failed to fetch orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Draft', 'Pending', 'Approved', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ msg: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ msg: "Order not found" });
    }

    await History.create({
      action: "UPDATE",
      entity: "Order",
      entityName: `Order #${order._id.toString().slice(-6)}`,
      user: req.user ? req.user.id : "System",
      details: `Order status changed to ${status}`
    });

    res.status(200).json({ order });
  } catch (err) {
    console.error("Failed to update order status:", err);
    res.status(500).json({ msg: "Failed to update order status" });
  }
};

const getAllNurses = async (req, res) => {
  try {
    const nurses = await User.find({ role: "nurse" }).select("-password");
    res.status(200).json({ nurses });
  } catch (err) {
    res.status(500).json({ msg: "Failed to fetch nurses" });
  }
};

const createNurse = async (req, res) => {
  try {
    const { name, email, password, department, shift, status } = req.body;

    const nurse = new User({
      name,
      email,
      password,
      role: "nurse",
      department,
      shift,
      status
    });

    await nurse.save();

    res.status(201).json({ nurse });
  } catch (err) {
    res.status(500).json({ msg: "Failed to create nurse" });
  }
};

const updateNurse = async (req, res) => {
  try {
    const nurse = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select("-password");

    res.status(200).json({ nurse });
  } catch (err) {
    res.status(500).json({ msg: "Failed to update nurse" });
  }
};

const deleteNurse = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Nurse deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Failed to delete nurse" });
  }
};

const createEmergencyRequest = async (req, res) => {
  try {

    console.log("REQUEST BODY:", req.body);

    const {
      type,
      urgency,
      title,
      description,
      quantity,
      toHospitals
    } = req.body;

    // Get hospital from logged-in user
    const fromHospital = req.user.hospital;

    const request = await EmergencyRequest.create({

      type,
      urgency,
      title,
      description,
      quantity,

      fromHospital,

      toHospitals:
        Array.isArray(toHospitals)
          ? toHospitals
          : [],

      status: "pending",

      responses: [],

      createdAt: new Date()

    });

    res.status(201).json({
      success: true,
      request
    });

  } catch (error) {

    console.log(
      "CREATE REQUEST ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

// const createEmergencyRequest = async (req, res) => {
//   try {

//     console.log("REQUEST BODY:", req.body);

//     const {
//       type,
//       urgency,
//       title,
//       description,
//       quantity,
//       fromHospital,
//       toHospitals
//     } = req.body;

//     const request = await EmergencyRequest.create({
//       type,
//       urgency,
//       title,
//       description,
//       quantity,
//       fromHospital,

//       // IMPORTANT FIX
//       toHospitals:
//         Array.isArray(toHospitals)
//           ? toHospitals
//           : [],

//       status: "pending",
//       responses: [],
//       createdAt: new Date()
//     });

//     res.status(201).json({
//       success: true,
//       request
//     });

//   } catch (error) {

//     console.log(error);

//     res.status(500).json({
//       success: false,
//       message: "Failed to create request"
//     });

//   }
// };

const getEmergencyRequests = async (req, res) => {

  const hospitalId = req.user.hospital;

  // const requests = await EmergencyRequest.find()
  //   .populate("fromHospital", "name")
  //   .populate("toHospitals", "name")
  //   .populate("responses.hospital", "name");

  const requests = await EmergencyRequest.find({
    $or: [
      { toHospitals: { $size: 0 } },       // broadcast
      { toHospitals: hospitalId }          // specific hospital
    ]
  })
  .populate("fromHospital", "name")
  .populate("toHospitals", "name")
  .populate("responses.hospital", "name")
  .sort({ createdAt: -1 });

  res.json({ requests });

};

const respondEmergencyRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, message } = req.body;

    const request = await EmergencyRequest.findById(id);

    if (!request) {
      return res.status(404).json({ msg: "Request not found" });
    }

    request.responses.push({
      hospital: req.user.hospital,
      status,
      message,
      respondedAt: new Date()
    });

    if (status === "accepted") {
      request.status = "accepted";
    }

    await request.save();

    res.status(200).json({ msg: "Response recorded", request });

  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
};

const approveEmergencyRequest = async (req, res) => {

  try {

    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: "Approved",
        supplierHospital: req.user.hospital
      },
      { new: true }
    );

    res.status(200).json({ request });

  } catch (error) {

    res.status(500).json({ msg: "Failed to approve request" });

  }
};

const rejectEmergencyRequest = async (req, res) => {

  try {

    const request = await EmergencyRequest.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );

    res.status(200).json({ request });

  } catch (error) {

    res.status(500).json({ msg: "Failed to reject request" });

  }
};

const respondToRequest = async (req, res) => {

  const { status, message } = req.body;

  const request = await EmergencyRequest.findById(req.params.id);

  request.responses.push({
    hospital: req.user.hospital,
    responder: req.user.id,
    status,
    message,
    respondedAt: new Date()
  });

  if (status === "accepted") {
    request.status = "accepted";
  }

  await request.save();

  res.json({ request });

};

const getEmergencyResponses = async (req, res) => {

  try {

    const responses = await EmergencyResponse.find({

      request: req.params.id

    })
    .populate("hospital", "name")
    .populate("responder", "name");

    res.status(200).json({ responses });

  } catch (error) {

    res.status(500).json({
      msg: "Failed to fetch responses"
    });

  }

};

module.exports = {
  login,
  register,
  resetPassword,
  dashboard,
  getAllUsers,
  getAllHospitals,
  addHospital,
  getHospitalById,
  updateHospital,
  deleteHospital,
  getAllRooms,
  getHospitalsWithID,
  getRoomsForHospital,
  getAllBins,
  addBin,
  createHospitalWithRooms,
  getProfile,
  updateProfile,
  deleteUser,
  editUser,
  addRoom,
  updateRoom,
  deleteRoom,
  getAllRacks,
  addRack,
  updateRack,
  deleteRack,
  createBin,
  updateBin,
  deleteBin,
  getAllBins,
  getAllHistory,
  getAllProducts,
  createOrder,
  getOrders,
  updateOrderStatus,
  getAllNurses,
  createNurse,
  deleteNurse,
  updateNurse,
  createEmergencyRequest,
  getEmergencyRequests,
  approveEmergencyRequest,
  rejectEmergencyRequest,
  respondToRequest,
  getEmergencyResponses,
  respondEmergencyRequest
};