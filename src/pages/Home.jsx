import React, { useState } from "react";

// === ESTILOS GLOBALES DE HOME ===
// layout.css    — .home-screen, .main-layout, .tab-column
// header.css    — .top-bar, .burger-btn, .header-title
// tabs.css      — .tabs-container, .tab-btn, .tab-content
// cards.css     — .card, .tab-card, .home-card (.preview-wrapper vive en tab-shared.css)
// actions.css   — .action-footer ÚNICA definición (unificada en refactor)
// menu.css      — .menu-overlay, .menu-drawer base
// drawer.css    — secciones, avatar, badge, footer del drawer
// animations.css — todos los @keyframes del proyecto
// cart.css      — CartButton FAB y modal
import "../styles/layout.css";
import "../components/layout/header.css";
import "../products/tabs.css";
import "../components/UI/cards.css";
import "../components/ActionFooter/actions.css";  // este SÍ existe en src/styles/ según el árbol ✔
import "../components/layout/menu.css";
import "../components/layout/drawer.css";
import "../styles/animations.css";
import "../cart/cart.css";

// Store y componentes
import { useCartStore } from "../cart/useCartStore.js";
import TabLienzos from "../products/TabLienzos.jsx";
import TabTodos from "../products/TabTodos.jsx";
import CartButton from "../cart/CartButton.jsx";
import iconMenu from "../assets/icons/lista.png";
import { useAudio } from "../hooks/useAudio";
import { useHaptic } from "../hooks/useHaptic";

// ✅ Íconos lucide — adiós emojis
import {
  User, Settings, Shield, Package, Clock,
  CreditCard, Receipt, Star, Gift,
  HelpCircle, MessageCircle, Bell, Globe,
  LogOut, ChevronRight
} from "lucide-react";

// ✅ Usuario hardcodeado por ahora — luego viene del backend
const MOCK_USER = {
  nombre: "Administrador",
  rol: "Admin",
  inicial: "A",
};

const Home = () => {
  const [activeTab, setActiveTab] = useState("Clásicos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const { tasaBCV } = useCartStore();

  const { playClick } = useAudio();
  const { vibrate } = useHaptic();

  const toggleMenu = () => {
    if (menuOpen) {
      setMenuClosing(true);
      setTimeout(() => {
        setMenuOpen(false);
        setMenuClosing(false);
      }, 240);
    } else {
      setMenuOpen(true);
      playClick && playClick();
      vibrate && vibrate("light");
    }
  };

  const tabs = ["Todos", "Clásicos", "Imantados"];

  const handleChangeTab = (tab) => {
    setActiveTab(tab);
    playClick && playClick();
    vibrate && vibrate("light");
  };

  const renderActiveTab = () => {
    if (activeTab === "Todos") return <TabTodos />;
    return <TabLienzos tipo={activeTab} />;
  };

  return (
    <div className="home-screen">

      {/* ============================
          MENÚ LATERAL
          ============================ */}
      {menuOpen && (
        <div
          className={"menu-overlay" + (menuClosing ? " closing" : "")}
          onClick={toggleMenu}
        >
          <div
            className={"menu-drawer" + (menuClosing ? " closing" : "")}
            onClick={(e) => e.stopPropagation()}
          >

            {/* ✅ Header con avatar y datos del usuario */}
            <div className="menu-drawer-header">
              <div className="drawer-avatar">
                {MOCK_USER.inicial}
              </div>
              <div className="drawer-user-info">
                <span className="drawer-user-name">{MOCK_USER.nombre}</span>
                <span className="drawer-user-role">{MOCK_USER.rol}</span>
              </div>
            </div>

            {/* Cuenta */}
            <div className="drawer-section">
              <span className="drawer-section-title">Cuenta</span>
              <div className="menu-item">
                <User size={18} className="menu-item-icon" />
                <span>Mi perfil</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
              <div className="menu-item">
                <Settings size={18} className="menu-item-icon" />
                <span>Editar datos</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
              <div className="menu-item">
                <Shield size={18} className="menu-item-icon" />
                <span>Seguridad</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
            </div>

            <div className="menu-divider" />

            {/* Pedidos */}
            <div className="drawer-section">
              <span className="drawer-section-title">Pedidos</span>
              <div className="menu-item">
                <Package size={18} className="menu-item-icon" />
                <span>Mis pedidos activos</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
              <div className="menu-item">
                <Clock size={18} className="menu-item-icon" />
                <span>Historial de pedidos</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
            </div>

            <div className="menu-divider" />

            {/* Pagos */}
            <div className="drawer-section">
              <span className="drawer-section-title">Pagos</span>
              <div className="menu-item">
                <CreditCard size={18} className="menu-item-icon" />
                <span>Membresía</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
              <div className="menu-item">
                <Receipt size={18} className="menu-item-icon" />
                <span>Historial de pagos</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
            </div>

            <div className="menu-divider" />

            {/* Beneficios */}
            <div className="drawer-section">
              <span className="drawer-section-title">Beneficios</span>
              <div className="menu-item">
                <Star size={18} className="menu-item-icon" />
                <span>Mis puntos</span>
                {/* ✅ Badge de puntos */}
                <span className="drawer-badge" style={{ marginLeft: "auto" }}>1.2k</span>
              </div>
              <div className="menu-item">
                <Gift size={18} className="menu-item-icon" />
                <span>Canjear puntos</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
            </div>

            <div className="menu-divider" />

            {/* Soporte */}
            <div className="drawer-section">
              <span className="drawer-section-title">Soporte</span>
              <div className="menu-item">
                <HelpCircle size={18} className="menu-item-icon" />
                <span>Preguntas frecuentes</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
              <div className="menu-item">
                <MessageCircle size={18} className="menu-item-icon" />
                <span>Contactar soporte</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
            </div>

            <div className="menu-divider" />

            {/* Preferencias */}
            <div className="drawer-section">
              <span className="drawer-section-title">Preferencias</span>
              <div className="menu-item">
                <Bell size={18} className="menu-item-icon" />
                <span>Notificaciones</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
              <div className="menu-item">
                <Globe size={18} className="menu-item-icon" />
                <span>Idioma</span>
                <ChevronRight size={15} className="menu-item-arrow" />
              </div>
            </div>

            <div className="menu-divider" />

            {/* ✅ Cerrar sesión al fondo */}
            <div className="menu-item logout-item">
              <LogOut size={18} className="menu-item-icon" />
              <span>Cerrar sesión</span>
            </div>

          </div>
        </div>
      )}

      {/* ============================
          BARRA SUPERIOR
          ============================ */}
      <div className="top-bar">
        <button className="burger-btn" onClick={toggleMenu}>
          <img src={iconMenu} className="burger-icon" alt="Abrir menú" />
        </button>

        <h2 className="header-title">La Tienda Foránea</h2>

        <div className="header-rate">
          <span>USD, tasa BCV:</span>
          <b>{tasaBCV} Bs</b>
        </div>
      </div>

      {/* ============================
          TABS — PILLS
          ============================ */}
      <div className="tabs-container">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleChangeTab(tab)}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ============================
          CONTENIDO ACTIVO
          ============================ */}
      <div className="tab-content fade-in-soft">
        {renderActiveTab()}
      </div>

      {/* ✅ Carrito flotante — fuera del top-bar */}
      <CartButton />

    </div>
  );
};

export default Home;