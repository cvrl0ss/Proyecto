import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "./account/AppLayout";
import { getShop } from "../services/shops";
import { createOrder } from "../services/orders";
import { listMyVehicles } from "../services/vehicles";

export default function ShopDetail() {
  const { id } = useParams();
  const nav = useNavigate();

  const [shop, setShop] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // formulario orden
  const [vehicleId, setVehicleId] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: shopData }, { data: vehData }] = await Promise.all([
          getShop(id),
          listMyVehicles(),
        ]);

        const listVeh = Array.isArray(vehData) ? vehData : [];
        setShop(shopData || null);
        setVehicles(listVeh);

        // preselecciona primer vehículo y primer servicio
        if (listVeh[0]?._id) setVehicleId(listVeh[0]._id);
        if (shopData?.services?.[0]?.name) {
          setServiceName(shopData.services[0].name);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setPhotos(files);
  };

  async function onCreateOrder(e) {
    e.preventDefault();

    if (!vehicleId) {
      alert("Debes seleccionar un vehículo");
      return;
    }
    if (!serviceName) {
      alert("Selecciona un servicio");
      return;
    }
    if (!description.trim()) {
      alert("Describe el problema del vehículo");
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();

      // Campos que el backend espera
      fd.append("shopId", shop._id);
      fd.append("vehicleId", vehicleId); // 👈 AQUÍ VA EL VÍNCULO CON EL AUTO
      fd.append("title", serviceName || "Solicitud de servicio");
      fd.append("description", description);
      if (contactPhone) fd.append("contactPhone", contactPhone);

      // Fotos del daño (opcional)
      for (const file of photos) {
        fd.append("photos", file);
      }

      await createOrder(fd);

      alert("Solicitud enviada al taller ✨");
      nav("/cliente"); // o "/cuenta/historial", como prefieras mostrarla
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message || "No se pudo crear la orden"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppLayout active="talleres">
      {loading || !shop ? (
        <div className="text-gray-500">Cargando…</div>
      ) : (
        <>
          {/* Header del taller */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">{shop.name}</h1>
            <div className="text-sm text-gray-600">
              {shop.city} · {shop.address} · ⭐{" "}
              {shop.rating ? shop.rating.toFixed(1) : "—"}
            </div>
            {shop.phone && (
              <div className="text-sm text-gray-600">
                Tel: {shop.phone}
              </div>
            )}
          </div>

          {/* Lista de servicios */}
          <h2 className="font-semibold mb-2">Servicios</h2>
          <div className="space-y-2 mb-6">
            {shop.services?.length ? (
              shop.services.map((s) => (
                <div
                  key={s.name}
                  className="flex justify-between bg-white rounded-xl p-3 shadow"
                >
                  <div>{s.name}</div>
                  <div className="text-sm text-gray-700">
                    ${s.basePrice.toLocaleString("es-CL")}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-600">Sin servicios publicados.</div>
            )}
          </div>

          {/* Formulario para la solicitud */}
          <form
            onSubmit={onCreateOrder}
            className="bg-white rounded-2xl p-4 shadow space-y-3"
          >
            <h3 className="font-semibold">Solicitar servicio</h3>

            {/* Selección de vehículo */}
            {vehicles.length === 0 ? (
              <div className="text-sm text-gray-600">
                Aún no tienes vehículos registrados. Registra uno en{" "}
                <strong>Cuenta &gt; Mis vehículos</strong>.
              </div>
            ) : (
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
              >
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.brand} {v.model} · {v.plate}
                  </option>
                ))}
              </select>
            )}

            {/* Servicio del taller */}
            {shop.services?.length > 0 && (
              <select
                className="w-full border rounded-xl px-3 py-2"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                required
              >
                {shop.services.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name} (
                    {`$${s.basePrice.toLocaleString("es-CL")}`})
                  </option>
                ))}
              </select>
            )}

            {/* Descripción del caso (tu texto larguísimo del choque) */}
            <textarea
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Describe el problema: cómo ocurrió el choque, daños visibles, ruidos, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />

            {/* Teléfono de contacto */}
            <input
              className="w-full border rounded-xl px-3 py-2"
              placeholder="Teléfono de contacto (opcional)"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />

            {/* Fotos del daño */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Fotos del daño (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFiles}
                className="w-full text-sm"
              />
            </div>

            <button
              disabled={saving || vehicles.length === 0}
              className={`w-full py-2.5 rounded-xl text-white ${
                saving || vehicles.length === 0
                  ? "bg-gray-300"
                  : "bg-teal-600 hover:bg-teal-700"
              }`}
            >
              {saving ? "Enviando…" : "Enviar solicitud"}
            </button>
          </form>
        </>
      )}
    </AppLayout>
  );
}
