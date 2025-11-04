import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useState } from "react";
import { login as loginApi } from "../services/auth";   

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await loginApi(email, password);
      localStorage.setItem("token", data.token);
     nav(data.user.role === "admin" ? "/admin" : "/cuenta");
    } catch (err) {
      setError(err?.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link className="text-teal-600 font-medium hover:underline" to="/register">
            Regístrate ahora
          </Link>
        </>
      }
    >
      <h1 className="text-xl font-semibold text-center mb-4">Iniciar sesión</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">Contraseña</label>
          <input
            type="password"
            className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="••••••••"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
          <div className="text-right">
            <button
              type="button"
              className="text-xs text-teal-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className={`w-full py-2.5 rounded-xl font-medium transition
            ${loading ? "bg-gray-300 text-gray-600" : "bg-teal-600 text-white hover:bg-teal-700"}`}
        >
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </AuthLayout>
  );
}
