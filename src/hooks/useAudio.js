// src/hooks/useAudio.js

/**
 * Hook para manejar efectos de sonido sutiles tipo iOS.
 * No usamos "import" para el audio para evitar errores de análisis de Vite.
 * El archivo debe estar en /public/sounds/click.mp3
 */
export const useAudio = () => {
  const playClick = () => {
    try {
      // Al estar en la carpeta public, la ruta se accede directamente desde "/"
      const audio = new Audio("/sounds/click.mp3");
      
      // Ajustamos el volumen para que sea una micro-interacción elegante (0.0 a 1.0)
      audio.volume = 0.15;

      // Intentamos reproducir
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          // El navegador puede bloquear el audio si el usuario no ha hecho click aún.
          // Esto es normal y evita que la consola se llene de errores rojos.
          console.log("Audio: Esperando interacción inicial para habilitar sonidos.");
        });
      }
    } catch (err) {
      console.error("Error al reproducir el efecto de sonido:", err);
    }
  };

  return { playClick };
};