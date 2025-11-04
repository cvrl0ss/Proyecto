import { useEffect, useState } from "react";
import { updateOrder, getOrder } from "../services/orders";
import api from "../services/api";

export default function AdminOrders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true);
    setMsg("");
    try {
      // en dev: trae todas las órdenes (haz una ruta admin en backend si quieres filtrar por shop)
      const { data } = await api.get("/orders"); // << si no tienes esta ruta, puedes listar por /orders/mine pero con admin no aplica
      setRows(data);
    } catch {
      setMsg("No se pudo cargar órdenes (crea una ruta GET /api/orders para admin).");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); }, []);

  async function setStatus(id, payload) {
    try {
      await updateOrder(id, payload);
      await load();
    } catch {
      alert("No se pudo actualizar");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-xl font-semibold mb-4">Órdenes (Admin)</h1>
      {msg && <div className="text-sm text-red-600 mb-3">{msg}</div>}
      {loading ? "Cargando…" : rows.length===0 ? "Sin órdenes" : (
        <div className="space-y-3">
          {rows.map(o=>(
            <div key={o._id} className="bg-white rounded-xl shadow p-4">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{o.title || o.description.slice(0,40)}</div>
                  <div className="text-sm text-gray-600">
                    Cliente: {o.customer?.name} · Taller: {o.shop?.name}
                  </div>
                  <div className="text-sm">Estado: <b>{o.status}</b></div>
                </div>
                <div className="text-right">
                  <button className="px-2 py-1 border rounded mr-2" onClick={()=>setStatus(o._id,{status:"CHECKED_IN", etaHours:4})}>Ingresó</button>
                  <button className="px-2 py-1 border rounded mr-2" onClick={()=>setStatus(o._id,{status:"IN_PROGRESS"})}>En proceso</button>
                  <button className="px-2 py-1 border rounded mr-2" onClick={()=>setStatus(o._id,{estimate:{amount:130000, breakdown:"MO:80k\nRep:50k"}})}>Presupuesto</button>
                  <button className="px-2 py-1 border rounded" onClick={()=>setStatus(o._id,{status:"READY"})}>Listo</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
