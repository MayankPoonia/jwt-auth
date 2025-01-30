const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    lowercase: true,
    enum: ["student", "faculty", "admin"],
  },
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Prevent unnecessary re-hashing
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
