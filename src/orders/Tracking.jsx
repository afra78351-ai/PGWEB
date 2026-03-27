import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageCircle, ChevronDown, ChevronUp, Package, X, Star, Send } from "lucide-react";
import { useDeliveryStore } from "../delivery/useDeliveryStore";
import { useOrderStore }    from "./useOrderStore";
import { useCartStore }     from "../cart/useCartStore";
import "./tracking.css";

// ─── Constantes ───────────────────────────────────────────────────────────────
const NEGOCIO     = { lat: 8.266546326497043, lng: -62.75395518836217 };
const TEL_REPARTO = "+5804129246281";
const WA_TIENDA   = "5804264523097";

const VELOCIDAD_KMH  = 50;   // tu velocidad promedio
const MS_EMPAQUETADO = 60_000; // 1 minuto fijo

// ─── Fix Leaflet icons ────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const motoIcon = L.divIcon({
  className: "",
  html: `<div class="tracking-moto-marker">🏍️</div>`,
  iconSize: [40, 40], iconAnchor: [20, 20],
});

const clienteIcon = L.divIcon({
  className: "",
  html: `<div class="tracking-client-marker">🏠</div>`,
  iconSize: [38, 38], iconAnchor: [19, 38],
});

// ─── Pasos del pedido ─────────────────────────────────────────────────────────
const PASOS = [
  { key: "empaquetando", label: "Empaquetando", emoji: "📦" },
  { key: "en_camino",    label: "En camino",    emoji: "🏍️" },
  { key: "cerca",        label: "Cerca de ti",  emoji: "📍" },
  { key: "entregado",    label: "Entregado",    emoji: "✅" },
];

const lerp = (a, b, t) => a + (b - a) * t;

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const MapFlyTo = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { animate: true, duration: 1.2 });
  }, [center[0], center[1], zoom]);
  return null;
};

