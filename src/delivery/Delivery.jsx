import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useCartStore, selectTotalUSD } from "../cart/useCartStore";
import { useOrderStore } from "../orders/useOrderStore";
import { useHaptic } from "../hooks/useHaptic";
import { useAudio } from "../hooks/useAudio";
import "./delivery.css";

// ─── Constantes del negocio ───────────────────────────────────────────────────
const NEGOCIO         = { lat: 8.266546326497043, lng: -62.75395518836217 };
const TARIFA_MOTO     = 0.52;
const TARIFA_CARRO    = 1.05;
const DELIVERY_MINIMO = 1.00;

const UMBRALES_CARRO = {
  "12x12": 30,
  "20x25": 20,
  "25x30": 10,
};

// ─── Fix icono Leaflet ────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// ─── Haversine ───────────────────────────────────────────────────────────────
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── ¿Requiere carro? ────────────────────────────────────────────────────────
const requiereCarro = (items) =>
  items.some((item) => {
    const match = item.nombre.match(/(\d+x\d+)/i);
    if (!match) return false;
    const medida = match[1].toLowerCase();
    const umbral = UMBRALES_CARRO[medida];
    return umbral !== undefined && item.qty >= umbral;
  });

// ─── Captura clicks en el mapa ───────────────────────────────────────────────
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
};

// ─── Hook: número animado (count-up) ─────────────────────────────────────────
const useCountUp = (target, duration = 500) => {
  const [val, setVal]     = useState(target);
  const prevRef           = useRef(target);
  const rafRef            = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;
    if (from === target) return;

    const start = performance.now();
    const animate = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setVal(parseFloat((from + (target - from) * eased).toFixed(2)));
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
      else setVal(target);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return val;
};

