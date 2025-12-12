// backend/src/routes/orders.routes.js
import { Router } from "express";
import Order, { ORDER_STATUS } from "../models/Order.js";
import Vehicle from "../models/Vehicle.js";
import { auth } from "../middleware/auth.js";
import { uploadPhotos } from "../middleware/upload.js";

const router = Router();

/**
 * CLIENTE crea solicitud (con o sin fotos, con o sin vehicleId).
 * Soporta:
 * - JSON simple (sin fotos) => body normal
 * - FormData con fotos       => campos texto + photos[]
 * - Campos antiguos: serviceName, notes, priceEstimate
 * - Campos nuevos: title, description, contactPhone
 */
router.post("/", auth("client"), (req, res) => {
  uploadPhotos(req, res, async (err) => {
    try {
      if (err) {
        console.error("Error en uploadPhotos:", err);
        return res.status(400).json({ message: err.message });
      }

      // 🧠 Tomamos TODOS los nombres posibles de campos
      let {
        shopId,
        vehicleId,
        title,
        description,
        contactPhone,
        serviceName,
        notes,
        priceEstimate,
      } = req.body || {};

      // Body viene como strings siempre en multipart
      shopId = shopId || req.body?.shop || req.body?.shop_id;

      // description puede venir como description, notes o message
      description =
        description ||
        notes ||
        req.body?.message ||
        "Solicitud de servicio desde la app";

      // title puede venir como title o serviceName
      title = title || serviceName || "Solicitud de servicio";

      contactPhone = contactPhone || req.body?.phone || "";

      if (!shopId) {
        return res
          .status(400)
          .json({ message: "shopId es requerido para crear la orden" });
      }

      // 🔧 Si no viene vehicleId, intentamos asociar el ÚLTIMO vehículo del cliente
      if (!vehicleId) {
        const lastVehicle = await Vehicle.findOne({ owner: req.user._id }).sort({
          createdAt: -1,
        });
        if (lastVehicle) {
          vehicleId = lastVehicle._id;
        }
      }

      // Construimos array de fotos (si vienen)
      const photos = (req.files || []).map((f) => ({
        url: `/uploads/${f.filename}`,
        originalName: f.originalname,
        size: f.size,
        mimeType: f.mimetype,
      }));

      // Armamos orden base
      const orderData = {
        customer: req.user._id,
        shop: shopId,
        vehicle: vehicleId || undefined,
        title,
        description,
        contactPhone,
        photos,
        status: "REQUESTED",
        timeline: [
          { status: "REQUESTED", note: "Solicitud creada por el cliente" },
        ],
      };

      // Si desde el front mandan un precio base, lo guardamos como estimate.amount
      if (priceEstimate) {
        const amount = Number(priceEstimate);
        if (!Number.isNaN(amount) && amount > 0) {
          orderData.estimate = {
            amount,
            currency: "CLP",
          };
        }
      }

      const order = new Order(orderData);
      await order.save();

      res.status(201).json(order);
    } catch (e) {
      console.error("Error al crear orden:", e);
      res.status(500).json({ message: "No se pudo crear la orden" });
    }
  });
});

/** CLIENTE lista sus órdenes */
router.get("/mine", auth("client"), async (req, res) => {
  try {
    const rows = await Order.find({ customer: req.user._id })
      .populate("shop", "name city")
      .populate("vehicle", "plate brand model year")
      .sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "No se pudo listar tus órdenes" });
  }
});

/** TALLER lista sus órdenes: filtros/agrupado */
router.get("/shop/mine", auth(["shop", "admin"]), async (req, res) => {
  try {
    const shopId =
      req.user.role === "shop" ? req.user.shop : req.query.shopId || req.user.shop;
    if (!shopId) return res.status(400).json({ message: "Sin taller asociado" });

    const BUCKETS = {
      quotes: ["REQUESTED", "CONTACTED"],
      active: ["CHECKED_IN", "IN_PROGRESS", "READY"],
      done: ["DELIVERED", "CANCELED"],
    };

    const { status, bucket, group } = req.query;
    const base = { shop: shopId };

    // group=1 -> devolver agrupado
    if (group === "1") {
      const [quotes, active, done] = await Promise.all([
        Order.find({ ...base, status: { $in: BUCKETS.quotes } })
          .populate("customer", "name email")
          .populate("vehicle", "plate brand model year")
          .sort({ createdAt: -1 }),
        Order.find({ ...base, status: { $in: BUCKETS.active } })
          .populate("customer", "name email")
          .populate("vehicle", "plate brand model year")
          .sort({ createdAt: -1 }),
        Order.find({ ...base, status: { $in: BUCKETS.done } })
          .populate("customer", "name email")
          .populate("vehicle", "plate brand model year")
          .sort({ createdAt: -1 }),
      ]);
      return res.json({ quotes, active, done });
    }

    // modo lista con filtros simples
    const q = { ...base };
    if (status) q.status = status;
    if (bucket && BUCKETS[bucket]) q.status = { $in: BUCKETS[bucket] };

    const rows = await Order.find(q)
      .populate("customer", "name email")
      .populate("vehicle", "plate brand model year")
      .sort({ createdAt: -1 });

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "No se pudo listar" });
  }
});

