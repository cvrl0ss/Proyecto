import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { me } from "../../services/auth";
import { updateProfile } from "../../services/users";

export default function EditProfile() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    me()
      .then(({ data }) =>
        setForm({
          name: data?.name || "",
          phone: data?.phone || "",
          city: data?.city || "",
        })
      )
      .catch(() => {
        localStorage.removeItem("token");
        nav("/login");
      })
      .finally(() => setLoading(false));
  }, [nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateProfile(form);
      alert("Perfil actualizado");
      nav("/cuenta");
    } catch (err) {
      setError(err?.response?.data?.message || "No se pudo actualizar el perfil");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <AppLayout active="cuenta"><div className="p-4 text-gray-500">Cargando…</div></AppLayout>;

  return (
    <AppLayout active="cuenta">
      <h1 className="text-2xl font-semibold mb-4">Editar perfil</h1>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3 max-w-md">
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Teléfono (opcional)"
          value={form.phone}
          onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
        />
        <input
          className="w-full border rounded-xl px-3 py-2"
          placeholder="Ciudad/Comuna"
          value={form.city}
          onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))}
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