// ─────────────────────────────────────────────────────────────────────────────
const Delivery = () => {
  const navigate      = useNavigate();
  const { vibrate }   = useHaptic();
  const { playClick } = useAudio();

  const items    = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectTotalUSD);
  const { setDeliveryData, setTotals } = useOrderStore();

  const [pin,        setPin]        = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError,   setGpsError]   = useState("");

  const [direccion, setDireccion] = useState("");
  const [telefono,  setTelefono]  = useState("");

  // Controla si el botón acaba de activarse (para el pulse)
  const [btnJustReady, setBtnJustReady] = useState(false);

  const usaCarro     = requiereCarro(items);
  const tarifa       = usaCarro ? TARIFA_CARRO : TARIFA_MOTO;
  const vehiculo     = usaCarro ? "Carro" : "Moto";
  const vehiculoIcon = usaCarro ? "🚗" : "🏍️";

  const distanciaKm = pin
    ? haversineKm(NEGOCIO.lat, NEGOCIO.lng, pin.lat, pin.lng)
    : null;

  const precioDeliveryRaw = distanciaKm !== null
    ? Math.max(distanciaKm * tarifa, DELIVERY_MINIMO)
    : 0;

  const precioDelivery = distanciaKm !== null
    ? parseFloat(precioDeliveryRaw.toFixed(2))
    : null;

  const totalFinal = precioDelivery !== null
    ? parseFloat((subtotal + precioDelivery).toFixed(2))
    : null;

  const telefonoValido = telefono.replace(/\D/g, "").length >= 7;
  const puedeContin    = pin && direccion.trim().length > 3 && telefonoValido;

  // Números animados en el resumen
  const animatedDelivery = useCountUp(precioDelivery ?? 0);
  const animatedTotal    = useCountUp(totalFinal    ?? subtotal);

  // ¿Precio ajustado al mínimo?
  const aplicoMinimo = distanciaKm !== null &&
    (distanciaKm * tarifa) < DELIVERY_MINIMO;

  // Pulse del botón cuando recién se habilita
  const prevPuedeContin = useRef(false);
  useEffect(() => {
    if (puedeContin && !prevPuedeContin.current) {
      setBtnJustReady(true);
      setTimeout(() => setBtnJustReady(false), 1200);
    }
    prevPuedeContin.current = !!puedeContin;
  }, [puedeContin]);

  // ─── GPS al montar ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsError("Tu navegador no soporta GPS.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => {
        setGpsError("No se pudo obtener tu ubicación. Toca el mapa para colocar el pin.");
        setGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  const handleMapClick = useCallback((latlng) => {
    setPin({ lat: latlng.lat, lng: latlng.lng });
    setGpsError("");
    vibrate && vibrate("light");
  }, [vibrate]);

  const handleGPS = useCallback(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
        vibrate && vibrate("light");
      },
      () => {
        setGpsError("No se pudo obtener ubicación.");
        setGpsLoading(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, [vibrate]);

  const handleContinuar = useCallback(() => {
    if (!puedeContin) return;
    setDeliveryData({
      lat:           pin.lat,
      lng:           pin.lng,
      direccion:     direccion.trim(),
      telefono:      telefono.trim(),
      distanciaKm:   parseFloat(distanciaKm.toFixed(2)),
      precioDelivery,
      vehiculo,
    });
    setTotals(totalFinal, precioDelivery);
    playClick && playClick();
    vibrate && vibrate("medium");
    navigate("/payment");
  }, [puedeContin, pin, direccion, telefono, distanciaKm,
      precioDelivery, vehiculo, totalFinal,
      setDeliveryData, setTotals, navigate, playClick, vibrate]);

  const mapCenter = pin
    ? [pin.lat, pin.lng]
    : [NEGOCIO.lat, NEGOCIO.lng];

  const btnLabel = !pin
    ? "📍 Coloca tu ubicación en el mapa"
    : !direccion.trim()
    ? "✍️ Escribe tu dirección"
    : !telefonoValido
    ? "📞 Ingresa tu teléfono"
    : "Continuar al pago →";

  return (
    <div className="delivery-screen">

      {/* HEADER */}
      <div className="delivery-header">
        <button className="delivery-back-btn" onClick={() => navigate(-1)}>
          ‹
        </button>
        <h2 className="delivery-title">¿Dónde te lo enviamos?</h2>
      </div>

      {/* MAPA */}
      <div className="delivery-map-wrapper">
        {gpsLoading && (
          <div className="delivery-map-overlay">
            <div className="spinner" />
            <span>Obteniendo ubicación…</span>
          </div>
        )}
        <MapContainer
          center={mapCenter}
          zoom={14}
          className="delivery-map"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a>'
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {pin && <Marker position={[pin.lat, pin.lng]} />}
        </MapContainer>
        <button className="delivery-gps-btn" onClick={handleGPS} title="Mi ubicación">
          📍
        </button>
      </div>

      {/* HINT / ERROR GPS */}
      {gpsError
        ? <p className="delivery-gps-error">{gpsError}</p>
        : <p className="delivery-map-hint">Toca el mapa para ajustar el pin</p>
      }

      {/* FORMULARIO */}
      <div className="delivery-form">

        <div className="delivery-field">
          <label className="delivery-label">Dirección</label>
          <input
            type="text"
            inputMode="text"
            className="custom-input"
            placeholder="Ej: Urb. Las Mercedes, calle 4, casa 12"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
        </div>

        <div className="delivery-field">
          <label className="delivery-label">Teléfono de contacto</label>
          <div className="delivery-phone-wrap">
            <span className="delivery-phone-flag">🇻🇪</span>
            <input
              type="tel"
              inputMode="tel"
              className="delivery-phone-input"
              placeholder="0412 000 0000"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>
        </div>

        <div className="delivery-info-chip">
          <span className="delivery-info-chip-icon">💬</span>
          El repartidor te escribirá al salir y al llegar a tu puerta.
        </div>

      </div>

      {/* RESUMEN DE COSTOS — aparece con stagger cuando hay pin */}
      {pin && (
        <div className="delivery-summary delivery-summary--animate">
          <div className="delivery-summary-row summary-row--1">
            <span>Subtotal lienzos</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="delivery-summary-row summary-row--2">
            <span>
              Delivery {vehiculoIcon} {vehiculo}
              {aplicoMinimo
                ? <small> · mínimo aplicado</small>
                : <small> · {distanciaKm.toFixed(1)} km × ${tarifa}/km</small>
              }
            </span>
            {/* Número animado */}
            <span>${animatedDelivery.toFixed(2)}</span>
          </div>
          <div className="delivery-summary-divider" />
          <div className="delivery-summary-row total summary-row--3">
            <span>Total</span>
            <strong>${animatedTotal.toFixed(2)}</strong>
          </div>
        </div>
      )}

      {/* BOTÓN CONTINUAR */}
      <div className="delivery-footer">
        <button
          className={[
            "delivery-btn-continuar",
            !puedeContin ? "disabled" : "",
            btnJustReady ? "btn-just-ready" : "",
          ].filter(Boolean).join(" ")}
          onClick={handleContinuar}
          disabled={!puedeContin}
        >
          {btnLabel}
        </button>
      </div>

    </div>
  );
};

export default Delivery;