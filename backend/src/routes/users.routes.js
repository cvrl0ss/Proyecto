// backend/src/routes/users.routes.js
import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Actualizar perfil (nombre, teléfono, ciudad)
router.put("/me", auth(), async (req, res) => {
  try {
    const { name, phone, city } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, phone, city } },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      city: user.city || "",
    });
  } catch {
    res.status(500).json({ message: "No se pudo actualizar el perfil" });
  }
});

// Cambiar contraseña
router.put("/me/password", auth(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Faltan datos" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Contraseña actual incorrecta" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Contraseña actualizada" });
  } catch {
    res.status(500).json({ message: "No se pudo cambiar la contraseña" });
  }
});

// Crea un admin por única vez
router.post("/seed-admin", async (req, res) => {
  try {
    if (req.query.key !== process.env.SEED_KEY) {
      return res.status(403).json({ message: "No autorizado" });
    }
    const email = "admin@vmotion.cl";
    const exists = await User.findOne({ email });
    if (exists) return res.json({ ok: true, message: "Admin ya existe" });

    const password = await bcrypt.hash("Admin1234!", 10);
    await User.create({
      name: "Administrador VMotion",
      email,
      password,
      role: "admin",
    });
    res.json({ ok: true, message: "Admin creado", email, pass: "Admin1234!" });
  } catch (e) {
    res.status(500).json({ message: "No se pudo crear admin" });
  }
});

export default router;
