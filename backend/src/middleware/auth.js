import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function auth(requiredRole) {
  return async (req, res, next) => {
    try {
      const token = (req.headers.authorization || "").replace("Bearer ", "");
      if (!token) return res.status(401).json({ message: "No token" });
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(payload.id).select("-password");
      if (!req.user) return res.status(401).json({ message: "Usuario inválido" });
      if (requiredRole && req.user.role !== requiredRole) {
        return res.status(403).json({ message: "Sin permisos" });
      }
      next();
    } catch {
      res.status(401).json({ message: "Token inválido" });
    }
  };
}
