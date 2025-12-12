// frontend/src/pages/shop/ShopOrderDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AppLayout from "../account/AppLayout";
import {
  getOrder,
  shopUpdateOrder,
  shopUploadPhotos,
} from "../../services/orders";

const STATUS_LABEL = {
  REQUESTED: "Cotización solicitada",
  CONTACTED: "Cotización aprobada / coordinando ingreso",
  CHECKED_IN: "Ingresó al taller",
  IN_PROGRESS: "En reparación",
  READY: "Listo para retirar",
  DELIVERED: "Entregado",
  CANCELED: "Cancelado",
};

const DONE_STATUS = ["DELIVERED", "CANCELED"];

export default function ShopOrderDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [etaHours, setEtaHours] = useState("");
  const [amount, setAmount] = useState("");
  const [breakdown, setBreakdown] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const { data } = await getOrder(id);
      setOrder(data || null);

      if (data) {
        setEtaHours(
          typeof data.etaHours === "number" ? String(data.etaHours) : ""
        );
        setAmount(
          data.estimate && typeof data.estimate.amount === "number"
            ? String(data.estimate.amount)
            : ""
        );
        setBreakdown(data.estimate?.breakdown || "");
      }
      setError("");
    } catch (e) {
      setError(
        e?.response?.data?.message || "No se pudo cargar la orden del taller"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isDone = order && DONE_STATUS.includes(order.status);
  const isRequested = order && order.status === "REQUESTED";
  const canProgressFlow = order && !isDone && !isRequested;

  // Actualiza orden (con o sin cambio de estado)
  async function handleUpdate(nextStatus) {
    if (!order) return;
    setSaving(true);
    try {
      const body = {};

      // eta
      if (etaHours !== "") {
        const n = Number(etaHours);
        if (!Number.isNaN(n)) body.etaHours = n;
      }

      // presupuesto
      const nAmount = amount !== "" ? Number(amount) : NaN;
      if (!Number.isNaN(nAmount)) {
        body.estimate = {
          amount: nAmount,
          breakdown: breakdown || "",
          currency: "CLP",
        };
      } else if (breakdown) {
        body.estimate = {
          amount: order.estimate?.amount ?? 0,
          breakdown,
          currency: order.estimate?.currency || "CLP",
        };
      }

      // nota de avance
      if (note && note.trim() !== "") {
        body.note = note.trim();
      }

      if (nextStatus) {
        body.status = nextStatus;
      }

      const { data } = await shopUpdateOrder(order._id, body);
      setOrder(data);
      setNote("");

      // refrescamos campos desde respuesta, por si cambió algo
      setEtaHours(
        typeof data.etaHours === "number" ? String(data.etaHours) : ""
      );
      setAmount(
        data.estimate && typeof data.estimate.amount === "number"
          ? String(data.estimate.amount)
          : ""
      );
      setBreakdown(data.estimate?.breakdown || "");
    } catch (e) {
      alert(
        e?.response?.data?.message || "No se pudo actualizar la orden. Intenta nuevamente."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadPhotos(e) {
    if (!order) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    try {
      await shopUploadPhotos(order._id, files);
      await load();
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          "No se pudieron subir las fotos. Intenta nuevamente."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (loading) {
    return (
      <AppLayout active="taller">
        <div className="p-4 text-gray-500">Cargando orden…</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout active="taller">
        <div className="p-4 text-red-600">{error}</div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout active="taller">
        <div className="p-4 text-gray-500">Orden no encontrada.</div>
      </AppLayout>
    );
  }

  const vehicle = order.vehicle;
  const timelineNotes = Array.isArray(order.timeline)
    ? order.timeline.filter(
        (t) => t.note && typeof t.note === "string" && t.note.trim() !== ""
      )
    : [];

  return (
    <AppLayout active="taller">
      <div className="mb-4">
        <Link to="/taller" className="text-teal-600 text-sm">
          ← Volver al panel
        </Link>
      </div>

      <h1 className="text-xl font-semibold mb-3">Detalle de la orden</h1>

      {/* Info principal */}
      <div className="bg-white rounded-2xl shadow p-4 mb-4 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="font-semibold">
              {order.customer?.name || "Cliente"}
            </div>
            {order.contactPhone && (
              <div className="text-sm text-gray-600">
                Teléfono: {order.contactPhone}
              </div>
            )}
            {vehicle ? (
              <div className="text-sm text-gray-700 mt-1">
                {vehicle.plate} · {vehicle.brand} {vehicle.model} (
                {vehicle.year})
              </div>
            ) : (
              <div className="text-sm text-gray-500 mt-1">
                Sin vehículo asociado
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              Taller: {order.shop?.name}{" "}
              {order.shop?.city ? `· ${order.shop.city}` : ""}
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="text-xs text-gray-500 mb-1">
              Estado actual:
            </div>
            <div
              className={`inline-block px-2 py-1 rounded text-xs ${
                order.status === "DELIVERED"
                  ? "bg-green-100 text-green-700"
                  : order.status === "CANCELED"
                  ? "bg-red-100 text-red-700"
                  : "bg-teal-50 text-teal-700"
              }`}
            >
              {STATUS_LABEL[order.status] || order.status}
            </div>
          </div>
        </div>

        {/* Descripción del problema */}
        {order.description && (
          <div className="text-sm text-gray-700 whitespace-pre-line mt-2">
            {order.description}
          </div>
        )}

        {/* Detalle del presupuesto para el taller (mismo que ve el cliente) */}
        {order.estimate?.amount > 0 && (
          <div className="mt-2 text-sm text-gray-700">
            <div>
              Presupuesto estimado:{" "}
              <span className="font-semibold">
                $
                {Number(order.estimate.amount).toLocaleString("es-CL")}
              </span>
            </div>
            {order.estimate.breakdown && (
              <div className="mt-1 text-xs text-gray-600 whitespace-pre-line">
                <span className="font-medium block mb-0.5">
                  Detalle del presupuesto:
                </span>
                {order.estimate.breakdown}
              </div>
            )}
          </div>
        )}

        {/* Aviso cuando ya está finalizada */}
        {isDone && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            Esta orden ya está finalizada (
            {STATUS_LABEL[order.status] || order.status}). No se pueden
            realizar más cambios.
          </div>
        )}
      </div>

      {/* Fotos y timeline básico podrían ir aparte si quieres, pero dejamos el flujo de reparación principal */}
      <div className="bg-white rounded-2xl shadow p-4 mb-4">
        <h2 className="font-semibold mb-3 text-sm">
          Flujo de reparación / cotización
        </h2>

        {/* Si está en REQUESTED, primero aprobar o rechazar */}
        {isRequested && (
          <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-900">
            Esta orden es una <strong>cotización pendiente</strong>. Puedes
            completar el presupuesto y luego:
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving || isDone}
                onClick={() => handleUpdate("CONTACTED")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  saving || isDone
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                Aprobar cotización
              </button>
              <button
                type="button"
                disabled={saving || isDone}
                onClick={() => {
                  if (
                    window.confirm(
                      "¿Seguro que quieres cancelar/rechazar esta cotización?"
                    )
                  ) {
                    handleUpdate("CANCELED");
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  saving || isDone
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                Rechazar cotización
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2 text-sm">
            <label className="block text-xs text-gray-600">
              Duración estimada (horas)
            </label>
            <input
              type="number"
              min="0"
              className="w-full border rounded-xl px-3 py-2 text-sm"
              value={etaHours}
              disabled={saving || isDone}
              onChange={(e) => setEtaHours(e.target.value)}
            />

            <label className="block text-xs text-gray-600 mt-3">
              Presupuesto estimado (CLP)
            </label>
            <input
              type="number"
              min="0"
              className="w-full border rounded-xl px-3 py-2 text-sm"
              value={amount}
              disabled={saving || isDone}
              onChange={(e) => setAmount(e.target.value)}
            />

            <label className="block text-xs text-gray-600 mt-3">
              Detalle del presupuesto (opcional)
            </label>
            <textarea
              className="w-full border rounded-xl px-3 py-2 text-xs"
              rows={4}
              value={breakdown}
              disabled={saving || isDone}
              onChange={(e) => setBreakdown(e.target.value)}
              placeholder={
                "Mano de obra: $200.000\nRepuestos (parachoques, soportes, sensores): $260.000\nMateriales y pintura: $90.000"
              }
            />
          </div>

          <div className="space-y-2 text-sm">
            <label className="block text-xs text-gray-600">
              Nota de avance (opcional)
            </label>
            <textarea
              className="w-full border rounded-xl px-3 py-2 text-xs"
              rows={4}
              value={note}
              disabled={saving || isDone}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: Se inició desarme del parachoques; por ahora no se observan daños graves en suspensión…"
            />

            {/* Botones de flujo SOLO cuando ya no está en REQUESTED y no está finalizada */}
            {canProgressFlow && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  disabled={saving || isDone}
                  onClick={() => handleUpdate("CHECKED_IN")}
                  className={`px-3 py-2 rounded-lg font-medium ${
                    saving || isDone
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-black"
                  }`}
                >
                  Marcar “Ingresó al taller”
                </button>
                <button
                  type="button"
                  disabled={saving || isDone}
                  onClick={() => handleUpdate("IN_PROGRESS")}
                  className={`px-3 py-2 rounded-lg font-medium ${
                    saving || isDone
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-black"
                  }`}
                >
                  Marcar “En reparación”
                </button>
                <button
                  type="button"
                  disabled={saving || isDone}
                  onClick={() => handleUpdate("READY")}
                  className={`px-3 py-2 rounded-lg font-medium ${
                    saving || isDone
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gray-900 text-white hover:bg-black"
                  }`}
                >
                  Marcar “Listo para retirar”
                </button>
                <button
                  type="button"
                  disabled={saving || isDone}
                  onClick={() => handleUpdate("DELIVERED")}
                  className={`px-3 py-2 rounded-lg font-medium ${
                    saving || isDone
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  Marcar “Entregado”
                </button>
              </div>
            )}

            {/* subir fotos */}
            <div className="mt-4">
              <label className="block text-xs text-gray-600 mb-1">
                Fotos de avance (máx. 5 MB c/u)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading || isDone}
                onChange={handleUploadPhotos}
                className="text-xs"
              />
              {uploading && (
                <div className="text-[11px] text-gray-500 mt-1">
                  Subiendo fotos…
                </div>
              )}
              {isDone && (
                <div className="text-[11px] text-gray-400 mt-1">
                  Orden finalizada: ya no se pueden agregar nuevas fotos.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notas de avance completas (timeline) */}
      {timelineNotes.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-4 mb-6">
          <h2 className="font-semibold mb-2 text-sm">Historial de notas</h2>
          <ul className="space-y-1 text-xs text-gray-700">
            {timelineNotes.map((t, idx) => (
              <li key={idx} className="border-b last:border-b-0 pb-1">
                <div className="text-[11px] text-gray-400">
                  {t.at ? new Date(t.at).toLocaleString("es-CL") : ""}
                  {t.status && ` · ${STATUS_LABEL[t.status] || t.status}`}
                </div>
                <div className="whitespace-pre-line">{t.note}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppLayout>
  );
}
