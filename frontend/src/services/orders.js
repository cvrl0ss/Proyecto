// frontend/src/services/orders.js
import api from "./api";

// Crear orden (acepta FormData para fotos)
export function createOrder(data) {
  if (data instanceof FormData) {
    return api.post("/orders", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  return api.post("/orders", data);
}

// Cliente
export const listMyOrders = () => api.get("/orders/mine");
export const getOrder = (id) => api.get(`/orders/${id}`);

// Admin
export const adminListOrders = () => api.get("/orders");
export const adminUpdateOrder = (id, body) =>
  api.patch(`/orders/${id}`, body);

// Taller
export const shopListOrders = (params = {}) =>
  api.get("/orders/shop/mine", { params });
export const shopUpdateOrder = (id, body) =>
  api.patch(`/orders/${id}`, body);
export const shopUploadPhotos = (id, files) => {
  const fd = new FormData();
  for (const f of files) fd.append("photos", f);
  return api.post(`/orders/${id}/photos`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Cliente califica un servicio ya entregado
export const rateOrder = (id, rating, review = "") =>
  api.post(`/orders/${id}/rating`, { rating, review });

// Aliases legacy (si en algún lado viejo se usan)
export const listOrders = adminListOrders;
export const updateOrder = adminUpdateOrder;

// Cliente envía comentario/mensaje al taller
export function sendClientMessage(orderId, message) {
  return api.post(`/orders/${orderId}/message`, { message });
}
