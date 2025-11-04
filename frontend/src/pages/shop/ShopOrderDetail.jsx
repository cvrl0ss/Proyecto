import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder, shopUpdateOrder, shopUploadPhotos } from "../../services/orders";

export default function ShopOrderDetail() {
  const { id } = useParams();
  const [o, setO] = useState(null);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState("");
  const [breakdown, setBreakdown] = useState("");
  const [eta, setEta] = useState("");
  const [note, setNote] = useState("");

  async function reload() {
    const { data } = await getOrder(id);
    setO(data);
    setLoading(false);
  }
  useEffect(() => { reload(); }, [id]);

  async function sendEstimate(nextStatus) {
    await shopUpdateOrder(id, {
      status: nextStatus,
      estimate: { amount: Number(amount || 0), breakdown, currency: "CLP" },
      etaHours: eta ? Number(eta) : undefined,
      note
    });
    setNote("");
    reload();
  }

  async function addPhotos(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    await shopUploadPhotos(id, files);
    reload();
  }

  if (loading || !o) return <div className="p-4">Cargando…</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      <h1 className="text-xl font-semibold">
        Orden #{o._id.slice(-6)} — {o.status}
      </h1>

      <div className="bg-white rounded-xl p-4 shadow">
        <div className="font-semibold mb-1">{o.customer?.name}</div>
        <div className="text-sm text-gray-600">
          {o.vehicle?.brand} {o.vehicle?.model} · {o.vehicle?.plate}
        </div>
        <div className="mt-2 text-gray-700">{o.description}</div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow space-y-2">
        <div className="font-semibold">Presupuesto / Estado</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input className="border rounded px-2 py-1" placeholder="Monto CLP"
            value={amount} onChange={e=>setAmount(e.target.value)} />
          <input className="border rounded px-2 py-1" placeholder="ETA (horas)"
            value={eta} onChange={e=>setEta(e.target.value)} />
        </div>
        <input className="border rounded px-2 py-1 w-full" placeholder="Detalle del presupuesto"
          value={breakdown} onChange={e=>setBreakdown(e.target.value)} />
        <input className="border rounded px-2 py-1 w-full" placeholder="Nota (opcional)"
          value={note} onChange={e=>setNote(e.target.value)} />
        <div className="flex flex-wrap gap-2 mt-2">
          <button className="bg-emerald-600 text-white rounded px-3 py-2"
                  onClick={()=>sendEstimate("ACCEPTED")}>Aprobar y enviar</button>
          <button className="bg-rose-600 text-white rounded px-3 py-2"
                  onClick={()=>sendEstimate("REJECTED")}>Rechazar</button>
          <button className="bg-slate-600 text-white rounded px-3 py-2"
                  onClick={()=>shopUpdateOrder(id,{ note }).then(()=>{setNote("");reload();})}>
            Agregar nota
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow space-y-2">
        <div className="font-semibold">Fotos de avance</div>
        <input type="file" multiple onChange={addPhotos} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {o.photos?.map((p,i)=>(
            <img key={i} src={typeof p === "string" ? p : p.url} alt="" className="w-full h-32 object-cover rounded" />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow">
        <div className="font-semibold mb-2">Timeline</div>
        <ul className="space-y-1 text-sm">
          {o.timeline?.slice().reverse().map((t,i)=>(
            <li key={i}>
              [{new Date(t.when || o.createdAt).toLocaleString()}] <b>{t.status}</b> — {t.note}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
