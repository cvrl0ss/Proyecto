// src/pages/shop/ShopHistory.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import AppLayout from "../account/AppLayout";
import { me } from "../../services/auth";
import { shopListOrders } from "../../services/orders";

export default function ShopHistory() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await me();
        if (u.role !== "shop") { nav("/cuenta", { replace: true }); return; }
        const { data } = await shopListOrders({ bucket: "done" });
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e?.response?.data?.message || "No se pudo cargar el historial");
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  return (
    <AppLayout active="taller">
      <div className="mb-4">
        <Link to="/taller" className="text-teal-600 text-sm">← Volver al panel</Link>
      </div>

      <h1 className="text-xl font-semibold mb-4">Historial (terminados)</h1>

      {loading && <div className="text-gray-500">Cargando…</div>}
      {!loading && error && <div className="text-red-600">{error}</div>}

      {!loading && !error && rows.length === 0 && (
        <div className="bg-white rounded-xl shadow p-4 text-gray-600">
          Aún no tienes servicios terminados.
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="space-y-3">
          {rows.map(o => {
            const finished = o.updatedAt || o.createdAt;
            const when = finished ? new Date(finished).toLocaleString() : "";
            return (
              <div key={o._id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{o.customer?.name || "Cliente"}</div>
                  <div className="text-sm text-gray-600">
                    {o.vehicle
                      ? `${o.vehicle.plate} · ${o.vehicle.brand} ${o.vehicle.model} (${o.vehicle.year})`
                      : "Sin vehículo asociado"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Estado: {String(o.status || "").replaceAll("_", " ")} · {when}
                  </div>
                </div>
                <Link
                  to={`/taller/orden/${o._id}`}
                  className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm"
                >
                  Ver detalle
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
