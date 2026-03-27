import { useState, useCallback, useRef, useEffect } from "react";
import { ShoppingCart, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore, selectTotalUSD } from "./useCartStore";
import "./cart.css";

const CartButton = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [posY, setPosY] = useState(200); // ✅ posición vertical inicial

  const navigate = useNavigate();
  const fabRef = useRef(null);

  // ✅ Refs para el drag
  const dragStartY = useRef(0);
  const dragStartPosY = useRef(0);
  const isDragging = useRef(false);
  const dragMoved = useRef(false); // ✅ distingue drag de tap

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore(selectTotalUSD);
  const totalItems = items.reduce((acc, item) => acc + item.qty, 0);

  // ============================
  // DRAG — Touch (móvil)
  // ============================
  const handleTouchStart = useCallback((e) => {
    isDragging.current = true;
    dragMoved.current = false;
    dragStartY.current = e.touches[0].clientY;
    dragStartPosY.current = posY;
    setDragging(true);
  }, [posY]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging.current) return;
    const deltaY = e.touches[0].clientY - dragStartY.current;
    if (Math.abs(deltaY) > 5) dragMoved.current = true; // ✅ movió más de 5px = drag real

    const newY = dragStartPosY.current + deltaY;
    const maxY = window.innerHeight - 60;
    setPosY(Math.max(10, Math.min(newY, maxY)));
  }, []);

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    setDragging(false);

    // ✅ Si no se movió = fue un tap → abre modal
    if (!dragMoved.current) {
      setModalOpen(true);
    }
  }, []);

  // ============================
  // DRAG — Mouse (desktop)
  // ============================
  const handleMouseDown = useCallback((e) => {
    isDragging.current = true;
    dragMoved.current = false;
    dragStartY.current = e.clientY;
    dragStartPosY.current = posY;
    setDragging(true);
  }, [posY]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const deltaY = e.clientY - dragStartY.current;
      if (Math.abs(deltaY) > 5) dragMoved.current = true;

      const newY = dragStartPosY.current + deltaY;
      const maxY = window.innerHeight - 60;
      setPosY(Math.max(10, Math.min(newY, maxY)));
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setDragging(false);

      if (!dragMoved.current) {
        setModalOpen(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // ============================
  // MODAL
  // ============================
  const handleClose = useCallback(() => {
    setModalClosing(true);
    setTimeout(() => {
      setModalOpen(false);
      setModalClosing(false);
    }, 220);
  }, []);

  const handlePagar = useCallback(() => {
    handleClose();
    setTimeout(() => navigate("/delivery"), 220);
  }, [handleClose, navigate]);

  return (
    <>
      {/* ============================
          BOTÓN FLOTANTE ARRASTRABLE
          ============================ */}
      <button
        ref={fabRef}
        className={`cart-fab ${dragging ? "dragging" : ""}`}
        style={{ top: posY }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        aria-label="Ver carrito"
      >
        <ShoppingCart size={22} color="white" />
        {totalItems > 0 && (
          <span className="cart-fab-badge">{totalItems}</span>
        )}
      </button>

      {/* ============================
          MODAL
          ============================ */}
      {modalOpen && (
        <div
          className={`cart-overlay ${modalClosing ? "closing" : ""}`}
          onClick={handleClose}
        >
          <div
            className={`cart-modal ${modalClosing ? "closing" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Header */}
            <div className="cart-modal-header">
              <h2 className="cart-modal-title">
                Mi Carrito {totalItems > 0 && `(${totalItems})`}
              </h2>
              <button
                className="cart-modal-close"
                onClick={handleClose}
                aria-label="Cerrar carrito"
              >
                <X size={18} color="#6b7280" />
              </button>
            </div>

            {/* Body */}
            <div className="cart-modal-body">
              {items.length === 0 ? (
                <div className="cart-modal-empty">
                  <span className="cart-modal-empty-icon">🛒</span>
                  <p className="cart-modal-empty-text">
                    Tu carrito está vacío. Agrega productos para continuar.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="cart-modal-item">
                    <div className="cart-modal-item-left">
                      <span className="cart-modal-item-name">
                        {item.nombre}
                      </span>
                      <span className="cart-modal-item-qty">
                        x{item.qty}
                      </span>
                    </div>
                    <span className="cart-modal-item-price">
                      ${(item.precio * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="cart-modal-footer">
                <div className="cart-modal-total">
                  <span>Total</span>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>
                <button
                  className="cart-modal-pay-btn"
                  onClick={handlePagar}
                >
                  Proceder al pago →
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};

export default CartButton;