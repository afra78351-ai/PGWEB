import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../store/useCartStore";

const IOSModal = () => {
  const { isModalOpen, closeModal, modalContent } = useCartStore();

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Fondo oscuro (Overlay) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            style={styles.overlay}
          />

          {/* Panel del Modal */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y" // Permitimos arrastrar hacia abajo
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) closeModal();
            }}
            style={styles.modalSheet}
          >
            {/* Barrita indicadora de iOS */}
            <div style={styles.handle} />

            <div style={styles.content}>
              {modalContent || <p>Cargando...</p>}
            </div>

            <button onClick={closeModal} style={styles.closeBtn}>
              Cerrar
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(4px)",
    zIndex: 100000,
  },
  modalSheet: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTopLeftRadius: "28px",
    borderTopRightRadius: "28px",
    padding: "20px",
    paddingTop: "12px",
    zIndex: 100001,
    boxShadow: "0 -10px 40px rgba(0,0,0,0.1)",
    maxHeight: "85vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  handle: {
    width: "40px",
    height: "5px",
    backgroundColor: "#ccc",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  content: {
    width: "100%",
    color: "#000",
  },
  closeBtn: {
    marginTop: "20px",
    width: "100%",
    padding: "15px",
    borderRadius: "14px",
    border: "none",
    backgroundColor: "#f2f2f7",
    color: "#007aff",
    fontSize: "17px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default IOSModal;