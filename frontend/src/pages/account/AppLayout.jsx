// src/pages/account/AppLayout.jsx
import BottomNav from "../../components/BottomNav";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">{children}</div>
      <BottomNav /> {/* se muestra SIEMPRE */}
    </div>
  );
}