// ─── Componente de estrellas ──────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => (
  <div className="review-stars">
    {[1, 2, 3, 4, 5].map((n) => (
      <motion.button
        key={n}
        className={`review-star${n <= value ? " active" : ""}`}
        onClick={() => onChange(n)}
        whileTap={{ scale: 0.8 }}
        animate={n <= value ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.25 }}
        aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
      >
        <Star size={28} fill={n <= value ? "#f59e0b" : "none"} color={n <= value ? "#f59e0b" : "#d1d5db"} />
      </motion.button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
const Tracking = () => {
  const navigate      = useNavigate();
  const { playNotif } = useNotificationSound();

  // ── Stores ─────────────────────────────────────────────────────────────
  const { llegadaGPS, status, resetDelivery }      = useDeliveryStore();
  const { totalUSD, totalBs, paymentDigits,
          deliveryData, clearOrder }                = useOrderStore();
  const items    = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);   // asumiendo que tienes clearCart

  // ── Coordenadas y distancia ────────────────────────────────────────────
  const clienteLat = llegadaGPS?.lat ?? deliveryData?.lat ?? NEGOCIO.lat + 0.012;
  const clienteLng = llegadaGPS?.lng ?? deliveryData?.lng ?? NEGOCIO.lng + 0.015;

  const distanciaKm = deliveryData?.distanciaKm
    ?? haversineKm(NEGOCIO.lat, NEGOCIO.lng, clienteLat, clienteLng);

  const vehiculo       = deliveryData?.vehiculo ?? "Moto";
  const vehiculoIcon   = vehiculo === "Carro" ? "🚗" : "🏍️";
  const precioDelivery = deliveryData?.precioDelivery ?? 0;
  const ordenId        = paymentDigits ?? "0000";

  // ── Tiempos calculados ─────────────────────────────────────────────────
  const MS_TRANSITO = Math.round((distanciaKm / VELOCIDAD_KMH) * 3_600_000);
  const MS_CERCA    = Math.round(MS_TRANSITO * 0.85);

  const TIEMPOS_MS = [
    0,
    MS_EMPAQUETADO,
    MS_EMPAQUETADO + MS_CERCA,
    MS_EMPAQUETADO + MS_TRANSITO,
  ];

  // ── Estado UI ──────────────────────────────────────────────────────────
  const [pasoIdx,       setPasoIdx]       = useState(0);
  const [barraVisible,  setBarraVisible]  = useState(true);
  const [facturaOpen,   setFacturaOpen]   = useState(false);
  const [notif,         setNotif]         = useState(null);
  const [etaMin,        setEtaMin]        = useState(
    Math.round((MS_EMPAQUETADO + MS_TRANSITO) / 60_000)
  );

  // ── Estado pantalla de review ──────────────────────────────────────────
  const [showReview,    setShowReview]    = useState(false);
  const [confirmado,    setConfirmado]    = useState(false);
  const [rating,        setRating]        = useState(0);
  const [comentario,    setComentario]    = useState("");
  const [enviando,      setEnviando]      = useState(false);
  const [ratingError,   setRatingError]   = useState(false);

  const notifTimer = useRef(null);
  const startTime  = useRef(Date.now());

  // Posición animada del repartidor
  const [motoPos, setMotoPos] = useState([NEGOCIO.lat, NEGOCIO.lng]);
  const [ruta,    setRuta]    = useState([[NEGOCIO.lat, NEGOCIO.lng]]);
  const animRef = useRef(null);

  // ── Toast con sonido + vibración ───────────────────────────────────────
  const showNotif = useCallback((n, tipo) => {
    setNotif(n);
    playNotif(tipo);
    clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotif(null), 5000);
  }, [playNotif]);

  // ── Animación repartidor ───────────────────────────────────────────────
  const animarMoto = useCallback((fromLat, fromLng, toLat, toLng, durMs) => {
    const start = performance.now();
    cancelAnimationFrame(animRef.current);
    const tick = (now) => {
      const p     = Math.min((now - start) / durMs, 1);
      const eased = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
      const lat   = lerp(fromLat, toLat, eased);
      const lng   = lerp(fromLng, toLng, eased);
      setMotoPos([lat, lng]);
      setRuta((prev) => {
        const last = prev[prev.length - 1];
        if (Math.abs(last[0] - lat) < 0.00001) return prev;
        return [...prev, [lat, lng]];
      });
      if (p < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  // ── Ticker ETA cada 30s ────────────────────────────────────────────────
  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed    = Date.now() - startTime.current;
      const msRestante = Math.max((MS_EMPAQUETADO + MS_TRANSITO) - elapsed, 0);
      setEtaMin(Math.round(msRestante / 60_000));
    }, 30_000);
    return () => clearInterval(tick);
  }, [MS_TRANSITO]);

  // ── Avance de pasos ────────────────────────────────────────────────────
  useEffect(() => {
    startTime.current = Date.now();

    const timers = [
      setTimeout(() => setPasoIdx(0), TIEMPOS_MS[0]),

      setTimeout(() => {
        setPasoIdx(1);
        showNotif({
          title: "¡Tu pedido salió! 🏍️",
          body:  `El repartidor está en camino. Llegará en ~${Math.round(MS_TRANSITO / 60_000)} min.`,
        }, "salida");
        animarMoto(NEGOCIO.lat, NEGOCIO.lng, clienteLat, clienteLng, MS_TRANSITO);
      }, TIEMPOS_MS[1]),

      setTimeout(() => {
        setPasoIdx(2);
        showNotif({
          title: "¡Ya casi llega! 📍",
          body:  "Tu pedido está a menos de 2 minutos.",
        }, "cerca");
      }, TIEMPOS_MS[2]),

      setTimeout(() => {
        setPasoIdx(3);
        setEtaMin(0);
        showNotif({
          title: "¡Pedido entregado! 🎉",
          body:  "Confirma la recepción para finalizar.",
        }, "entregado");
        // Muestra la pantalla de review 1.5s después del toast
        setTimeout(() => setShowReview(true), 1500);
      }, TIEMPOS_MS[3]),
    ];

    return () => {
      timers.forEach(clearTimeout);
      cancelAnimationFrame(animRef.current);
      clearTimeout(notifTimer.current);
    };
  }, [clienteLat, clienteLng, MS_TRANSITO]);

  // ── Confirmar recepción + enviar review ───────────────────────────────
  const handleEnviarReview = useCallback(async () => {
    if (!confirmado) return;
    if (rating === 0) { setRatingError(true); return; }
    setRatingError(false);
    setEnviando(true);

    // 🔜 Aquí irá la llamada al backend con { ordenId, rating, comentario }
    await new Promise((r) => setTimeout(r, 1200));

    // Limpiar todos los stores y volver a home
    if (clearOrder)    clearOrder();
    if (resetDelivery) resetDelivery();
    if (clearCart)     clearCart();

    navigate("/home");
  }, [confirmado, rating, comentario, ordenId, clearOrder, resetDelivery, clearCart, navigate]);

  const mapCenter  = pasoIdx >= 1 ? motoPos : [NEGOCIO.lat, NEGOCIO.lng];
  const mapZoom    = pasoIdx >= 2 ? 15 : 14;
  const pasoActual = PASOS[pasoIdx];
  const entregado  = pasoIdx === 3;

  const handleLlamar   = () => { window.location.href = `tel:${TEL_REPARTO}`; };
  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hola! Soy el cliente con el pedido #${ordenId}. ¿Podría consultar el estado de mi entrega?`
    );
    window.open(`https://wa.me/${WA_TIENDA}?text=${msg}`, "_blank");
  };

  return (
    <div className="tracking-screen">

      {/* ══ TOAST ══ */}
      <AnimatePresence>
        {notif && (
          <motion.div className="tracking-toast"
            initial={{ y: -90, opacity: 0 }}
            animate={{ y: 0,   opacity: 1 }}
            exit={{    y: -90, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="tracking-toast-text">
              <strong>{notif.title}</strong>
              <span>{notif.body}</span>
            </div>
            <button className="tracking-toast-close" onClick={() => setNotif(null)}>
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ BARRA DE PASOS ══ */}
      <div className="tracking-progress-bar">
        <button className="tracking-progress-toggle"
          onClick={() => setBarraVisible((v) => !v)}>
          <div className="tracking-progress-toggle-left">
            <span className="tracking-order-id">Pedido #{ordenId}</span>
            <span className="tracking-status-pill" style={{
              background: entregado ? "#dcfce7" : "#dbeafe",
              color:      entregado ? "#15803d" : "#1d4ed8",
            }}>
              {pasoActual.emoji} {pasoActual.label}
            </span>
            {!entregado && etaMin > 0 && (
              <span className="tracking-eta-badge">~{etaMin} min</span>
            )}
          </div>
          {barraVisible
            ? <ChevronUp   size={16} className="tracking-chevron" />
            : <ChevronDown size={16} className="tracking-chevron" />
          }
        </button>

        <AnimatePresence initial={false}>
          {barraVisible && (
            <motion.div className="tracking-steps-wrap"
              initial={{ height: 0,      opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{    height: 0,      opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="tracking-steps">
                {PASOS.map((p, i) => {
                  const done   = i < pasoIdx;
                  const active = i === pasoIdx;
                  return (
                    <div key={p.key} className="tracking-step-item">
                      <motion.div
                        className={`tracking-node ${active?"active":done?"done":"pending"}`}
                        animate={active ? { scale:[1,1.15,1] } : {}}
                        transition={{ duration:0.6, repeat:Infinity, repeatDelay:1.8 }}
                      >
                        {done ? "✓" : p.emoji}
                      </motion.div>
                      {i < PASOS.length - 1 && (
                        <div className={`tracking-connector ${done||active?"filled":""}`} />
                      )}
                      <span className={`tracking-step-label ${active?"active":done?"done":""}`}>
                        {p.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ MAPA ══ */}
      <div className="tracking-map-area">
        <MapContainer
          center={[clienteLat, clienteLng]}
          zoom={14}
          className="tracking-map"
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapFlyTo center={mapCenter} zoom={mapZoom} />
          <Marker position={[clienteLat, clienteLng]} icon={clienteIcon} />
          <Marker position={motoPos}                  icon={motoIcon}    />
          {ruta.length > 1 && (
            <Polyline positions={ruta} pathOptions={{
              color:     "#2563eb",
              weight:    4,
              opacity:   0.55,
              dashArray: pasoIdx < 2 ? "8 6" : undefined,
            }} />
          )}
        </MapContainer>
      </div>

      {/* ══ BOTTOM SHEET normal (mientras no está entregado) ══ */}
      <AnimatePresence>
        {!showReview && (
          <motion.div
            className="bottom-sheet-del"
            initial={{ y: 0 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="drag-handle-del" />

            <div className="status-header-del">
              <div className="status-info-del">
                <h3>Estatus del Pedido</h3>
                <div className="status-tag-del">
                  <span className="dot-del" />
                  {status}
                </div>
              </div>
              <div className="order-id-del">
                <small>ID PEDIDO</small>
                <strong>#{ordenId}</strong>
              </div>
            </div>

            <div className="order-summary-del">
              <button className="summary-toggle-del"
                onClick={() => setFacturaOpen((v) => !v)}>
                <div className="summary-toggle-left-del">
                  <Package size={14} />
                  <span>Tu pedido ({items.length} producto{items.length !== 1 ? "s" : ""})</span>
                </div>
                {facturaOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>

              <AnimatePresence initial={false}>
                {facturaOpen && (
                  <motion.div className="summary-items-del"
                    initial={{ height:0, opacity:0 }}
                    animate={{ height:"auto", opacity:1 }}
                    exit={{    height:0, opacity:0 }}
                    transition={{ duration:0.22, ease:[0.32,0.72,0,1] }}
                  >
                    {items.map((item) => (
                      <div key={item.id} className="summary-row-del">
                        <span>{item.nombre} ×{item.qty}</span>
                        <strong>${item.precio.toFixed(2)}</strong>
                      </div>
                    ))}
                    {precioDelivery > 0 && (
                      <div className="summary-row-del">
                        <span>Delivery {vehiculoIcon} · {distanciaKm.toFixed(1)} km</span>
                        <strong>+${precioDelivery.toFixed(2)}</strong>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="summary-total-del">
                <span>Total Pagado</span>
                <div className="summary-total-amounts-del">
                  <strong>${totalUSD.toFixed(2)}</strong>
                  <small>{totalBs.toFixed(2)} Bs</small>
                </div>
              </div>
            </div>

            <div className="actions-del">
              <button className="btn-chat-del" onClick={handleWhatsApp}>💬 WHATSAPP</button>
              <button className="btn-call-del" onClick={handleLlamar}>📞 LLAMAR REPARTIDOR</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ BOTTOM SHEET DE REVIEW — sube cuando se entrega ══ */}
      <AnimatePresence>
        {showReview && (
          <>
            {/* Overlay oscuro detrás */}
            <motion.div
              className="review-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.3 }}
            />

            <motion.div
              className="review-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{    y: "100%" }}
              transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="drag-handle-del" />

              {/* Emoji de celebración */}
              <motion.div
                className="review-hero"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1,   opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              >
                <span className="review-hero-emoji">🎉</span>
                <h2 className="review-title">¡Tu pedido llegó!</h2>
                <p className="review-subtitle">Confirma que lo recibiste y cuéntanos tu experiencia</p>
              </motion.div>

              {/* Checkbox de confirmación */}
              <motion.div
                className={`review-confirm-row${confirmado ? " confirmed" : ""}`}
                onClick={() => setConfirmado((v) => !v)}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className={`review-checkbox${confirmado ? " checked" : ""}`}>
                  {confirmado && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >✓</motion.span>
                  )}
                </div>
                <span className="review-confirm-label">
                  Confirmo que recibí mi pedido #{ordenId}
                </span>
              </motion.div>

              {/* Calificación con estrellas */}
              <motion.div
                className="review-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
              >
                <label className="review-label">¿Cómo fue tu experiencia?</label>
                <StarRating value={rating} onChange={(v) => { setRating(v); setRatingError(false); }} />
                <AnimatePresence>
                  {ratingError && (
                    <motion.span className="review-error"
                      initial={{ opacity:0, height:0 }}
                      animate={{ opacity:1, height:"auto" }}
                      exit={{    opacity:0, height:0 }}
                    >
                      Selecciona una calificación para continuar
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Etiqueta según estrellas */}
                {rating > 0 && (
                  <motion.span
                    className="review-rating-label"
                    key={rating}
                    initial={{ opacity:0, y:4 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:0.2 }}
                  >
                    {["", "😕 Mala", "😐 Regular", "🙂 Buena", "😊 Muy buena", "🤩 ¡Excelente!"][rating]}
                  </motion.span>
                )}
              </motion.div>

              {/* Comentario */}
              <motion.div
                className="review-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.46 }}
              >
                <label className="review-label">Comentario <span className="review-optional">(opcional)</span></label>
                <textarea
                  className="review-textarea"
                  placeholder="¿Algo que quieras contarnos sobre tu pedido?"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  maxLength={300}
                  rows={3}
                />
                <span className="review-char-count">{comentario.length}/300</span>
              </motion.div>

              {/* Botón enviar */}
              <motion.button
                className={`review-btn${confirmado && rating > 0 ? " ready" : ""}${enviando ? " loading" : ""}`}
                onClick={handleEnviarReview}
                disabled={enviando}
                whileTap={enviando ? {} : { scale: 0.97 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.54 }}
              >
                {enviando
                  ? <><span className="spinner spinner--white" /> Enviando…</>
                  : <><Send size={17} /> Enviar y finalizar</>
                }
              </motion.button>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Tracking;