// frontend/src/pages/Talleres.jsx
import { useEffect, useState } from "react";
import AppLayout from "./account/AppLayout";
import { listShops } from "../services/shops";
import { createOrder } from "../services/orders";

export default function Talleres() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal + formulario
  const [showForm, setShowForm] = useState(null); // shop seleccionado
  const [form, setForm] = useState({ description: "", contactPhone: "" });
  const [photos, setPhotos] = useState([]); // File[]
  const [saving, setSaving] = useState(false);

  async function buscar() {
    setLoading(true);
    setError("");
    try {
      const { data } = await listShops({ q, city });
      setItems(data);
    } catch {
      setError("No se pudo buscar talleres.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscar();
  }, []);

  // Selector de fotos: valida tipo, cantidad y tamaño (5 MB c/u)
  function onPickFiles(e) {
    const files = Array.from(e.target.files || []);
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    const MAX_FILES = 5;
    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    const filtered = [];
    for (const f of files) {
      if (!validMimes.includes(f.type)) continue;
      if (f.size > MAX_SIZE) continue;
      filtered.push(f);
      if (filtered.length === MAX_FILES) break;
    }
    setPhotos(filtered);
  }

  async function cotizar(e) {
    e.preventDefault();
    if (!showForm) return;

    setSaving(true);
    setError("");

    try {
      // 👉 Enviar como multipart/form-data
      const fd = new FormData();
      fd.append("shopId", showForm._id);
      fd.append("description", form.description);
      fd.append("contactPhone", form.contactPhone);
      // Si en el futuro agregas vehicleId:
      // fd.append("vehicleId", vehicleId);

      for (const f of photos) fd.append("photos", f);

      await createOrder(fd);

      // Reset UI
      setShowForm(null);
      setForm({ description: "", contactPhone: "" });
      setPhotos([]);
      alert("Solicitud enviada. Revisa tu inicio/historial.");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No se pudo crear la solicitud."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout active="talleres">
      <h1 className="text-xl font-semibold mb-3">Talleres</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border rounded-lg px-3 py-2 flex-1"
          placeholder="Buscar por nombre…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
        />
        <input
          className="border rounded-lg px-3 py-2 w-40"
          placeholder="Ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
        />
        <button
          onClick={buscar}
          className="bg-teal-600 text-white rounded-lg px-4 py-2"
        >
          Buscar
        </button>
      </div>

      {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}

      {loading ? (
        <div className="text-gray-500">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="text-gray-600">No hay resultados.</div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-xl shadow p-4 flex items-start justify-between gap-3"
            >
              <div>
                <div className="font-semibold">{s.name}</div>
                <div className="text-sm text-gray-600">
                  {s.city} · {s.address}
                </div>

                {Array.isArray(s.services) && s.services.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {s.services
                      .map((sv) =>
                        sv?.basePrice != null
                          ? `${sv.name} ($${Number(sv.basePrice).toLocaleString()})`
                          : sv.name
                      )
                      .join(" • ")}
                  </div>
                )}
              </div>

              <button
                className="px-3 py-2 rounded-lg bg-teal-600 text-white"
                onClick={() => {
                  setShowForm(s);
                  setPhotos([]); // limpia selección previa
                }}
              >
                Cotizar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal simple */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow max-w-md w-full p-4">
            <div className="font-semibold mb-2">
              Cotizar con {showForm.name}
            </div>

            <form onSubmit={cotizar} className="space-y-3">
              <textarea
                className="border rounded-lg w-full px-3 py-2"
                rows={4}
                placeholder="Describe el problema o lo que necesitas…"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />

              <input
                className="border rounded-lg w-full px-3 py-2"
                placeholder="Teléfono de contacto"
                value={form.contactPhone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactPhone: e.target.value }))
                }
                required
              />

              {/* Fotos del daño */}
              <div>
                <label className="text-sm font-medium">Adjuntar fotos (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onPickFiles}
                  className="mt-1 block w-full text-sm"
                />
                {photos.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {photos.map((f, i) => (
                      <div key={i} className="w-20 h-20 rounded overflow-hidden border">
                        <img
                          alt={f.name}
                          src={URL.createObjectURL(f)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Máx. 5 imágenes (JPG/PNG/WEBP), 5 MB c/u.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border"
                  onClick={() => {
                    setShowForm(null);
                    setForm({ description: "", contactPhone: "" });
                    setPhotos([]);
                  }}
                >
                  Cancelar
                </button>

                <button
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg text-white ${
                    saving ? "bg-gray-300" : "bg-teal-600 hover:bg-teal-700"
                  }`}
                >
                  {saving ? "Enviando…" : "Enviar solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
