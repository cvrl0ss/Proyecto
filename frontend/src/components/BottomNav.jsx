import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { me } from "../services/auth";

export default function BottomNav() {
  const loc = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const cached = localStorage.getItem("role");
    if (cached) setRole(cached);
    me().then(({ data }) => {
      setRole(data.role);
      localStorage.setItem("role", data.role);
    }).catch(() => {});
  }, []);

  const isShop = role === "shop";

  const tabs = isShop
    ? [
        { to: "/taller", label: "Inicio" },            // Dashboard taller
        { to: "/taller/historial", label: "Historial" },// Lista/historial del taller
        { to: "/cuenta", label: "Cuenta" },
      ]
    : [
        { to: "/cliente", label: "Inicio" },
        { to: "/talleres", label: "Talleres" },
        { to: "/cuenta", label: "Cuenta" },
      ];

  // activo si coincide exacto o es una subruta
  const isActive = (path) =>
    loc.pathname === path || loc.pathname.startsWith(path + "/");

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t shadow-sm">
      <div className="max-w-3xl mx-auto grid grid-cols-3 text-sm">
        {tabs.map((t, idx) => (
          <Link
            key={`${t.to}-${idx}`}   // key siempre única
            to={t.to}
            className={`text-center py-3 ${
              isActive(t.to) ? "text-teal-700 font-medium" : "text-gray-600"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
