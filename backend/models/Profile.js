const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  hospital: { type: String, required: true },
  role: { type: String, default: 'Nurse' }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;