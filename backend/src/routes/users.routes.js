// backend/src/routes/users.routes.js
import { Router } from "express";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Shop from "../models/Shop.js";
import { auth } from "../middleware/auth.js";

const router = Router();

/**
 * Actualizar perfil propio (nombre, teléfono, ciudad).
 * Nota: no permite cambiar role ni shop desde aquí.
 */
router.put("/me", auth(), async (req, res) => {
  try {
    const { name, phone, city } = req.body;

    const updates = {};
    if (typeof name === "string") updates.name = name;
    if (typeof phone === "string") updates.phone = phone;
    if (typeof city === "string") updates.city = city;

    const user = await User.findByIdAndUpdate(
      req.user._id,                           // 👈 asegúrate de usar _id
      { $set: updates },
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
      shop: user.shop || null,
    });
  } catch (e) {
    res.status(500).json({ message: "No se pudo actualizar el perfil" });
  }
});

/**
 * Cambiar contraseña
 */
router.put("/me/password", auth(), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Faltan datos" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Contraseña actual incorrecta" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Contraseña actualizada" });
  } catch (e) {
    res.status(500).json({ message: "No se pudo cambiar la contraseña" });
  }
});

/**
 * Seed: crear ADMIN global (una vez)
 * POST /api/users/seed-admin?key=SEED_KEY
 */
router.post("/seed-admin", async (req, res) => {
  try {
    if (req.query.key !== process.env.SEED_KEY) {
      return res.status(403).json({ message: "No autorizado" });
    }
    const email = "admin@vmotion.cl";
    const exists = await User.findOne({ email });
    if (exists) return res.json({ ok: true, message: "Admin ya existe", email });

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

/**
 * Seed (GET helper): crear ADMIN global
 * GET /api/users/seed-admin?key=SEED_KEY
 */
router.get("/seed-admin", async (req, res) => {
  try {
    if (req.query.key !== process.env.SEED_KEY) {
      return res.status(403).json({ message: "No autorizado" });
    }
    const email = "admin@vmotion.cl";
    const exists = await User.findOne({ email });
    if (exists) return res.json({ ok: true, message: "Admin ya existe", email });

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

/**
 * Seed: crear usuario de TALLER (rol "shop") asociado a un Shop existente.
 * GET /api/users/seed-shop-user?key=SEED_KEY[&shopId=<id>]
 *
 * - Si pasas shopId, lo asocia a ese shop.
 * - Si no, toma el primer shop que exista en la BD.
 * - Crea (o reutiliza) el usuario taller@vmotion.cl / Taller1234!
 */
router.get("/seed-shop-user", async (req, res) => {
  try {
    if (req.query.key !== process.env.SEED_KEY) {
      return res.status(403).json({ message: "No autorizado" });
    }

    // 1) Buscar el shop a asociar
    let shop;
    if (req.query.shopId) {
      shop = await Shop.findById(req.query.shopId);
      if (!shop) return res.status(404).json({ message: "Shop no encontrado" });
    } else {
      shop = await Shop.findOne();
      if (!shop) return res.status(404).json({ message: "No hay shops creados" });
    }

    // 2) Si ya existe el usuario, devolverlo
    const email = "taller@vmotion.cl";
    let user = await User.findOne({ email });
    if (user) {
      // si existe pero no tiene shop, lo asociamos
      if (!user.shop) {
        user.shop = shop._id;
        user.role = "shop";
        await user.save();
      }
      return res.json({
        ok: true,
        message: "Usuario shop ya existe",
        email,
        pass: "Taller1234!",
        shop: shop._id,
      });
    }

    // 3) Crear usuario nuevo
    const password = await bcrypt.hash("Taller1234!", 10);
    user = await User.create({
      name: `Cuenta Taller - ${shop.name}`,
      email,
      password,
      role: "shop",
      shop: shop._id,
    });

    res.json({
      ok: true,
      message: "Usuario de taller creado",
      email,
      pass: "Taller1234!",
      shop: shop._id,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "No se pudo crear usuario de taller" });
  }
});

export default router;
