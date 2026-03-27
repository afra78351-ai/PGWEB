import "../orders/payment.css";
import { useMemo, useCallback, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore, selectTotalUSD } from "../cart/useCartStore";
import { useOrderStore } from "../orders/useOrderStore";
import { Copy, ArrowLeft, CheckCircle, Truck, X, ImageIcon, CopyCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PAYMENT_DATA = {
  banco:    "Banco de Venezuela",
  rif:      "J-12345678-9",
  telefono: "0412-5555555",
};

const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};
const slideTransition = { duration: 0.32, ease: [0.32, 0.72, 0, 1] };

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch (_) {}
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    ta.setSelectionRange(0, ta.value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch (_) { return false; }
};

export default function Payment() {
  const navigate = useNavigate();
  const items    = useCartStore((s) => s.items);
  const tasaBCV  = useCartStore((s) => s.tasaBCV);
  const subtotal = useCartStore(selectTotalUSD);

  // ✅ Usa tu store original
  const {
    deliveryData,
    totalUSD: storedTotalUSD,
    totalBs:  storedTotalBs,
    setTotals,
    setPaymentDigits,
  } = useOrderStore();

  const precioDelivery = deliveryData?.precioDelivery ?? 0;
  const vehiculo       = deliveryData?.vehiculo ?? null;
  const vehiculoIcon   = vehiculo === "Carro" ? "🚗" : vehiculo === "Moto" ? "🏍️" : null;

  // Usa los totales del store si ya fueron calculados en Delivery,
  // si no (acceso directo a /payment) los calcula aquí
  const totalUSD = storedTotalUSD > 0
    ? storedTotalUSD
    : parseFloat((subtotal + precioDelivery).toFixed(2));

  const totalBS = storedTotalBs > 0
    ? storedTotalBs
    : parseFloat((totalUSD * tasaBCV).toFixed(2));

  const [step, setStep] = useState(0);
  const [dir,  setDir]  = useState(1);
  const goTo = useCallback((next) => { setDir(next > step ? 1 : -1); setStep(next); }, [step]);

  const [copied,    setCopied]    = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const copy = useCallback(async (text, key) => {
    const ok = await copyToClipboard(String(text));
    if (ok) { setCopied(key); setTimeout(() => setCopied(null), 2000); }
  }, []);

  const handleCopyAll = useCallback(async () => {
    const msg =
      `Banco: ${PAYMENT_DATA.banco}\n` +
      `RIF: ${PAYMENT_DATA.rif}\n` +
      `Teléfono: ${PAYMENT_DATA.telefono}\n` +
      `Monto: ${totalBS.toFixed(2)} Bs`;
    const ok = await copyToClipboard(msg);
    if (ok) { setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2500); }
  }, [totalBS]);

  const [digitos,      setDigitos]      = useState("");
  const [imagen,       setImagen]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [digitosError, setDigitosError] = useState("");
  const [imagenError,  setImagenError]  = useState("");
  const fileRef = useRef(null);

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImagenError("Solo se aceptan imágenes (JPG, PNG, etc.)"); return; }
    setImagenError("");
    const reader = new FileReader();
    reader.onload = (ev) => setImagen(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const removeImagen = useCallback(() => {
    setImagen(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleConfirmar = useCallback(async () => {
    let ok = true;
    if (!imagen) { setImagenError("Adjunta la captura del pago"); ok = false; }
    if (digitos.replace(/\D/g, "").length < 4) { setDigitosError("Ingresa los últimos 4 dígitos"); ok = false; }
    if (!ok) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setPaymentDigits(digitos); // ✅ código de orden = últimos 4 dígitos
    navigate("/confirmed");
  }, [imagen, digitos, navigate, setPaymentDigits]);

  if (items.length === 0) {
    return (
      <div className="payment-container">
        <div className="payment-empty">
          <span className="payment-empty-icon">🛒</span>
          <h2 className="payment-empty-title">Tu carrito está vacío</h2>
          <p className="payment-empty-text">Agrega productos antes de proceder al pago.</p>
          <button className="payment-empty-btn" onClick={() => navigate("/home")}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  const stepMeta = [
    { title: "Tu pedido",   sub: "Revisa antes de pagar"        },
    { title: "Pago móvil",  sub: "Copia los datos y transfiere" },
    { title: "Comprobante", sub: "Sube la captura del pago"     },
  ];

  return (
    <div className="payment-screen">

      <div className="payment-header">
        <button className="payment-back-btn"
          onClick={() => step === 0 ? navigate(-1) : goTo(step - 1)} aria-label="Atrás">
          <ArrowLeft size={20} color="#2563eb" />
        </button>
        <div className="payment-header-text">
          <h1 className="payment-header-title">{stepMeta[step].title}</h1>
          <p className="payment-header-sub">{stepMeta[step].sub}</p>
        </div>
        <div className="payment-steps">
          {[0,1,2].map((i) => (
            <div key={i} className={`payment-step-dot ${i===step?"active":i<step?"done":""}`} />
          ))}
        </div>
      </div>

      <div className="payment-slide-area">
        <AnimatePresence custom={dir} mode="wait" initial={false}>

          {/* ══ PASO 0 — FACTURA ══ */}
          {step === 0 && (
            <motion.div key="s0" className="payment-step-content"
              custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={slideTransition}>
              <div className="payment-card">
                <div className="payment-section">
                  <h2 className="payment-section-title">Productos</h2>
                  <div className="invoice-list">
                    {items.map((item, i) => (
                      <motion.div key={item.id} className="invoice-item"
                        initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay: i*0.05, duration:0.22 }}>
                        <div className="invoice-left">
                          <span className="invoice-name">{item.nombre}</span>
                          <span className="invoice-qty">×{item.qty}</span>
                        </div>
                        <strong className="invoice-price">${item.precio.toFixed(2)}</strong>
                      </motion.div>
                    ))}
                    {precioDelivery > 0 && (
                      <motion.div className="invoice-item invoice-delivery"
                        initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                        transition={{ delay: items.length*0.05, duration:0.22 }}>
                        <div className="invoice-left">
                          <Truck size={13} className="invoice-delivery-icon" />
                          <span className="invoice-name">Delivery {vehiculoIcon} {vehiculo}</span>
                        </div>
                        <strong className="invoice-price invoice-delivery-price">+${precioDelivery.toFixed(2)}</strong>
                      </motion.div>
                    )}
                  </div>
                  <motion.div className="invoice-total"
                    initial={{ opacity:0 }} animate={{ opacity:1 }}
                    transition={{ delay: (items.length+1)*0.05+0.08 }}>
                    <span>Total a pagar</span>
                    <div className="invoice-total-right">
                      <strong className="invoice-total-usd">${totalUSD.toFixed(2)}</strong>
                      <span className="invoice-total-bs">{totalBS.toFixed(2)} Bs</span>
                    </div>
                  </motion.div>
                </div>
                {deliveryData?.direccion && (
                  <div className="payment-delivery-info">
                    <span className="payment-delivery-label">📦 Envío a</span>
                    <span className="payment-delivery-addr">{deliveryData.direccion}</span>
                  </div>
                )}
              </div>
              <div className="payment-footer">
                <motion.button className="pay-button pay-button--blue" onClick={() => goTo(1)} whileTap={{ scale:0.97 }}>
                  Continuar al pago →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ══ PASO 1 — DATOS PAGO ══ */}
          {step === 1 && (
            <motion.div key="s1" className="payment-step-content"
              custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={slideTransition}>
              <div className="payment-card">
                <div className="payment-amount-hero">
                  <span className="payment-amount-label">Monto a transferir</span>
                  <motion.span className="payment-amount-usd"
                    initial={{ scale:0.85, opacity:0 }} animate={{ scale:1, opacity:1 }}
                    transition={{ delay:0.1, duration:0.3, ease:[0.32,0.72,0,1] }}>
                    ${totalUSD.toFixed(2)}
                  </motion.span>
                  <span className="payment-amount-bs">{totalBS.toFixed(2)} Bs</span>
                </div>
                <div className="payment-divider" />
                <div className="payment-section">
                  <h2 className="payment-section-title">Datos bancarios</h2>
                  <div className="payment-row">
                    <span>Banco</span>
                    <strong>{PAYMENT_DATA.banco}</strong>
                  </div>
                  {[
                    { label:"RIF",        value:PAYMENT_DATA.rif,           key:"rif" },
                    { label:"Teléfono",   value:PAYMENT_DATA.telefono,      key:"tel" },
                    { label:"Monto (Bs)", value:`${totalBS.toFixed(2)} Bs`, key:"bs", raw:totalBS.toFixed(2) },
                  ].map(({ label, value, key, raw }, i) => (
                    <motion.div key={key}
                      className={`payment-row copyable${copied===key?" payment-row--copied":""}`}
                      onClick={() => copy(raw??value, key)}
                      role="button" aria-label={`Copiar ${label}`}
                      whileTap={{ scale:0.96 }}
                      initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                      transition={{ delay:0.1+i*0.06 }}>
                      <span className="payment-row-label">{label}</span>
                      <div className="payment-row-right">
                        <strong>{value}</strong>
                        <AnimatePresence mode="wait">
                          {copied===key ? (
                            <motion.span key="chk" className="payment-copied-badge"
                              initial={{ scale:0.5, opacity:0 }} animate={{ scale:1, opacity:1 }}
                              exit={{ scale:0.5, opacity:0 }} transition={{ duration:0.18 }}>
                              <CheckCircle size={16} color="#16a34a" /><span>Copiado</span>
                            </motion.span>
                          ) : (
                            <motion.span key="cpy" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                              <Copy size={15} className="copy-icon" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <motion.button
                  className={`payment-copy-all${copiedAll?" payment-copy-all--done":""}`}
                  onClick={handleCopyAll} whileTap={{ scale:0.97 }}
                  initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}>
                  <AnimatePresence mode="wait">
                    {copiedAll ? (
                      <motion.span key="done" className="payment-copy-all-inner"
                        initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
                        exit={{ opacity:0 }} transition={{ duration:0.2 }}>
                        <CopyCheck size={16} />¡Datos copiados al portapapeles!
                      </motion.span>
                    ) : (
                      <motion.span key="idle" className="payment-copy-all-inner"
                        initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                        <Copy size={16} />Copiar todos los datos
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                <div className="payment-help-chip">
                  <span>💡</span>
                  Toca cada dato para copiarlo, o usa "Copiar todos" para pegarlos de una vez
                </div>
              </div>
              <div className="payment-footer">
                <motion.button className="pay-button pay-button--green" onClick={() => goTo(2)} whileTap={{ scale:0.97 }}>
                  Ya pagué — subir comprobante →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ══ PASO 2 — COMPROBANTE ══ */}
          {step === 2 && (
            <motion.div key="s2" className="payment-step-content"
              custom={dir} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={slideTransition}>
              <div className="payment-card">
                <div className="payment-section">
                  <h2 className="payment-section-title">Captura del pago</h2>
                  <input ref={fileRef} type="file" accept="image/*"
                    className="payment-file-input" onChange={handleFile} id="comprobante-input" />
                  {imagen ? (
                    <div className="payment-preview-wrap">
                      <img src={imagen} className="payment-preview-img" alt="Comprobante" />
                      <button className="payment-preview-remove" onClick={removeImagen}><X size={14} /></button>
                    </div>
                  ) : (
                    <label htmlFor="comprobante-input" className="payment-upload-zone">
                      <div className="payment-upload-icon"><ImageIcon size={28} strokeWidth={1.5} /></div>
                      <span className="payment-upload-text">Toca para adjuntar captura</span>
                      <span className="payment-upload-hint">JPG, PNG · máx. 10 MB</span>
                    </label>
                  )}
                  <AnimatePresence>
                    {imagenError && (
                      <motion.span className="payment-field-error"
                        initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                        exit={{ opacity:0, height:0 }}>{imagenError}</motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="payment-section">
                  <h2 className="payment-section-title">Últimos 4 dígitos del pago</h2>
                  <input
                    className={`payment-digits-input${digitosError?" input-error":""}`}
                    type="text" inputMode="numeric" maxLength={4}
                    placeholder="0000" value={digitos}
                    onChange={(e) => {
                      setDigitos(e.target.value.replace(/\D/g,"").slice(0,4));
                      if (digitosError) setDigitosError("");
                    }} />
                  <AnimatePresence>
                    {digitosError && (
                      <motion.span className="payment-field-error"
                        initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
                        exit={{ opacity:0, height:0 }}>{digitosError}</motion.span>
                    )}
                  </AnimatePresence>
                  <span className="payment-reference-hint">
                    Los 4 últimos dígitos del número de referencia de tu pago móvil
                  </span>
                </div>
              </div>
              <div className="payment-footer">
                <motion.button
                  className={`pay-button pay-button--green${loading?" pay-button--loading":""}`}
                  onClick={handleConfirmar} disabled={loading}
                  whileTap={loading?{}:{ scale:0.97 }}>
                  {loading
                    ? <><span className="spinner spinner--white" /> Confirmando…</>
                    : "Confirmar pago ✓"
                  }
                </motion.button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}