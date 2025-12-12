import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VehicleStep from "./pages/VehicleStep.jsx";

// Talleres (cliente)
import Talleres from "./pages/Talleres.jsx";
import ShopDetail from "./pages/ShopDetail.jsx";

// Cuenta (cliente)
import AccountHome from "./pages/account/AccountHome.jsx";
import EditProfile from "./pages/account/EditProfile.jsx";
import ChangePassword from "./pages/account/ChangePassword.jsx";
import MyVehicles from "./pages/account/MyVehicles.jsx";
import ServiceHistory from "./pages/account/ServiceHistory.jsx";

// Dashboard cliente (nuevo)
import ClientDashboard from "./pages/ClientDashboard.jsx";

import AdminOrders from "./pages/AdminOrders.jsx";

// Panel del taller
import ShopDashboard from "./pages/shop/ShopDashboard.jsx";
import ShopOrderDetail from "./pages/shop/ShopOrderDetail.jsx";
import ShopHistory from "./pages/shop/ShopHistory.jsx";

// ya NO necesitamos AppLayout acá
// import AppLayout from "./pages/account/AppLayout.jsx";

function AdminDashboard() {
  return (
    <div className="p-6">
      Panel Admin — aquí crearás órdenes y cambiarás estados.
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding/vehicle" element={<VehicleStep />} />

      {/* dashboards */}
      <Route path="/cliente" element={<ClientDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* talleres (cliente) */}
      <Route path="/talleres" element={<Talleres />} />
      <Route path="/talleres/:id" element={<ShopDetail />} />

      {/* cuenta (cliente) */}
      <Route path="/cuenta" element={<AccountHome />} />
      <Route path="/cuenta/editar" element={<EditProfile />} />
      <Route path="/cuenta/password" element={<ChangePassword />} />
      <Route path="/cuenta/vehiculos" element={<MyVehicles />} />
      <Route path="/cuenta/historial" element={<ServiceHistory />} />

      {/* panel del TALLER */}
      <Route path="/taller" element={<ShopDashboard />} />
      <Route path="/taller/orden/:id" element={<ShopOrderDetail />} />
      <Route path="/taller/historial" element={<ShopHistory />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
