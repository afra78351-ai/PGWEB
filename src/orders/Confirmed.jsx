import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./confirmed.css";

// ─── Partículas de confetti ───────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,          // % horizontal
  delay: Math.random() * 0.4,
  duration: 0.9 + Math.random() * 0.5,
  color: ["#3b82f6","#60a5fa","#34d399","#fbbf24","#f472b6"][i % 5],
  size: 5 + Math.round(Math.random() * 5),
  rotate: Math.random() * 360,
}));

export default function Confirmed() {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => navigate("/tracking"), 2600);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <div className="confirmed-screen">

      {/* Confetti */}
      <div className="confirmed-confetti" aria-hidden="true">
        {PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            className="confirmed-particle"
            style={{
              left:            `${p.x}%`,
              width:           p.size,
              height:          p.size,
              background:      p.color,
              borderRadius:    p.id % 3 === 0 ? "50%" : "2px",
            }}
            initial={{ y: -20, opacity: 1, rotate: p.rotate }}
            animate={{ y: "110vh", opacity: [1, 1, 0], rotate: p.rotate + 360 }}
            transition={{
              delay:    p.delay,
              duration: p.duration + 1,
              ease:     "easeIn",
            }}
          />
        ))}
      </div>

      {/* Contenido central */}
      <div className="confirmed-content">

        {/* Check animado */}
        <motion.div
          className="confirmed-circle"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        >
          <motion.svg
            className="confirmed-svg"
            viewBox="0 0 52 52"
            fill="none"
          >
            {/* Círculo */}
            <motion.circle
              cx="26" cy="26" r="24"
              stroke="#16a34a"
              strokeWidth="2.5"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Check */}
            <motion.path
              d="M14 26 L22 34 L38 18"
              stroke="#16a34a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4, ease: "easeOut" }}
            />
          </motion.svg>
        </motion.div>

        {/* Textos */}
        <motion.h1
          className="confirmed-title"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.3 }}
        >
          ¡Pedido confirmado!
        </motion.h1>

        <motion.p
          className="confirmed-sub"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        >
          Tu repartidor está siendo notificado
        </motion.p>

        {/* Barra de progreso automática */}
        <motion.div
          className="confirmed-progress-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          <motion.div
            className="confirmed-progress-bar"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.9, duration: 2.0, ease: "linear" }}
          />
        </motion.div>

        <motion.p
          className="confirmed-redirect-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          Abriendo seguimiento…
        </motion.p>

      </div>
    </div>
  );
}