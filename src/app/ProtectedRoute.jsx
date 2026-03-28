import React from 'react';
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthContext"; // Importamos tu hook real

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. Mientras Supabase está verificando la sesión, mostramos una carga
  // Esto evita que el usuario vea el Login un segundo antes de saltar al Home
  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#121212', // Color oscuro para que no desentone
        color: 'white'
      }}>
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // 2. Si no hay usuario logueado, lo mandamos al login de una vez
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si hay usuario, renderizamos el contenido (Home, Delivery, etc.)
  return children;
};

export default ProtectedRoute;