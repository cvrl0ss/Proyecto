import api from "./api";

export const listShops = (params = {}) => api.get("/shops", { params });
export const getShop   = (id) => api.get(`/shops/${id}`);
export const seedShops = (key = "") => api.get(`/shops/seed${key ? `?key=${encodeURIComponent(key)}` : ""}`);
