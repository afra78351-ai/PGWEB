import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { useCartStore } from "../../store/useCartStore";

const Toast = () => {
  const { showToast, toastMessage, hideToast } = useCartStore();

  // Auto-cerrado después de 3 segundos
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => hideToast(), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast, hideToast]);

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.9 }}
          animate={{ y: 50, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30 
          }}
          style={styles.toastContainer}
        >
          <div style={styles.blurBackground} />
          <div style={styles.content}>
            <div style={styles.iconWrapper}>🛒</div>
            <p style={styles.text}>{toastMessage}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const styles = {
  toastContainer: {
    position: "fixed",
    top: 0,
    left: "50%",
    x: "-50%", // Framer motion maneja el centrado con 'x'
    zIndex: 99999,
    width: "fit-content",
    minWidth: "280px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
    border: "1px solid rgba(255,255,255,0.3)",
    pointerEvents: "none", // Para que no estorbe si el usuario quiere clickear atrás
  },
  blurBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.75)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    zIndex: -1,
  },
  content: {
    padding: "14px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  iconWrapper: {
    fontSize: "20px",
  },
  text: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "600",
    color: "#000",
    letterSpacing: "-0.3px",
  },
};

export default Toast;