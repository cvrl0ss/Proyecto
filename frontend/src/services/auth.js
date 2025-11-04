import api from "./api";

// login
export const login = (email, password) => api.post("/auth/login", { email, password });

// registrar usuario + vehículo de una
export const registerWithVehicle = (payload) =>
  api.post("/auth/register-with-vehicle", payload);

// opcional: quién soy
export const me = () => api.get("/auth/me");

// utilitario de token, por si lo usas
export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}
export function auth(requiredRoles) {
  const roles = Array.isArray(requiredRoles) ? requiredRoles
              : requiredRoles ? [requiredRoles] : null;

  return async (req, res, next) => {
    try {
      const token = (req.headers.authorization || "").replace("Bearer ", "");
      if (!token) return res.status(401).json({ message: "No token" });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(payload.id).select("-password");
      if (!req.user) return res.status(401).json({ message: "Usuario inválido" });

      if (roles && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Sin permisos" });
      }
      next();
    } catch {
      res.status(401).json({ message: "Token inválido" });
    }
  };
}
