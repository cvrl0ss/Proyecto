// src/pages/account/MyVehicles.jsx
import { useEffect, useState } from "react";
import AppLayout from "./AppLayout";
import {
  listMyVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../../services/vehicles";

const emptyForm = {
  plate: "", brand: "", model: "", year: "", city: "",
  mileage: "", color: ""
};

export default function MyVehicles() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const { data } = await listMyVehicles();
      setList(data);
    } catch {
      setError("No se pudo cargar la lista de vehículos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function onCreate(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await createVehicle(form);
      setForm(emptyForm);
      setAdding(false);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo crear el vehículo.");
    } finally {
      setSaving(false);
    }
  }

  async function onUpdate(e) {
    e.preventDefault();
    if (!editId) return;
    setSaving(true);
    setError("");
    try {
      await updateVehicle(editId, form);
      setEditId(null);
      setForm(emptyForm);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el vehículo.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("¿Eliminar este vehículo?")) return;
    try {
      await deleteVehicle(id);
      await refresh();
    } catch {
      alert("No se pudo eliminar.");
    }
  }

  const Form = ({ title, onSubmit }) => (
    <form onSubmit={onSubmit} className="space-y-3 bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="grid md:grid-cols-2 gap-3">
        <input className="border rounded-lg px-3 py-2" placeholder="Patente"
          value={form.plate} onChange={(e)=>setForm(f=>({...f, plate:e.target.value}))} required />
        <input className="border rounded-lg px-3 py-2" placeholder="Marca"
          value={form.brand} onChange={(e)=>setForm(f=>({...f, brand:e.target.value}))} required />
        <input className="border rounded-lg px-3 py-2" placeholder="Modelo"
          value={form.model} onChange={(e)=>setForm(f=>({...f, model:e.target.value}))} required />
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Año"
          value={form.year} onChange={(e)=>setForm(f=>({...f, year:e.target.value}))} required />
        <input className="border rounded-lg px-3 py-2" placeholder="Ciudad/Comuna"
          value={form.city} onChange={(e)=>setForm(f=>({...f, city:e.target.value}))} required />
        <input type="number" className="border rounded-lg px-3 py-2" placeholder="Kilometraje (opcional)"
          value={form.mileage} onChange={(e)=>setForm(f=>({...f, mileage:e.target.value}))} />
        <input className="border rounded-lg px-3 py-2 md:col-span-2" placeholder="Color (opcional)"
          value={form.color} onChange={(e)=>setForm(f=>({...f, color:e.target.value}))} />
      </div>
      <div className="flex gap-2">
        <button disabled={saving}
          className={`px-4 py-2 rounded-lg text-white ${saving ? "bg-gray-300" : "bg-teal-600 hover:bg-teal-700"}`}>
          {saving ? "Guardando..." : "Guardar"}
        </button>
        <button type="button" className="px-4 py-2 rounded-lg border"
          onClick={() => { setAdding(false); setEditId(null); setForm(emptyForm); }}>
          Cancelar
        </button>
      </div>
    </form>
  );

  return (
    <AppLayout active="cuenta">
      <h1 className="text-2xl font-semibold mb-4">Mis vehículos</h1>

      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}

      {loading ? (
        <div className="text-gray-500">Cargando…</div>
      ) : (
        <>
          {/* Lista */}
          <div className="space-y-3 mb-6">
            {list.length === 0 && (
              <div className="text-gray-600">Aún no has agregado vehículos.</div>
            )}
            {list.map(v => (
              <div key={v._id} className="bg-white rounded-xl shadow p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{v.brand} {v.model} · {v.year}</div>
                    <div className="text-sm text-gray-600">Patente: {v.plate} · {v.city}</div>
                    <div className="text-sm text-gray-600">
                      {v.color ? `Color: ${v.color} · ` : ""}Km: {v.mileage ?? 0}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded-lg border"
                      onClick={() => { setEditId(v._id); setForm({
                        plate: v.plate, brand: v.brand, model: v.model, year: v.year,
                        city: v.city, mileage: v.mileage ?? "", color: v.color ?? ""
                      });}}
                    >
                      Editar
                    </button>
                    <button
                      className="px-3 py-1 rounded-lg border text-red-600"
                      onClick={() => onDelete(v._id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Crear / Editar */}
          {editId ? (
            <Form title="Editar vehículo" onSubmit={onUpdate} />
          ) : adding ? (
            <Form title="Agregar vehículo" onSubmit={onCreate} />
          ) : (
            <button
              className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
              onClick={() => setAdding(true)}
            >
              + Agregar vehículo
            </button>
          )}
        </>
      )}
    </AppLayout>
  );
}
