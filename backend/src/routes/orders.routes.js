// backend/src/routes/orders.routes.js
import { Router } from "express";
import Order, { ORDER_STATUS } from "../models/Order.js";
import { auth } from "../middleware/auth.js";
import { uploadPhotos } from "../middleware/upload.js";

const router = Router();

/**
 * CLIENTE crea una solicitud/cotización (con o sin fotos)
 * POST /api/orders
 * body: { shopId, vehicleId?, title?, description, contactPhone, photos?[] }
 */
router.post("/", auth("client"), (req, res) => {
  uploadPhotos(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: err.message });

      const { shopId, vehicleId, title, description, contactPhone } = req.body;
      if (!shopId || !description) {
        return res.status(400).json({ message: "shopId y description son requeridos" });
      }

      const photos = (req.files || []).map(f => ({
        url: `/uploads/${f.filename}`,
        originalName: f.originalname,
        size: f.size,
        mimeType: f.mimetype,
      }));

      const order = new Order({
        customer: req.user._id,
        shop: shopId,
        vehicle: vehicleId || undefined,
        title,
        description,
        contactPhone,
        photos,
        status: "REQUESTED",
        timeline: [{ status: "REQUESTED", note: "Solicitud creada por el cliente" }],
      });

      await order.save();
      res.status(201).json(order);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "No se pudo crear la orden" });
    }
  });
});

/**
 * CLIENTE lista sus órdenes
 * GET /api/orders/mine
 */
router.get("/mine", auth("client"), async (req, res) => {
  try {
    const rows = await Order.find({ customer: req.user._id })
      .populate("shop", "name city")
      .populate("vehicle", "plate brand model year")
      .sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: "No se pudo listar tus órdenes" });
  }
});

/**
 * TALLER lista sus órdenes
 * GET /api/orders/shop/mine
 */
router.get("/shop/mine", auth(["shop"]), async (req, res) => {
  try {
    const rows = await Order.find({ shop: req.user.shop })
      .populate("customer", "name email")
      .populate("vehicle", "plate brand model year")
      .sort({ createdAt: -1 });
    res.json(rows);
  } catch {
    res.status(500).json({ message: "No se pudo listar" });
  }
});

/**
 * VER detalle (cliente dueño, shop dueño o admin)
 * GET /api/orders/:id
 */
router.get("/:id", auth(), async (req, res) => {
  try {
    const o = await Order.findById(req.params.id)
      .populate("shop", "name city")
      .populate("vehicle", "plate brand model year");
    if (!o) return res.status(404).json({ message: "Orden no encontrada" });

    // cliente solo su orden
    if (req.user.role === "client" && String(o.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: "Sin permisos" });
    }
    // taller solo su orden
    if (req.user.role === "shop" && String(o.shop) !== String(req.user.shop)) {
      return res.status(403).json({ message: "Sin permisos" });
    }

    res.json(o);
  } catch (e) {
    res.status(500).json({ message: "Error al obtener la orden" });
  }
});

/**
 * ADMIN lista todas
 * GET /api/orders
 */
router.get("/", auth("admin"), async (_req, res) => {
  try {
    const rows = await Order.find()
      .populate("customer", "name email")
      .populate("shop", "name city")
      .sort({ createdAt: -1 });
    res.json(rows);
  } catch {
    res.status(500).json({ message: "No se pudo listar" });
  }
});

/**
 * ADMIN o SHOP actualizan
 * PATCH /api/orders/:id
 */
router.patch("/:id", auth(["shop", "admin"]), async (req, res) => {
  try {
    const { status, estimate, etaHours, note, addPhoto } = req.body;
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: "Orden no encontrada" });

    // si es shop, debe ser su orden
    if (req.user.role === "shop" && String(o.shop) !== String(req.user.shop)) {
      return res.status(403).json({ message: "Sin permisos" });
    }

    if (status) {
      if (!ORDER_STATUS.includes(status)) {
        return res.status(400).json({ message: "Estado inválido" });
      }
      o.pushStatus(status, note || "");
    } else if (note) {
      o.timeline.push({ status: o.status, note });
    }

    if (typeof etaHours === "number") o.etaHours = etaHours;
    if (estimate && typeof estimate === "object") {
      o.estimate = {
        amount: estimate.amount ?? o.estimate?.amount ?? 0,
        breakdown: estimate.breakdown ?? o.estimate?.breakdown ?? "",
        currency: estimate.currency ?? o.estimate?.currency ?? "CLP",
      };
    }
    if (addPhoto) o.photos.push(addPhoto);

    await o.save();
    res.json(o);
  } catch (e) {
    res.status(500).json({ message: "No se pudo actualizar la orden" });
  }
});

/**
 * SHOP/ADMIN suben fotos de avance
 * POST /api/orders/:id/photos (multipart)
 */
router.post(
  "/:id/photos",
  auth(["shop", "admin"]),
  (req, res) => {
    uploadPhotos(req, res, async (err) => {
      try {
        if (err) return res.status(400).json({ message: err.message });

        const o = await Order.findById(req.params.id);
        if (!o) return res.status(404).json({ message: "Orden no encontrada" });
        const files = (req.files || []).map(f => `/uploads/${f.filename}`);
        if (files.length) {
          o.photos.push(...files);
          o.timeline.push({ status: o.status, note: `Se agregaron ${files.length} foto(s)` });
          await o.save();
        }

        res.json({ ok: true, photos: files, orderId: o._id });
      } catch (e) {
        console.error(e);
        res.status(500).json({ message: "No se pudieron subir fotos" });
      }
    });
  }
);

export default router;
