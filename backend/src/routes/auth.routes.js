import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vehicle from "../models/Vehicle.js";
import { auth } from "../middleware/auth.js";

const router = Router();

/** ================= REGISTRO NORMAL ================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email = "", password, role } = req.body;

    const emailNorm = String(email).trim().toLowerCase();
    if (!name || !emailNorm || !password) {
      return res.status(400).json({ message: "Faltan datos de usuario." });
    }

    const exists = await User.findOne({ email: emailNorm });
    if (exists) return res.status(400).json({ message: "Email ya registrado" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: emailNorm,
      password: hash,
      role: role || "client",
    });

    res.status(201).json({ id: user._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al registrar usuario" });
  }
});

/** ============ REGISTRO CON VEHÍCULO ================= */
router.post("/register-with-vehicle", async (req, res) => {
  try {
    const { name, email = "", password, role, vehicle } = req.body;

    const emailNorm = String(email).trim().toLowerCase();
    if (!name || !emailNorm || !password) {
      return res.status(400).json({ message: "Faltan datos de usuario." });
    }
    if (
      !vehicle ||
      !vehicle.plate ||
      !vehicle.brand ||
      !vehicle.model ||
      !vehicle.year ||
      !vehicle.city
    ) {
      return res.status(400).json({ message: "Faltan datos del vehículo." });
    }

    const exists = await User.findOne({ email: emailNorm });
    if (exists) return res.status(400).json({ message: "Email ya registrado" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: emailNorm,
      password: hash,
      role: role || "client",
    });

    const normalizedVehicle = {
      ...vehicle,
      plate: String(vehicle.plate || "").toUpperCase().replace(/[\s-]/g, ""),
      year: Number(vehicle.year),
      mileage: vehicle.mileage ? Number(vehicle.mileage) : undefined,
      owner: user._id,
    };

    try {
      await Vehicle.create(normalizedVehicle);
      return res
        .status(201)
        .json({ message: "Cuenta y vehículo creados. Ahora inicia sesión." });
    } catch (e) {
      await User.deleteOne({ _id: user._id }).catch(() => {});
      if (e?.code === 11000) {
        return res.status(409).json({ message: "Ya existe un vehículo con esa patente." });
      }
      return res.status(500).json({ message: "No se pudo crear el vehículo." });
    }
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ message: "No se pudo registrar la cuenta con vehículo." });
  }
});

/** ====================== LOGIN ======================= */
router.post("/login", async (req, res) => {
  try {
    const { email = "", password } = req.body;

    const emailNorm = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "dev-secret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email,
        shop: user.shop || null,  // PANEL DE TALLER
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

/** ===================== PERFIL ====================== */
router.get("/me", auth(), async (req, res) => {
  res.json(req.user);
});

export default router;
