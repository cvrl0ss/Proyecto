// frontend/src/services/vehicles.js
import api from "./api";

export const listMyVehicles = () => api.get("/vehicles/my");

export const createVehicle = (payload) =>
  api.post("/vehicles", {
    ...payload,
    plate: String(payload.plate || "").toUpperCase().replace(/[\s-]/g, ""),
    year: Number(payload.year),
    mileage: payload.mileage ? Number(payload.mileage) : 0,
  });

export const updateVehicle = (id, payload) =>
  api.put(`/vehicles/${id}`, {
    ...payload,
    ...(payload.plate ? { plate: String(payload.plate).toUpperCase().replace(/[\s-]/g, "") } : {}),
    ...(payload.year ? { year: Number(payload.year) } : {}),
    ...(payload.mileage != null ? { mileage: Number(payload.mileage) } : {}),
  });

export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);
