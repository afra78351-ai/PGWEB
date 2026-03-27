import React, { useState, useMemo, useCallback } from "react";
import { useCartStore } from "../cart/useCartStore";
import CanvasPreview from "./CanvasPreview";
import { useHaptic } from "../hooks/useHaptic";
import { useAudio } from "../hooks/useAudio";
import iconCarrito from "../assets/icons/carrito-de-compras.png";
import { MEDIDAS } from "../constants/medidas";
import "../styles/layout.css";
import "./tab-lienzos.css";

const MULTIPLIERS = {
  Imantados: 2,
  Clasicos: 1,
};

const TabLienzos = ({ tipo }) => {
  const { addItem } = useCartStore();
  const [medidaSel, setMedidaSel] = useState(MEDIDAS[0]);

  // Fix: cantidad como string para permitir borrar y reescribir
  const [cantidad, setCantidad] = useState("1");

  const { vibrate } = useHaptic();
  const { playClick } = useAudio();

  const precioUnitarioUSD = useMemo(() => {
    if (!medidaSel) return 0;
    const base = medidaSel.basePrice || 0;
    return base * (MULTIPLIERS[tipo] || 1);
  }, [medidaSel, tipo]);

  // Fix: permite campo vacio mientras escribe, valida al salir
  const handleCantidadChange = useCallback((e) => {
    const val = e.target.value;
    if (val === "" || (/^\d+$/.test(val) && Number(val) >= 0)) {
      setCantidad(val);
    }
  }, []);

  const handleCantidadBlur = useCallback(() => {
    const num = Number(cantidad);
    if (!cantidad || num < 1) setCantidad("1");
  }, [cantidad]);

  const handleMedidaChange = useCallback((e) => {
    const found = MEDIDAS.find((m) => m.label === e.target.value);
    if (found) setMedidaSel(found);
  }, []);

  // Fix: id determinista para agrupar en el store por tipo+medida
  const handleAddToCart = useCallback(() => {
    const qty = Number(cantidad);
    if (!medidaSel || qty < 1) return;
    addItem({
      id: tipo + "-" + medidaSel.label,
      nombre: tipo + " " + medidaSel.label,
      precio: precioUnitarioUSD,
      qty,
    });
    vibrate && vibrate("light");
    playClick && playClick();
  }, [medidaSel, cantidad, precioUnitarioUSD, tipo, addItem, vibrate, playClick]);

  return (
    <div className="main-layout">
      <div className="tab-column">

        {/*
          Fix touch movil: el card tiene fade-in-scale que usa transform.
          transform crea un stacking context que atrapa los fixed children
          y bloquea touch events en iOS/Android.
          Solucion: card SIN animacion, el wrapper exterior la recibe.
          Asi el footer queda fuera del stacking context del transform.
        */}
        <div className="tab-lienzos-wrapper fade-in-scale">
          <div className="product-grid-card">

            {/* COLUMNA IZQUIERDA: CONFIG */}
            <div className="tab-config-group">
              <div className="input-item">
                <h4 className="tab-lienzos-section-title">Medida</h4>
                <select
                  className="custom-select"
                  value={medidaSel.label}
                  onChange={handleMedidaChange}
                >
                  {MEDIDAS.map((m) => (
                    <option key={m.label} value={m.label}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div className="input-item">
                <h4 className="tab-lienzos-section-title">Cantidad</h4>
                <input
                  type="number"
                  inputMode="numeric"
                  className="custom-input"
                  value={cantidad}
                  min={1}
                  onChange={handleCantidadChange}
                  onBlur={handleCantidadBlur}
                />
              </div>

              <div className="price-display-box">
                <span className="price-label">Precio Unitario</span>
                <span className="price-value">${precioUnitarioUSD.toFixed(2)}</span>
              </div>
            </div>

            {/* COLUMNA DERECHA: PREVIEW */}
            <div className="tab-preview-group">
              <CanvasPreview medida={medidaSel.label} precio={0} />
            </div>

          </div>

          {/*
            Footer FUERA del product-grid-card:
            - No lo deforma el grid
            - No queda atrapado en el stacking context del transform
            - Touch events llegan limpios al boton en iOS/Android
          */}
          <div className="action-footer">
            <button className="btn-cart-full" onClick={handleAddToCart}>
              <img src={iconCarrito} alt="Carrito" className="btn-cart-icon" />
              <span>Agregar al carrito</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default TabLienzos;