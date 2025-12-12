// src/services/shops.js
import api from "./api";

export const listShops  = (params = {}) => api.get("/shops", { params });
export const getShop    = (id) => api.get(`/shops/${id}`);
export const seedShops  = (key = "") => api.get(`/shops/seed${key ? `?key=${encodeURIComponent(key)}` : ""}`);

// NUEVO: perfil del taller autenticado
export const getMyShop    = () => api.get("/shops/mine");                 // role: shop (o admin con ?id=)
export const updateMyShop = (patch, adminShopId) =>
  api.put(`/shops/mine${adminShopId ? `?id=${adminShopId}` : ""}`, patch);
