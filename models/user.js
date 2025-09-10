import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, default: "" },
  numberPhone: { type: String, default: "" },
  fullName: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isLocked: { type: Boolean, default: false }
});

const User = mongoose.model("User", UserSchema);

export default User;
