// frontend/src/pages/ClienteDashboard.jsx
import { useEffect, useState } from "react";
import AppLayout from "./account/AppLayout.jsx";
import { listMyOrders, sendClientMessage } from "../services/orders";

const STATUS_LABEL = {
  REQUESTED: "Solicitado",
  CONTACTED: "Contactado",
  CHECKED_IN: "Ingresó al taller",
  IN_PROGRESS: "En reparación",
  READY: "Listo para retirar",
  DELIVERED: "Entregado",
  CANCELED: "Cancelado",
};

const RAW_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_HOST = RAW_API_URL.replace(/\/api\/?$/, "");

// Normaliza el path para que siempre empiece con "/"
function normalizePath(p) {
  if (!p) return "";
  return p.startsWith("/") ? p : `/${p}`;
}

// Arma la URL completa de la foto (soporta string u objeto)
function getPhotoUrl(photo) {
  if (!photo) return "";

  // Caso: la API devuelve solo un string
  if (typeof photo === "string") {
    if (photo.startsWith("http://") || photo.startsWith("https://")) {
      return photo;
    }
    return `${API_HOST}${normalizePath(photo)}`;
  }

  // Caso: objeto { url, ... }
  if (photo.url) {
    if (photo.url.startsWith("http://") || photo.url.startsWith("https://")) {
      return photo.url;
    }
    return `${API_HOST}${normalizePath(photo.url)}`;
  }

  return "";
}

