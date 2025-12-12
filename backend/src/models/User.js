import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
     role: { type: String, enum: ["admin", "client", "shop"], default: "client", index: true },
    phone: { type: String, default: "" },
   city:  { type: String, default: "" },
  // si es admin de taller:
    shop:  { type: mongoose.Schema.Types.ObjectId, ref: "Shop", default: null, index: true },
}, 
{ timestamps: true });

export default mongoose.model("User", userSchema);
