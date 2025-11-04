import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { changePassword } from "../../services/users";

export default function ChangePassword() {
  const nav = useNavigate();
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) return setError("La nueva contraseña debe tener al menos 8 caracteres.");
    if (newPassword !== confirm) return setError("La confirmación no coincide.");

    setSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      alert("Contraseña actualizada");
      nav("/cuenta");
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo cambiar la contraseña");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout active="cuenta">
      <h1 className="text-2xl font-semibold mb-4">Cambiar contraseña</h1>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3 max-w-md">
        <input
          type="password"
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Contraseña actual"
          value={currentPassword}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Nueva contraseña (mín. 8)"
          value={newPassword}
          onChange={(e) => setNew(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Confirmar nueva contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <button
          disabled={saving}
          className={`w-full py-2.5 rounded-xl text-white font-medium transition ${
            saving ? "bg-gray-300" : "bg-teal-600 hover:bg-teal-700"
          }`}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </AppLayout>
  );
}
