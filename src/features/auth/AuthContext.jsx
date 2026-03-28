import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Importante para el salto
import { supabase } from '../../api/supabase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // <--- El "motor" para moverte de página

  useEffect(() => {
    // 1. Chequear sesión actual al cargar
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        // Si el usuario ya está logueado y está en el login, lo mandamos al home
        if (window.location.pathname === '/login') navigate('/');
      }
      setLoading(false);
    };

    checkUser();

    // 2. Escuchar cambios (Aquí es donde ocurre la magia del salto)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // SI SE LOGUEA EXITOSAMENTE -> SALTO AL HOME
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        navigate('/'); 
      }
      
      // SI CIERRA SESIÓN -> AL LOGIN
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook useAuth integrado para no tener mil archivos
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};