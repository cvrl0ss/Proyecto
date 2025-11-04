import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "./account/AppLayout";
import { getShop } from "../services/shops";
import { createOrder } from "../services/orders";
import { listMyVehicles } from "../services/vehicles";

export default function ShopDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [shop, setShop] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // formulario orden
  const [vehicleId, setVehicleId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: shopData }, { data: vehData }] = await Promise.all([
          getShop(id),
          listMyVehicles()
        ]);
        setShop(shopData);
        setVehicles(vehData);
        if (vehData[0]?._id) setVehicleId(vehData[0]._id);
        if (shopData.services?.[0]?.name) setServiceName(shopData.services[0].name);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function onCreateOrder(e) {
    e.preventDefault();
    if (!vehicleId || !serviceName) return;

    setSaving(true);
    try {
      const svc = shop.services.find(s => s.name === serviceName);
      await createOrder({
        vehicleId,
        shopId: shop._id,
        serviceName,
        priceEstimate: svc?.basePrice,
        notes
      });
      alert("Solicitud enviada al taller ✨");
      nav("/cuenta/historial");
    } catch {
      alert("No se pudo crear la orden");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout active="talleres">
      {loading || !shop ? (
        <div className="text-gray-500">Cargando…</div>
      ) : (
        <>
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">{shop.name}</h1>
            <div className="text-sm text-gray-600">
              {shop.city} · {shop.address} · ⭐ {shop.rating?.toFixed(1)}
            </div>
            {shop.phone && <div className="text-sm text-gray-600">Tel: {shop.phone}</div>}
          </div>

          <h2 className="font-semibold mb-2">Servicios</h2>
          <div className="space-y-2 mb-6">
            {shop.services?.map(s => (
              <div key={s.name} className="flex justify-between bg-white rounded-xl p-3 shadow">
                <div>{s.name}</div>
                <div className="text-sm text-gray-700">${s.basePrice.toLocaleString()}</div>
              </div>
            ))}
            {!shop.services?.length && <div className="text-gray-600">Sin servicios publicados.</div>}
          </div>

          <form onSubmit={onCreateOrder} className="bg-white rounded-2xl p-4 shadow space-y-3">
            <h3 className="font-semibold">Solicitar servicio</h3>
            <select
              className="w-full border rounded-xl px-3 py-2"
              value={vehicleId}
              onChange={(e)=>setVehicleId(e.target.value)}
              required
            >
              {vehicles.map(v => (
                <option key={v._id} value={v._id}>
                  {v.brand} {v.model} · {v.plate}
                </option>
              ))}
            </select>

            <select
              className="w-full border rounded-xl px-3 py-2"
              value={serviceName}
              onChange={(e)=>setServiceName(e.target.value)}
              required
            >
              {shop.services.map(s => (
                <option key={s.name} value={s.name}>
                  {s.name} ({`$${s.basePrice.toLocaleString()}`})
                </option>
              ))}
            </select>

            <textarea
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Notas para el taller (opcional)"
              value={notes}
              onChange={(e)=>setNotes(e.target.value)}
              rows={3}
            />

            <button
              disabled={saving}
              className={`w-full py-2.5 rounded-xl text-white ${saving ? "bg-gray-300" : "bg-teal-600 hover:bg-teal-700"}`}
            >
              {saving ? "Enviando…" : "Enviar solicitud"}
            </button>
          </form>
        </>
      )}
    </AppLayout>
  );
}
