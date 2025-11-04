import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "client"], default: "client" },
    phone: { type: String, default: "" },
   city:  { type: String, default: "" },
  // si es admin de taller:
  shop:    { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
