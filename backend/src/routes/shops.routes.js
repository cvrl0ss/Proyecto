import { Router } from "express";
import Shop from "../models/Shop.js";
import { auth } from "../middleware/auth.js";

const router = Router();

/** ---------- SEED (dev) ---------- */
const seed = async (_req, res) => {
  try {
    await Shop.deleteMany({});
    const docs = await Shop.insertMany([
      {
        name: "Taller Los Pinos",
        city: "Santiago",
        address: "Av. Siempre Viva 123",
        phone: "+56 9 1111 1111",
        rating: 4.6,
        services: [
          { name: "Cambio de aceite", basePrice: 25000 },
          { name: "Frenos (revisión)", basePrice: 40000 },
        ],
      },
      {
        name: "Mecánica Rápida",
        city: "Santiago",
        address: "Los Olmos 456",
        phone: "+56 2 2222 2222",
        rating: 4.2,
        services: [
          { name: "Neumáticos (par)", basePrice: 120000 },
          { name: "Batería", basePrice: 70000 },
        ],
      },
      {
        name: "Torque Pro",
        city: "Valparaíso",
        address: "Cerro Alegre 21",
        phone: "+56 32 333 3333",
        rating: 4.8,
        services: [
          { name: "Diagnóstico computarizado", basePrice: 35000 },
          { name: "Alineación y balanceo", basePrice: 45000 },
        ],
      },
    ]);
    res.json({ ok: true, count: docs.length });
  } catch {
    res.status(500).json({ message: "No se pudo sembrar" });
  }
};
router.post("/seed", seed);
router.get("/seed", seed);

/** ---------- PERFIL DEL TALLER AUTENTICADO ---------- */
router.get("/mine", auth(), async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const shopId = isAdmin ? (req.query.id || req.user.shop) : req.user.shop;

    if (!shopId) {
      return res.status(404).json({ message: "El usuario no tiene taller asignado" });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ message: "Taller no encontrado" });
    res.json(shop);
  } catch {
    res.status(500).json({ message: "Error al obtener el taller" });
  }
});

router.put("/mine", auth(), async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const shopId = isAdmin ? (req.query.id || req.user.shop) : req.user.shop;

    if (!shopId) {
      return res.status(404).json({ message: "El usuario no tiene taller asignado" });
    }

    const { name, city, address, phone, services } = req.body || {};
    const updates = {};
    if (name) updates.name = name;
    if (city) updates.city = city;
    if (address) updates.address = address;
    if (phone) updates.phone = phone;
    if (Array.isArray(services)) updates.services = services;

    const shop = await Shop.findByIdAndUpdate(shopId, { $set: updates }, { new: true });
    if (!shop) return res.status(404).json({ message: "Taller no encontrado" });
    res.json(shop);
  } catch {
    res.status(500).json({ message: "No se pudo actualizar el taller" });
  }
});

/** ---------- LISTA / DETALLE PÚBLICO ---------- */
router.get("/", async (req, res) => {
  try {
    const { q = "", city = "" } = req.query;
    const filter = {};
    if (q) filter.name = { $regex: q, $options: "i" };
    if (city) filter.city = { $regex: `^${city}$`, $options: "i" };
    const items = await Shop.find(filter).sort({ name: 1 }).limit(100);
    res.json(items);
  } catch {
    res.status(500).json({ message: "No se pudo listar los talleres." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ message: "Taller no encontrado" });
    res.json(shop);
  } catch {
    res.status(500).json({ message: "Error al obtener el taller" });
  }
});

export default router;
