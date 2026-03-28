import React from "react";
import "../../styles/header.css";

const Header = ({ onOpenMenu, tasa }) => {
  return (
    <header className="top-bar" style={styles.header}>
      <button
        className="burger-btn"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
      >
        <img
          src="/src/assets/icons/lista.png"
          alt="Menu"
          className="burger-icon"
        />
      </button>

      <h1 className="header-title" style={styles.title}>
        La Tienda Foránea
      </h1>

      <div className="header-rate" style={styles.rate}>
        <span>Tasa BCV</span>
        <b>{tasa ? `${tasa.toFixed(2)} Bs` : "USD • ---"}</b>
      </div>
    </header>
  );
};

const styles = {
  header: { marginBottom: "16px" },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    margin: 0,
    color: "#111",
  },
  rate: {
    fontSize: "14px",
    color: "#666",
  },
};

export default Header;