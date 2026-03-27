export const useHaptic = () => {
  /**
   * @param {string} type - 'light', 'medium', 'success', 'warning'
   */
  const vibrate = (type = "light") => {
    if (
      typeof window !== "undefined" &&
      "navigator" in window &&
      typeof navigator.vibrate === "function"
    ) {
      const patterns = {
        // Un toque sutil para botones normales
        light: 15,
        // Un toque más firme para cambios de estado
        medium: 30,
        // Feedback positivo (doble pulso rápido) para compras exitosas
        success: [15, 40, 15],
        // Feedback de error o alerta (pulso largo)
        warning: [60, 120, 60],
      };

      navigator.vibrate(patterns[type] || 15);
    }
  };

  return { vibrate };
};