// src/pages/account/ServiceHistory.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { me } from "../../services/auth";
import { listMyOrders, rateOrder } from "../../services/orders";

// Formateador de moneda CLP
const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

// Mapeo de estados a etiquetas legibles
const STATUS_LABEL = {
  REQUESTED: "Solicitado",
  CONTACTED: "Contactado",
  CHECKED_IN: "Ingresó al taller",
  IN_PROGRESS: "En reparación",
  READY: "Listo para retirar",
  DELIVERED: "Entregado",
  CANCELED: "Cancelado",
};

// Estados que se consideran "historial" (ya no activos)
const PAST_STATUS = ["DELIVERED", "CANCELED"];

// URL base del backend (para armar rutas completas de imágenes)
const RAW_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_HOST = RAW_API_URL.replace(/\/api\/?$/, "");

// Normaliza un path para que siempre empiece con "/"
function normalizePath(p) {
  if (!p) return "";
  return p.startsWith("/") ? p : `/${p}`;
}

// Obtiene la URL completa de una foto (string u objeto)
function getPhotoUrl(photo) {
  if (!photo) return "";

  // Si viene como string
  if (typeof photo === "string") {
    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }
    return `${API_HOST}${normalizePath(photo)}`;
  }

  // Si viene como objeto { url, ... }
  if (photo.url) {
    if (photo.url.startsWith("http://") || photo.url.startsWith("https://")) {
      return photo.url;
    }
    return `${API_HOST}${normalizePath(photo.url)}`;
  }

  return "";
}

