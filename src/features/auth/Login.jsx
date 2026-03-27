import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Palette } from 'lucide-react';
import "./login.css";

const Login = () => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, scale: 1 });
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (user.toLowerCase() === 'admin' && pass === '1234') {
      localStorage.setItem('userAuth', 'true');
      navigate('/home');
    } else {
      await controls.start({
        x: [-10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      });
      alert("Credenciales incorrectas. Intenta con admin / 1234");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="bg-gradient"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={controls}
        transition={{ duration: 0.5 }}
        className="glass-login-card"
      >
        <div className="header">
          <div className="icon-circle">
            <Palette size={32} color="#2563eb" />
          </div>
          <h1 className="login-title">La Tienda Foránea</h1>
          <p className="login-subtitle">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-field">
            <User size={20} className="icon" />
            <input
              type="text"
              placeholder="Usuario"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="input-native"
              required
            />
          </div>

          <div className="input-field">
            <Lock size={20} className="icon" />
            <input
              type="password"
              placeholder="Contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="input-native"
              required
            />
          </div>

          <div className="forgot-pass">
            <span onClick={() => alert("Enlace de recuperación enviado")}>
              ¿Olvidaste tu contraseña?
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="login-button"
          >
            Entrar <ArrowRight size={20} />
          </motion.button>

          <div className="separator">
            <span>o continuar con</span>
          </div>

          <div className="social-login">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => alert("Próximamente: Apple ID")}
              className="social-btn apple"
            >
              <svg viewBox="0 0 384 512" width="20">
                <path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-39-19.9-54.7-47.9-54.7-92zM299.3 88c30.4-36.8 28.5-77.2 28.5-77.2s-39.7 1.4-70.6 37.6C227.9 83.2 233 121.2 233 121.2s36.1 3.2 66.3-33.2z"/>
              </svg>
              Apple
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => alert("Próximamente: Google Account")}
              className="social-btn google"
            >
              <svg viewBox="0 0 488 512" width="20">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
              </svg>
              Google
            </motion.button>
          </div>
        </form>

        <div className="footer-links">
          <p>¿No tienes cuenta? <span className="register-link" onClick={() => alert("Redirigiendo a Registro...")}>Regístrate</span></p>
        </div>

      </motion.div>
    </div>
  );
};

export default Login;