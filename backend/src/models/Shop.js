import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  basePrice: { type: Number, required: true, min: 0 }
}, { _id: false });

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  services: { type: [serviceSchema], default: [] }
}, { timestamps: true });

export default mongoose.model("Shop", shopSchema);
