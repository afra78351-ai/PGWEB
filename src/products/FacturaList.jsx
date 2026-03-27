import React, { useState, useEffect } from "react";
import { useCartStore } from "../store/useCartStore";
import iconTrash from "../assets/icons/basura.png";

// CSS modular
import "../styles/facturalist.css";

const FacturaList = () => {
  const { items, tasaBCV, removeItem } = useCartStore();

  const [removing, setRemoving] = useState({});
  const [mounted, setMounted] = useState({});

  useEffect(() => {
    const newMounted = {};
    items.forEach((item) => {
      newMounted[item.id] = true;
    });
    setMounted(newMounted);
  }, [items]);

  // AGRUPACIÓN CORREGIDA → ahora usa item.id
  const groupedItemsMap = items.reduce((acc, item) => {
    const key = item.id; // ← CORREGIDO
    if (!acc[key]) {
      acc[key] = { ...item };
    } else {
      acc[key].qty += item.qty;
    }
    return acc;
  }, {});

  const groupedItems = Object.values(groupedItemsMap);

  const totalUSD = groupedItems.reduce(
    (acc, item) => acc + item.precio * item.qty,
    0
  );

  const totalBs = totalUSD * tasaBCV;

  const handleRemove = (id) => {
    setRemoving((prev) => ({ ...prev, [id]: true }));

    if (navigator.vibrate) navigator.vibrate(40);

    setTimeout(() => {
      removeItem(id);
      setRemoving((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }, 250);
  };

  return (
    <div className="factura-container">
      <h4 className="factura-title">Pedido actual</h4>

      <div className="factura-list">
        {groupedItems.length === 0 && (
          <p className="factura-empty">No hay productos en el pedido.</p>
        )}

        {groupedItems.map((item) => {
          const isRemoving = removing[item.id];
          const isMounted = mounted[item.id];

          const itemClass = isRemoving
            ? "factura-item removing"
            : isMounted
            ? "factura-item mounting"
            : "factura-item unmounted";

          return (
            // KEY CORREGIDO → ahora usa item.id
            <div key={item.id} className={itemClass}>
              <div className="factura-row">
                <div className="factura-info">
                  <div className="factura-line">
                    <span className="factura-name">{item.nombre}</span>
                    <span className="factura-qty">x{item.qty}</span>
                  </div>

                  <div className="factura-line">
                    <span className="factura-sub">Subtotal:</span>
                    <span className="factura-sub-value">
                      ${(item.precio * item.qty).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  className="factura-delete-btn"
                  onClick={() => handleRemove(item.id)}
                >
                  <img
                    src={iconTrash}
                    alt="Eliminar"
                    className="factura-delete-icon"
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {groupedItems.length > 0 && (
        <div className="factura-totals">
          <p className="factura-total-usd">
            Total USD: <strong>${totalUSD.toFixed(2)}</strong>
          </p>
          <p className="factura-total-bs">
            Total Bs:{" "}
            <strong>
              {totalBs.toLocaleString("es-VE", {
                minimumFractionDigits: 2,
              })}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default FacturaList;
