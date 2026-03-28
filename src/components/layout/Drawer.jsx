import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/useAuth'; // Importante: tu hook de Supabase
import '../../styles/drawer.css';

const Drawer = ({ isOpen, onClose }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isClosing, setIsClosing] = useState(false);

  // 1. Función para manejar el cierre visual (animación)
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 240); // Tiempo exacto de tu drawerSlideOut en CSS
  };

  // 2. Función MAESTRA para cerrar sesión
  const handleLogoutClick = async () => {
    console.log("Iniciando cierre de sesión...");
    try {
      await logout(); // Esto debe ejecutar supabase.auth.signOut()
      handleClose();  // Cerramos el menú
      navigate('/login'); // Pateamos al usuario fuera
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
      // Plan B: Forzar salida si Supabase falla
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div className={`menu-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`menu-drawer ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
        
        {/* ... (resto del contenido del Drawer que ya tienes) ... */}

        {/* SECCIÓN FINAL: Aquí conectamos el evento */}
        <div 
          className="menu-item logout-item" 
          onClick={handleLogoutClick} 
          style={{ cursor: 'pointer' }}
        >
          <img src="/src/assets/icons/basura.png" width="20" alt="" />
          <span>Cerrar Sesión</span>
        </div>
      </div>
    </div>
  );
};

export default Drawer;