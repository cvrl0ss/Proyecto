import jwt from "jsonwebtoken";
import User from "../models/User.js";

export function auth(requiredRole) {
  return async (req, res, next) => {
    try {
      const token = (req.headers.authorization || "").replace("Bearer ", "");
      if (!token) return res.status(401).json({ message: "No token" });

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select("-password");
      if (!user) return res.status(401).json({ message: "Usuario inválido" });

      // chequeo de rol flexible: string o array
      if (requiredRole) {
        const ok = Array.isArray(requiredRole)
          ? requiredRole.includes(user.role)
          : user.role === requiredRole;

        if (!ok) return res.status(403).json({ message: "Sin permisos" });
      }

      req.user = user;
      next();
    } catch {
      res.status(401).json({ message: "Token inválido" });
    }
  };
}

