// backend/src/models/Order.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Lista de estados válidos de la orden
export const ORDER_STATUS = [
  "REQUESTED",     // cliente envía solicitud/cotización
  "CONTACTED",     // taller contactó al cliente
  "CHECKED_IN",    // vehículo ingresó al taller
  "IN_PROGRESS",   // en reparación
  "READY",         // listo para retirar
  "DELIVERED",     // entregado
  "CANCELED",      // cancelado
];

// Elemento del timeline de la orden
const timelineItemSchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUS, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now }, // fecha y hora del cambio
  },
  { _id: false }
);

// Comentario/mensaje del cliente
const clientMessageSchema = new Schema(
  {
    text: { type: String, required: true },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

// Estructura del presupuesto estimado
const estimateSchema = new Schema(
  {
    amount: { type: Number, default: 0 },     // monto estimado
    breakdown: { type: String, default: "" }, // detalle en texto
    currency: { type: String, default: "CLP" },
  },
  { _id: false }
);

// Esquema principal de la orden de servicio
const orderSchema = new Schema(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shop: { type: Schema.Types.ObjectId, ref: "Shop", required: true },
    vehicle: { type: Schema.Types.ObjectId, ref: "Vehicle" },

    // Mensajes que el cliente envía al taller
    clientMessages: [clientMessageSchema],

    title: String,
    description: String,
    contactPhone: String,

    status: {
      type: String,
      enum: ORDER_STATUS,
      default: "REQUESTED",
    },

    // Duración estimada en horas (completado por el taller)
    etaHours: { type: Number },

    // Presupuesto estimado
    estimate: estimateSchema,

    // Historial de estados / notas
    timeline: [timelineItemSchema],

    // Fotos del cliente y del taller
    photos: [
      {
        url: String,          // ruta del archivo, por ejemplo /uploads/123-foto.jpg
        originalName: String, // nombre original del archivo
        size: Number,         // tamaño en bytes
        mimeType: String,     // image/jpeg, image/png, etc.
      },
    ],

    // Calificación que deja el cliente al finalizar el servicio
    clientRating: { type: Number, min: 1, max: 5 }, // número de estrellas
    clientReview: { type: String, default: "" },    // comentario opcional
  },
  { timestamps: true }
);

// Método helper para cambiar estado y agregar al timeline
orderSchema.methods.pushStatus = function (status, note = "") {
  this.status = status;
  this.timeline.push({ status, note });
};

export default model("Order", orderSchema);
