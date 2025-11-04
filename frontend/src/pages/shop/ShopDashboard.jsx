// frontend/src/pages/shop/ShopDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { shopListOrders } from "../../services/orders";

export default function ShopDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await shopListOrders();
      setRows(data);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-semibold mb-4">Órdenes del taller</h1>
      {loading ? (
        "Cargando…"
      ) : rows.length === 0 ? (
        <div className="text-gray-600">Aún no hay solicitudes.</div>
      ) : (
        <div className="space-y-3">
          {rows.map((o) => (
            <Link
              key={o._id}
              to={`/taller/orden/${o._id}`}
              className="block bg-white rounded-xl p-4 shadow hover:shadow-md transition"
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{o.customer?.name ?? "Cliente"}</div>
                  <div className="text-sm text-gray-600">
                    {o.vehicle
                      ? `${o.vehicle.brand} ${o.vehicle.model} · ${o.vehicle.plate}`
                      : "Sin vehículo asociado"}
                  </div>
                </div>
                <div className="text-sm px-2 py-1 rounded bg-teal-100 text-teal-800">
                  {o.status}
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(o.createdAt).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
