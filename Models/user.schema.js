import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: String,
  emailid: String,
  password: String,
  resetPasswordToken: String,
  resetPasswordTokenExpiry: String,
});

const userModel = mongoose.model("userModel", userSchema);

export default userModel;
