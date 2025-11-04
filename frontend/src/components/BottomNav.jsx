// src/components/BottomNav.jsx
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const { pathname } = useLocation();

  const item = (to, label) => (
    <Link
      to={to}
      className={`flex-1 text-center py-3 ${
        pathname === to
          ? "text-teal-700 font-semibold"
          : "text-gray-500 hover:text-teal-600"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-sm z-50">
      <div className="max-w-md mx-auto flex">
        {item("/cliente", "Inicio")}
        {item("/talleres", "Talleres")}
        {item("/cuenta", "Cuenta")}
      </div>
    </nav>
  );
}
