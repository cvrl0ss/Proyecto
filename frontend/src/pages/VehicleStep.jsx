import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createVehicle } from "../services/vehicles";

export default function VehicleStep() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    plate: "", brand: "", model: "", year: "", city: "", mileage: "", color: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        year: Number(form.year || 0),
        mileage: form.mileage ? Number(form.mileage) : undefined,
      };
      await createVehicle(payload);
      nav("/cliente"); // listo: a tu dashboard
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo guardar el vehículo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <div className="w-[420px] max-w-full bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-center text-2xl font-semibold mb-4">Datos del vehículo</h1>
        {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input name="plate"  placeholder="Patente (ABCD12)" className="w-full border rounded-xl px-3 py-2" value={form.plate} onChange={onChange} required />
          <input name="brand"  placeholder="Marca"           className="w-full border rounded-xl px-3 py-2" value={form.brand} onChange={onChange} required />
          <input name="model"  placeholder="Modelo"          className="w-full border rounded-xl px-3 py-2" value={form.model} onChange={onChange} required />
          <input name="year"   type="number" placeholder="Año (ej: 2018)" className="w-full border rounded-xl px-3 py-2" value={form.year} onChange={onChange} required />
          <input name="city"   placeholder="Ciudad/Comuna"   className="w-full border rounded-xl px-3 py-2" value={form.city} onChange={onChange} required />
          <input name="mileage"type="number" min="0" placeholder="Kilometraje (opcional)" className="w-full border rounded-xl px-3 py-2" value={form.mileage} onChange={onChange} />
          <input name="color"  placeholder="Color (opcional)" className="w-full border rounded-xl px-3 py-2" value={form.color} onChange={onChange} />
          <button disabled={loading} className={`w-full py-2.5 rounded-xl font-medium ${loading ? "bg-gray-300 text-gray-600" : "bg-teal-600 text-white hover:bg-teal-700"}`}>
            {loading ? "Guardando..." : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  );
}
