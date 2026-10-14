const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 50
  },

  email: {
    type: String,
    required: [true, "Please provide email"],
    minlength: 3,
    maxlength: 50,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    unique: true,
  },

  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 3
  },

  role: {
    type: String,
    enum: ['admin', 'nurse'],
    default: 'nurse'
  },

  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "hospital",
    required: true
  },
  phone: {
    type: String,
    match: [/^\d{3,15}$/, "Invalid phone number"]
  },

  address: {
    type: String,
    maxlength: 200
  },
  profilePic: {
    type: String,
    default: ""
  },
  department: String,

  shift: String,
  
  status: {
    type: String,
    enum: ["Active", "On Leave"],
    default: "Active"
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  passwordExpiresAt: {
    type: Date,
    default: () => Date.now() + 90 * 24 * 60 * 60 * 1000
}

}, { timestamps: true });

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {

  const isMatch = await bcrypt.compare(candidatePassword, this.password);

  return isMatch;

};

module.exports = mongoose.model("User", UserSchema);

// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const UserSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: [true, 'Please provide name'],
//     minlength: 3,
//     maxlength: 50
//   },

//   email: {
//     type: String,
//     required: [true, "Please provide email"],
//     minlength: 3,
//     maxlength: 50,
//     match: [
//       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
//       'Please provide a valid email',
//     ],
//     unique: true,
//   },

//   password: {
//     type: String,
//     required: [true, 'Please provide password'],
//     minlength: 3
//   },

//   role: {
//     type: String,
//     enum: ['admin', 'nurse'],
//     default: 'nurse'
//   },

//   department: String,

//   shift: String,
  
//   status: {
//     type: String,
//     enum: ["Active", "On Leave"],
//     default: "Active"
//   }
// }, { timestamps: true });

// UserSchema.pre("save", async function () {
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// UserSchema.methods.comparePassword = async function (candidatePassword) {
//   const isMatch = await bcrypt.compare(candidatePassword, this.password);
//   return isMatch;
// };

// module.exports = mongoose.model("User", UserSchema);