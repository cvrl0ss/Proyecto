// src/pages/shop/ShopDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AppLayout from "../account/AppLayout";
import { me } from "../../services/auth";
import { getMyShop } from "../../services/shops";
import { shopListOrders } from "../../services/orders";

export default function ShopDashboard() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [shop, setShop] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data: u } = await me();
        if (u.role !== "shop") { nav("/cuenta", { replace: true }); return; }

        const [{ data: s }, { data: grouped }] = await Promise.all([
          getMyShop(),
          shopListOrders({ group: 1 }),
        ]);

        setShop(s || null);
        setQuotes(grouped?.quotes || []);
        setActive(grouped?.active || []);
      } catch (e) {
        setError(e?.response?.data?.message || "No se pudo cargar el panel");
      } finally {
        setLoading(false);
      }
    })();
  }, [nav]);

  if (loading) {
    return (
      <AppLayout active={pathname === "/taller" ? "taller" : "inicio"}>
        <div className="p-4 text-gray-500">Cargando panel del taller…</div>
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

  if (!shop) {
    return (
      <AppLayout active="taller">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-semibold mb-1">Tu cuenta de taller no tiene un Shop asociado.</div>
          <div className="text-sm text-gray-600">
            Pídele al admin que asigne <code>user.shop</code> o usa el seed
            {" "}<code>/api/users/seed-shop-user?key=SEED_KEY</code>.
          </div>
        </div>
      </AppLayout>
    );
  }

  const Item = ({ o }) => {
    const created = o.createdAt ? new Date(o.createdAt).toLocaleString() : "";
    return (
      <div className="border rounded-lg p-3 flex items-center justify-between">
        <div>
          <div className="font-medium">{o.customer?.name || "Cliente"}</div>
          <div className="text-sm text-gray-600">
            {o.vehicle
              ? `${o.vehicle.plate} · ${o.vehicle.brand} ${o.vehicle.model} (${o.vehicle.year})`
              : "Sin vehículo asociado"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Estado: {String(o.status || "").replaceAll("_", " ")} · {created}
          </div>
        </div>
        <Link to={`/taller/orden/${o._id}`} className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm">
          Ver detalle
        </Link>
      </div>
    );
  };

  return (
    <AppLayout active="taller">
      {/* Header taller */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="text-xl font-semibold">{shop?.name || "Mi taller"}</div>
        <div className="text-sm text-gray-600">{shop?.city} · {shop?.address} · {shop?.phone}</div>
        <div className="mt-2 flex items-center gap-3">
          <Link to="/cuenta/editar" className="text-teal-600 text-sm hover:underline">
            Editar perfil del usuario
          </Link>
          <span className="text-gray-300">•</span>
          <button
            className="text-teal-600 text-sm hover:underline"
            onClick={() => alert("Edición de datos del taller llega enseguida (PUT /api/shops/mine).")}
          >
            Editar datos del taller (pronto)
          </button>
          <span className="flex-1" />
          <Link
            to="/taller/historial"
            className="text-sm px-3 py-1 rounded-lg bg-gray-900 text-white"
          >
            Ver historial (terminados)
          </Link>
        </div>
      </div>

      {/* Cotizaciones */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Cotizaciones</div>
          <div className="text-sm text-gray-500">{quotes.length} pendientes</div>
        </div>
        {quotes.length === 0
          ? <div className="text-gray-500 text-sm">No hay cotizaciones nuevas.</div>
          : <div className="space-y-3">{quotes.map(o => <Item key={o._id} o={o} />)}</div>}
      </div>

      {/* Casos en curso */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold">Casos en curso</div>
          <div className="text-sm text-gray-500">{active.length} activos</div>
        </div>
        {active.length === 0
          ? <div className="text-gray-500 text-sm">Aún no hay vehículos en proceso.</div>
          : <div className="space-y-3">{active.map(o => <Item key={o._id} o={o} />)}</div>}
      </div>
    </AppLayout>
  );
}
