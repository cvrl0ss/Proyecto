// backend/src/models/Vehicle.js
import mongoose from "mongoose";

const VehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plate: { type: String, required: true }, // se normaliza a MAYÚSCULAS sin espacios/guiones
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year:  { type: Number, required: true },
    city:  { type: String, required: true },
    mileage: { type: Number, default: 0 },
    color: { type: String }
  },
  { timestamps: true }
);

// patente única por usuario
VehicleSchema.index({ owner: 1, plate: 1 }, { unique: true });

export default mongoose.model("Vehicle", VehicleSchema);
