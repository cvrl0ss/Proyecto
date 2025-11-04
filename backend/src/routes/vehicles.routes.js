import { Router } from "express";
import { auth } from "../middleware/auth.js";
import Vehicle from "../models/Vehicle.js";

const router = Router();

/**
 * GET /api/vehicles/my
 * Lista los vehículos del usuario logueado
 */
router.get("/my", auth(), async (req, res) => {
  try {
    const list = await Vehicle.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(list);
  } catch (e) {
    res.status(500).json({ message: "No se pudo cargar la lista de vehículos." });
  }
});

/**
 * POST /api/vehicles
 * Crea un vehículo para el usuario logueado
 */
router.post("/", auth(), async (req, res) => {
  try {
    const { plate, brand, model, year, city, mileage, color } = req.body;

    if (!plate || !brand || !model || !year || !city) {
      return res.status(400).json({ message: "Faltan datos obligatorios." });
    }

    const doc = await Vehicle.create({
      owner: req.user.id,
      plate: String(plate).toUpperCase().replace(/[\s-]/g, ""),
      brand,
      model,
      year: Number(year),
      city,
      mileage: mileage ? Number(mileage) : 0,
      color: color || undefined,
    });

    res.status(201).json(doc);
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Esa patente ya existe para este usuario." });
    }
    res.status(500).json({ message: "No se pudo crear el vehículo." });
  }
});

/**
 * PUT /api/vehicles/:id
 * Actualiza un vehículo del usuario
 */
router.put("/:id", auth(), async (req, res) => {
  try {
    const { id } = req.params;
    const payload = { ...req.body };

    if (payload.plate) {
      payload.plate = String(payload.plate).toUpperCase().replace(/[\s-]/g, "");
    }
    if (payload.year) payload.year = Number(payload.year);
    if (payload.mileage !== undefined && payload.mileage !== null) {
      payload.mileage = Number(payload.mileage);
    }

    const updated = await Vehicle.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      payload,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Vehículo no encontrado." });
    res.json(updated);
  } catch (e) {
    if (e?.code === 11000) {
      return res.status(409).json({ message: "Esa patente ya existe para este usuario." });
    }
    res.status(500).json({ message: "No se pudo actualizar el vehículo." });
  }
});

/**
 * DELETE /api/vehicles/:id
 * Elimina un vehículo del usuario
 */
router.delete("/:id", auth(), async (req, res) => {
  try {
    const { id } = req.params;
    const out = await Vehicle.findOneAndDelete({ _id: id, owner: req.user.id });
    if (!out) return res.status(404).json({ message: "Vehículo no encontrado." });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: "No se pudo eliminar el vehículo." });
  }
});

export default router;
