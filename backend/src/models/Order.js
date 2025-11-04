import mongoose from "mongoose";

const { Schema, model, Types } = mongoose;

export const ORDER_STATUS = [
  "REQUESTED",     // cliente envía solicitud/cotización
  "CONTACTED",     // taller contactó al cliente
  "CHECKED_IN",    // vehículo ingresó al taller
  "IN_PROGRESS",   // en reparación
  "READY",         // listo para retirar
  "DELIVERED",     // entregado
  "CANCELED",      // cancelado
];

const timelineItemSchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUS, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const estimateSchema = new Schema(
  {
    amount: { type: Number, default: 0 }, // 130000
    breakdown: { type: String, default: "" }, // "Mano de obra: 200k\nRepuestos: 350k"
    currency: { type: String, default: "CLP" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
  title: String,
  description: String,
  contactPhone: String,
  status: { type: String, default: "REQUESTED" },
  timeline: [
    { status: String, note: String, createdAt: { type: Date, default: Date.now } }
  ],
  // 👇 AGREGA ESTO AQUÍ
  photos: [
    {
      url: String,           // /uploads/123-foto.jpg
      originalName: String,  // nombre original
      size: Number,          // tamaño en bytes
      mimeType: String       // image/jpeg, image/png, etc.
    }
  ],
}, { timestamps: true });

// helper para empujar una etapa al timeline
orderSchema.methods.pushStatus = function (status, note = "") {
  this.status = status;
  this.timeline.push({ status, note });
};

export default mongoose.model("Order", orderSchema);

