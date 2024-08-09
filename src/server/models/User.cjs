const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  isInside: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