// Componente visual de estrellas de calificación
function RatingStars({ value, onChange, disabled = false }) {
  // value: número actual de estrellas (1 a 5) o null
  // onChange: callback al hacer clic en una estrella
  // disabled: si es true, muestra solo lectura

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => {
        const filled = value >= n;

        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={
              disabled
                ? undefined
                : () => {
                    onChange(n);
                  }
            }
            className={`text-lg ${
              filled ? "text-yellow-500" : "text-gray-300"
            } ${
              disabled
                ? "cursor-default"
                : "cursor-pointer hover:text-yellow-600"
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

export default function ServiceHistory() {
  const nav = useNavigate();

  // Lista de órdenes finalizadas del cliente
  const [orders, setOrders] = useState([]);

  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Identificador de la orden que se está calificando (para mostrar "Guardando...")
  const [ratingLoadingId, setRatingLoadingId] = useState(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        // Verifica que el usuario sea cliente
        const { data: u } = await me();
        if (u.role !== "client") {
          nav("/taller", { replace: true });
          return;
        }

        // Obtiene todas las órdenes del cliente
        const { data } = await listMyOrders();
        if (!alive) return;

        const all = Array.isArray(data) ? data : [];

        // Filtra solo órdenes ya finalizadas
        const past = all.filter((o) => PAST_STATUS.includes(o.status));

        setOrders(past);
      } catch {
        if (!alive) return;
        setError("No se pudo cargar tu historial.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    // Si no hay token, redirige a login
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login");
      return;
    }

    load();

    // Limpieza del efecto
    return () => {
      alive = false;
    };
  }, [nav]);

  // Maneja el evento de calificar una orden
  const handleRate = async (orderId, rating) => {
    try {
      setRatingLoadingId(orderId);

      // Envía la calificación al backend
      await rateOrder(orderId, rating);

      // Actualiza el estado local para reflejar la calificación
      setOrders((prev) =>
        prev.map((o) =>
          String(o._id) === String(orderId)
            ? { ...o, clientRating: rating }
            : o
        )
      );
    } catch (e) {
      alert(
        e?.response?.data?.message ||
          "No se pudo guardar la calificación. Intenta nuevamente."
      );
    } finally {
      setRatingLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-4">Historial de servicios</h1>

        {loading && <div className="text-gray-500">Cargando…</div>}

        {!loading && error && (
          <div className="text-red-600 text-sm mb-3">{error}</div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-gray-600 mb-3">
              Aún no tienes servicios finalizados.
            </p>
            <Link
              to="/talleres"
              className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
            >
              Explorar talleres
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((o) => {
              // Código corto de la orden (últimos 6 caracteres del ObjectId)
              const code = o._id?.slice(-6).toUpperCase();

              // Datos del vehículo (si vienen desde Vehicle)
              const plate = o.vehicle?.plate || "";
              const vehicleLabel = o.vehicle
                ? [
                    o.vehicle.brand,
                    o.vehicle.model,
                    o.vehicle.year,
                  ]
                    .filter(Boolean)
                    .join(" ")
                : "";

              // Fecha de referencia
              const dateStr = o.updatedAt || o.createdAt;
              const date = dateStr
                ? new Date(dateStr).toLocaleDateString("es-CL")
                : "–";

              // Monto a mostrar (presupuesto estimado)
              const total = o.estimate?.amount ?? 0;

              // Estado legible
              const statusLabel = STATUS_LABEL[o.status] || o.status;

              // Rating actual de la orden (si existe)
              const rating = o.clientRating || null;

              // Solo se puede calificar si está entregado y no tiene rating
              const canRate = o.status === "DELIVERED" && !rating;

              const badgeClass =
                o.status === "DELIVERED"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700";

              // Última foto asociada a la orden
              const lastPhoto =
                o.photos && o.photos.length
                  ? o.photos[o.photos.length - 1]
                  : null;
              const photoSrc = getPhotoUrl(lastPhoto);

              return (
                <div
                  key={o._id || code}
                  className="bg-white rounded-2xl shadow overflow-hidden"
                >
                  {/* Cabecera con fecha y taller, tipo maqueta de "pantalla finalizada" */}
                  <div className="px-4 pt-3 text-xs text-gray-500 flex justify-between">
                    <span>{date}</span>
                    {o.shop?.name && <span>{o.shop.name}</span>}
                  </div>

                  {/* Foto grande del servicio, como en la maqueta del PPT */}
                  {photoSrc && (
                    <div className="mt-2 w-full h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={photoSrc}
                        alt="Foto del servicio"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Contenido principal de la tarjeta */}
                  <div className="p-4 space-y-2">
                    {/* Código, vehículo y patente */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-sm">
                          Orden {code}
                        </div>
                        {vehicleLabel || plate ? (
                          <div className="text-xs text-gray-500">
                            {vehicleLabel}
                            {plate ? ` · Patente: ${plate}` : ""}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            Sin vehículo asociado
                          </div>
                        )}
                      </div>

                      {/* Estado y monto a la derecha */}
                      <div className="text-right">
                        <div
                          className={`text-xs ${badgeClass} px-2 py-1 rounded`}
                        >
                          {statusLabel}
                        </div>
                        <div className="font-semibold mt-1">
                          {CLP.format(total)}
                        </div>
                      </div>
                    </div>

                    {/* Bloque de calificación, inspirado en tu maqueta */}
                    <div className="mt-3 pt-3 border-t flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        ¿Está conforme con el servicio?
                      </span>

                      {/* Si ya tiene rating, mostramos estrellas solo lectura */}
                      {rating && (
                        <RatingStars value={rating} disabled={true} />
                      )}

                      {/* Si se puede calificar, mostramos estrellas clicables */}
                      {canRate && (
                        <div className="flex items-center gap-2">
                          {ratingLoadingId === o._id && (
                            <span className="text-xs text-gray-400">
                              Guardando…
                            </span>
                          )}
                          <RatingStars
                            value={rating}
                            disabled={ratingLoadingId === o._id}
                            onChange={(value) => handleRate(o._id, value)}
                          />
                        </div>
                      )}

                      {/* Si está cancelada y sin rating */}
                      {!rating && o.status === "CANCELED" && (
                        <span className="text-xs text-gray-400">
                          Servicio cancelado, no aplica calificación.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
