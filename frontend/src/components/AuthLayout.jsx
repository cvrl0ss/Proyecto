import { Link } from "react-router-dom";
import Logo from "./Logo";

export default function AuthLayout({ children, footer }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-100 to-white flex items-center justify-center p-4">
      <div className="w-[380px] max-w-full bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-6 text-center">
          <Logo />
        </div>
        {children}
        {footer && (
          <div className="mt-4 text-center text-sm text-gray-600">
            {footer}
          </div>
        )}
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-gray-400 hover:underline">Volver al inicio</Link>
        </div>
      </div>
    </div>
  );
}
