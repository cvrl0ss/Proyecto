// src/pages/account/AccountHome.jsx
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { me } from "../../services/auth";
import AppLayout from "./AppLayout";

export default function AccountHome() {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      nav("/login");
      return;
    }

    me()
      .then(({ data }) => setUser(data)) // { id, name, email, role, ... }
      .catch(() => {
        localStorage.removeItem("token");
        nav("/login");
      })
      .finally(() => setLoading(false));
  }, [nav]);

  if (loading) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Cargando cuenta…</div>
      </div>
    );
  }
  if (!user) return null;

  const isClient = user.role === "client";
  const isShop   = user.role === "shop";

  return (
    <AppLayout>
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
          {user.name?.[0]?.toUpperCase() || "V"}
        </div>
        <div>
          <div className="text-xl font-semibold">
            {isShop ? `Cuenta Taller - ${user.name?.replace(/^Cuenta Taller -\s*/i, "")}` : user.name}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </div>

      {/* Acciones por rol */}
      <div className="space-y-3">
        <Link
          to="/cuenta/editar"
          className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
        >
          ✏️ Editar perfil
        </Link>

        <Link
          to="/cuenta/password"
          className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
        >
          🔒 Cambiar contraseña
        </Link>

        {isClient && (
          <>
            <Link
              to="/cuenta/vehiculos"
              className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
            >
              🚗 Mis vehículos registrados
            </Link>
            <Link
              to="/cuenta/historial"
              className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
            >
              📄 Historial de servicios
            </Link>
          </>
        )}

        {isShop && (
          <>
            <Link
              to="/taller"
              className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
            >
              👥 Clientes (órdenes del taller)
            </Link>
            <Link
              to="/taller/historial"
              className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition"
            >
              📄 Historial (terminados)
            </Link>
            {/* más adelante:
            <Link to="/taller/perfil" className="block bg-white rounded-xl shadow p-4 hover:shadow-md transition">
              🛠️ Editar datos del taller
            </Link>
            */}
          </>
        )}

        <button
          onClick={() => {
            localStorage.removeItem("token");
            nav("/login");
          }}
          className="w-full text-left bg-white rounded-xl shadow p-4 hover:shadow-md transition text-red-600"
        >
          ⏏️ Cerrar sesión
        </button>
      </div>
    </AppLayout>
  );
}