/** Detalle (cliente dueño, shop dueño o admin) */
router.get("/:id", auth(), async (req, res) => {
  try {
    const o = await Order.findById(req.params.id)
      .populate("shop", "name city")
      .populate("vehicle", "plate brand model year");
    if (!o) return res.status(404).json({ message: "Orden no encontrada" });

    const isClient = req.user.role === "client";
    const isShop = req.user.role === "shop";

    // Cliente solo puede ver sus propias órdenes
    if (isClient && String(o.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: "Sin permisos" });
    }

    // Taller solo puede ver órdenes de su propio taller
    if (isShop) {
      const shopField = o.shop && o.shop._id ? o.shop._id : o.shop;
      if (String(shopField) !== String(req.user.shop)) {
        return res.status(403).json({ message: "Sin permisos" });
      }
    }

    res.json(o);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error al obtener la orden" });
  }
});

/** ADMIN lista todas */
router.get("/", auth("admin"), async (_req, res) => {
  try {
    const rows = await Order.find()
      .populate("customer", "name email")
      .populate("shop", "name city")
      .populate("vehicle", "plate brand model year")
      .sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "No se pudo listar" });
  }
});

/** Actualización por SHOP o ADMIN */
router.patch("/:id", auth(["shop", "admin"]), async (req, res) => {
  try {
    const { status, estimate, etaHours, note, addPhoto } = req.body;
    const o = await Order.findById(req.params.id);
    if (!o) return res.status(404).json({ message: "Orden no encontrada" });

    if (req.user.role === "shop" && String(o.shop) !== String(req.user.shop)) {
      return res.status(403).json({ message: "Sin permisos" });
    }

    // BLOQUEO: si la orden ya está finalizada, no se puede modificar
    const DONE = ["DELIVERED", "CANCELED"];
    if (DONE.includes(o.status)) {
      return res
        .status(400)
        .json({ message: "La orden ya está finalizada y no se puede modificar" });
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
    console.error(e);
    res.status(500).json({ message: "No se pudo actualizar la orden" });
  }
});

/** Subida de fotos extra */
router.post("/:id/photos", auth(["shop", "admin"]), (req, res) => {
  uploadPhotos(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: err.message });

      const o = await Order.findById(req.params.id);
      if (!o) return res.status(404).json({ message: "Orden no encontrada" });
      if (req.user.role === "shop" && String(o.shop) !== String(req.user.shop)) {
        return res.status(403).json({ message: "Sin permisos" });
      }

      // BLOQUEO: no se pueden subir fotos si la orden ya terminó
      const DONE = ["DELIVERED", "CANCELED"];
      if (DONE.includes(o.status)) {
        return res.status(400).json({
          message: "La orden ya está finalizada y no se pueden subir más fotos",
        });
      }

      const files = (req.files || []).map((f) => ({
        url: `/uploads/${f.filename}`,
        originalName: f.originalname,
        size: f.size,
        mimeType: f.mimetype,
      }));

      if (files.length) {
        o.photos.push(...files);
        o.timeline.push({
          status: o.status,
          note: `Se agregaron ${files.length} foto(s)`,
        });
        await o.save();
      }
      res.json({ ok: true, photos: files, orderId: o._id });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "No se pudieron subir fotos" });
    }
  });
});

/** Cliente califica un servicio terminado */
router.post("/:id/rating", auth("client"), async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Calificación inválida" });
    }

    const o = await Order.findById(req.params.id);
    if (!o) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    if (String(o.customer) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Sin permisos para calificar esta orden" });
    }

    if (!["DELIVERED", "CANCELED"].includes(o.status)) {
      return res
        .status(400)
        .json({ message: "Solo se pueden calificar órdenes finalizadas" });
    }

    const value = Number(rating);
    if (!Number.isFinite(value) || value < 1 || value > 5) {
      return res
        .status(400)
        .json({ message: "La calificación debe ser un número entre 1 y 5" });
    }

    o.clientRating = value;
    o.clientReview = typeof review === "string" ? review.trim() : "";

    await o.save();

    res.json({
      ok: true,
      rating: o.clientRating,
      review: o.clientReview,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "No se pudo guardar la calificación" });
  }
});

/** Cliente envía mensaje/comentario al taller */
router.post("/:id/message", auth("client"), async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ message: "El mensaje no puede estar vacío" });
    }

    const o = await Order.findById(req.params.id);
    if (!o) {
      return res.status(404).json({ message: "Orden no encontrada" });
    }

    // Validamos que la orden sea del cliente logueado
    if (String(o.customer) !== String(req.user._id)) {
      return res.status(403).json({ message: "Sin permisos para esta orden" });
    }

    // Si la orden ya está finalizada, no aceptar más mensajes
    const DONE = ["DELIVERED", "CANCELED"];
    if (DONE.includes(o.status)) {
      return res.status(400).json({
        message:
          "La orden ya está finalizada y no se pueden enviar más mensajes",
      });
    }

    const text = message.trim();


    // Guardamos en arreglo dedicado
    if (!Array.isArray(o.clientMessages)) {
      o.clientMessages = [];
    }
    o.clientMessages.push({ text, at: new Date() });

    // Y lo reflejamos también en el timeline
    o.timeline.push({
      status: o.status,
      note: `Mensaje del cliente: ${text}`,
    });

    await o.save();

    res.json({
      ok: true,
      clientMessages: o.clientMessages,
      timeline: o.timeline,
    });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "No se pudo enviar el mensaje al taller" });
  }
});

export default router;
