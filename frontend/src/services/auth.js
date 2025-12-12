import api from "./api";

// login
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

// registrar usuario + vehículo
export const registerWithVehicle = (payload) =>
  api.post("/auth/register-with-vehicle", payload);

// quién soy
export const me = () => api.get("/auth/me");

// utilitario de token (opcional)
export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