export default function ClienteDashboard() {
  const [last, setLast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [msgError, setMsgError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await listMyOrders();
        const rows = Array.isArray(data) ? data : [];

        if (!rows.length) {
          setLast(null);
          setError("");
          return;
        }

        // Estados "activos" para el seguimiento
        const ACTIVE = [
          "REQUESTED",
          "CONTACTED",
          "CHECKED_IN",
          "IN_PROGRESS",
          "READY",
        ];

        const active = rows.filter((o) => ACTIVE.includes(o.status));

        if (active.length === 0) {
          // Si no hay activos, mostramos la última en general (por si ya fue entregado)
          setLast(rows[0]);
        } else {
          // Si hay al menos una activa, mostramos la más reciente
          setLast(active[0]);
        }

        setError("");
      } catch (e) {
        setError(
          e?.response?.data?.message || "No se pudieron cargar tus órdenes"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Preparamos notas de avance de la última orden
  const notes =
    last && Array.isArray(last.timeline)
      ? last.timeline.filter(
          (t) => t.note && typeof t.note === "string" && t.note.trim() !== ""
        )
      : [];

  // Nos quedamos con las 3 últimas notas (si hay muchas)
  const recentNotes = notes.slice(-3);

  const clientMessages = last?.clientMessages || [];
    const isFinished =
    last && (last.status === "DELIVERED" || last.status === "CANCELED");

  async function handleSendMessage(e) {
    e.preventDefault();
    setMsgError("");

    if (!last?._id) return;
     if (last.status === "DELIVERED" || last.status === "CANCELED") return;
    if (!msgText.trim()) {
      setMsgError("Escribe un mensaje antes de enviarlo.");
      return;
    }

    try {
      setSending(true);
      const { data } = await sendClientMessage(last._id, msgText.trim());

      // Actualizamos el estado local con lo que devolvió el backend
      setLast((prev) =>
        prev
          ? {
              ...prev,
              clientMessages: data.clientMessages,
              timeline: data.timeline,
            }
          : prev
      );

      setMsgText("");
    } catch (e) {
      setMsgError(
        e?.response?.data?.message || "No se pudo enviar el mensaje al taller"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <AppLayout active="inicio">
      <div className="flex justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-xl font-semibold mb-4 text-center">
            Seguimiento de tu vehículo
          </h1>

          {loading && (
            <div className="text-center text-gray-500 text-sm">
              Cargando…
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm mb-3 text-center">
              {error}
            </div>
          )}

          {!loading && !last && !error && (
            <div className="bg-white rounded-2xl shadow p-4 text-center text-sm text-gray-600">
              Aún no tienes servicios activos. Cuando solicites una reparación,
              aquí verás el estado de tu vehículo, el presupuesto y las notas de
              avance del taller.
            </div>
          )}

          {last && (
            <div className="bg-white rounded-2xl shadow overflow-hidden">
              <div className="px-4 pt-3 text-xs text-gray-500">
                Última orden ·{" "}
                {last.createdAt
                  ? new Date(last.createdAt).toLocaleString("es-CL")
                  : ""}
              </div>

              {/* Foto del caso (última, cliente o taller) */}
              {(() => {
                const lastPhoto =
                  last.photos && last.photos.length
                    ? last.photos[last.photos.length - 1]
                    : null;

                const src = getPhotoUrl(lastPhoto);

                if (!src) return null;

                return (
                  <div className="mt-2 w-full h-56 bg-gray-100 overflow-hidden">
                    <img
                      src={src}
                      alt="Foto del avance"
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })()}

              <div className="p-4 text-sm text-gray-700 space-y-2">
                <div className="font-medium">
                  Etapa actual:{" "}
                  <span className="text-teal-700">
                    {STATUS_LABEL[last.status] || last.status}
                  </span>
                </div>

                {last.etaHours && (
                  <div>
                    Duración estimada:{" "}
                    <span className="font-medium">
                      {last.etaHours} hora
                      {last.etaHours === 1 ? "" : "s"} aprox.
                    </span>
                  </div>
                )}

                {last.estimate?.amount > 0 && (
                  <div>
                    Presupuesto estimado:{" "}
                    <span className="font-semibold">
                      $
                      {Number(last.estimate.amount).toLocaleString("es-CL")}
                    </span>
                  </div>
                )}

                {/* Detalle del presupuesto (si existe) */}
                {last.estimate?.breakdown && (
                  <div className="text-xs text-gray-600 whitespace-pre-line">
                    <span className="font-medium text-gray-700 block mb-0.5">
                      Detalle del presupuesto:
                    </span>
                    {last.estimate.breakdown}
                  </div>
                )}

                {/* Notas de avance recientes */}
                {recentNotes.length > 0 && (
                  <div className="pt-2 border-t text-xs text-gray-600">
                    <div className="font-medium text-gray-700 mb-1">
                      Notas de avance
                    </div>
                    <ul className="space-y-1">
                      {recentNotes.map((step, idx) => (
                        <li key={idx} className="leading-snug">
                          {step.at && (
                            <span className="block text-[11px] text-gray-400">
                              {new Date(step.at).toLocaleString("es-CL")}
                            </span>
                          )}
                          <span className="whitespace-pre-line">
                            {step.note}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mensajes del cliente al taller */}
                <div className="pt-2 border-t text-xs text-gray-600 space-y-2">
                  <div className="font-medium text-gray-700">
                    Mensajes que enviaste al taller
                  </div>

                  {clientMessages.length > 0 ? (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {clientMessages
                        .slice()
                        .reverse()
                        .map((m, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-800"
                          >
                            <div className="whitespace-pre-line">
                              {m.text}
                            </div>
                            <div className="mt-1 text-[10px] text-gray-500">
                              {m.at
                                ? new Date(m.at).toLocaleString("es-CL")
                                : ""}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-500">
                      Aún no has enviado comentarios adicionales al taller.
                    </div>
                  )}

                                    {/* Formulario para nuevo mensaje */}
                  {!isFinished ? (
                    <form
                      onSubmit={handleSendMessage}
                      className="space-y-2 mt-2"
                    >
                      {msgError && (
                        <div className="text-[11px] text-red-600">
                          {msgError}
                        </div>
                      )}
                      <textarea
                        rows={3}
                        className="w-full border rounded-xl px-3 py-2 text-xs"
                        placeholder="Escribe un comentario o inconveniente para el taller…"
                        value={msgText}
                        onChange={(e) => setMsgText(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={sending || !msgText.trim()}
                        className={`w-full py-2.5 rounded-xl text-xs font-medium ${
                          sending || !msgText.trim()
                            ? "bg-gray-300 text-gray-600"
                            : "bg-teal-600 text-white hover:bg-teal-700"
                        }`}
                      >
                        {sending ? "Enviando…" : "Enviar mensaje al taller"}
                      </button>
                    </form>
                  ) : (
                    <div className="mt-2 text-[11px] text-gray-400">
                      Esta orden ya está finalizada. Si necesitas algo nuevo,
                      deberás crear una nueva solicitud con el taller.
                    </div>
                  )}

                </div>

                <div className="pt-2 border-t text-xs text-gray-500">
                  Taller: {last.shop?.name || "N/D"}
                  {last.shop?.city ? ` · ${last.shop.city}` : ""}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
