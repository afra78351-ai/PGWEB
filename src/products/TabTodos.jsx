import React from "react";

// CSS modular
import "./tab-todos.css";
import "./tab-shared.css";
import "../components/UI/cards.css";

// ✅ Promos como constante externa — fácil de mantener
const PROMOS = [
  { id: 1, label: "Promo Mes ✨", descripcion: "3 Clásicos x $6.50" },
];

const TabTodos = () => {
  return (
    <div className="tab-empty-state fade-in-soft">
      <div className="home-card tab-todos-card fade-in-scale">

        <h2 className="tab-todos-title">
          ¡Bienvenido a La Tienda Foránea! {/* ✅ tilde corregida */}
        </h2>

        <p className="tab-todos-text">
          Selecciona una categoría arriba para empezar a configurar tus lienzos.
        </p>

        {/* ✅ Promos desde constante — no hardcodeadas */}
        <div className="tab-todos-promos">
          {PROMOS.map((promo) => (
            <div key={promo.id} className="tab-todos-promo-box">
              <p>{promo.label}</p>
              <span>{promo.descripcion}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default TabTodos;