import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { registerWithVehicle } from "../services/auth";
import { listShops, seedShops } from "../services/shops";


export default function Register() {
  const nav = useNavigate();

  // Cuenta
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // Vehículo
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [city, setCity] = useState("");
  const [mileage, setMileage] = useState("");
  const [color, setColor] = useState("");

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    // Validaciones rápidas
    if (password.length < 8) {
      return setError("La contraseña debe tener al menos 8 caracteres.");
    }
    if (password !== password2) {
      return setError("Las contraseñas no coinciden.");
    }
    if (!year || Number(year) < 1980 || Number(year) > new Date().getFullYear() + 1) {
      return setError("Año inválido.");
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        vehicle: {
          plate: plate.toUpperCase().replace(/[\s-]/g, ""), // normaliza patente
          brand,
          model,
          year: Number(year),
          city,
          mileage: mileage ? Number(mileage) : undefined,
          color: color || undefined,
        },
      };

      await registerWithVehicle(payload);
      alert("Cuenta y vehículo creados. Ahora inicia sesión.");
      nav("/login");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 409
          ? "Ya existe un vehículo con esa patente para este usuario."
          : "No se pudo registrar. Intenta de nuevo.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <div className="w-[420px] max-w-full bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-center text-2xl font-semibold mb-4">Crear cuenta</h1>
        {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          {/* Cuenta */}
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Nombre"
            value={name} onChange={e=>setName(e.target.value)} required />
          <input type="email" className="w-full border rounded-xl px-3 py-2" placeholder="tu@correo.com"
            value={email} onChange={e=>setEmail(e.target.value)} required />
          <input type="password" className="w-full border rounded-xl px-3 py-2" placeholder="Contraseña (mín. 8)"
            value={password} onChange={e=>setPassword(e.target.value)} required />
          <input type="password" className="w-full border rounded-xl px-3 py-2" placeholder="Confirmar contraseña"
            value={password2} onChange={e=>setPassword2(e.target.value)} required />

          <hr className="my-2" />

          {/* Vehículo */}
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Patente (ABCD12)"
            value={plate} onChange={e=>setPlate(e.target.value)} required />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Marca"
            value={brand} onChange={e=>setBrand(e.target.value)} required />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Modelo"
            value={model} onChange={e=>setModel(e.target.value)} required />
          <input type="number" className="w-full border rounded-xl px-3 py-2" placeholder="Año (ej: 2018)"
            value={year} onChange={e=>setYear(e.target.value)} required />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Ciudad/Comuna"
            value={city} onChange={e=>setCity(e.target.value)} required />

          {/* Opcionales */}
          <input type="number" min="0" className="w-full border rounded-xl px-3 py-2"
            placeholder="Kilometraje (opcional)" value={mileage} onChange={e=>setMileage(e.target.value)} />
          <input className="w-full border rounded-xl px-3 py-2"
            placeholder="Color (opcional)" value={color} onChange={e=>setColor(e.target.value)} />

          <button
            disabled={loading}
            className={`w-full py-2.5 rounded-xl font-medium transition
            ${loading ? "bg-gray-300 text-gray-600" : "bg-teal-600 text-white hover:bg-teal-700"}`}
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="text-center text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link className="text-teal-700 underline" to="/login">Inicia sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
