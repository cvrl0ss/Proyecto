// frontend/src/services/users.js
import api from "./api";

export const updateProfile = (payload) => api.put("/users/me", payload);
export const changePassword = (payload) => api.put("/users/me/password", payload);
