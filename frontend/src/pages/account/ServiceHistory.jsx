// src/pages/account/ServiceHistory.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "../../components/BottomNav";
import { listMyOrders } from "../../services/orders";

// Formateador CLP
const CLP = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

export default function ServiceHistory() {
  const nav = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchOrders() {
    setLoading(true);
    setError("");
    try {
      // Puedes filtrar solo finalizadas cuando el backend lo tenga:
      // const { data } = await listMyOrders({ status: "finished" });
      const { data } = await listMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError("No se pudo cargar tu historial.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Si no hay token, fuera
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login");
      return;
    }
    fetchOrders();
  }, [nav]);

  return (
    <div className="min-h-screen bg-teal-50 pb-24">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-xl font-semibold mb-4">Historial de servicios</h1>

        {loading && (
          <div className="text-gray-500">Cargando…</div>
        )}

        {!loading && error && (
          <div className="text-red-600 text-sm mb-3">{error}</div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-6 text-center">
            <p className="text-gray-600 mb-3">Aún no tienes servicios finalizados.</p>
            <Link
              to="/talleres"
              className="inline-block bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
            >
              Explorar talleres
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((o) => {
              // Campos esperados desde backend
              const code    = o.code || o._id?.slice(-6).toUpperCase();
              const plate   = o.vehicle?.plate || o.plate || "—";
              const dateStr = o.finishedAt || o.updatedAt || o.createdAt;
              const date    = dateStr ? new Date(dateStr).toISOString().slice(0, 10) : "–";
              const status  = o.status || "—";
              const total   = o.quoteTotal ?? o.total ?? 0;

              // Badge color simple
              const done    = ["finished", "delivered", "finalizado"].includes(String(status).toLowerCase());
              const badge   = done
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700";

              return (
                <div key={o._id || code} className="bg-white rounded-2xl shadow p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{code} · {plate}</div>
                      <div className="text-sm text-gray-600">{date}</div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs ${badge} px-2 py-1 rounded capitalize`}>
                        {String(status).replaceAll("_", " ")}
                      </div>
                      <div className="font-semibold mt-1">{CLP.format(total)}</div>
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
