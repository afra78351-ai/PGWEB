import { create } from 'zustand';

// Selector idiomático fuera del store ✅
export const selectTotalUSD = (state) =>
  state.items.reduce((acc, item) => acc + item.precio * item.qty, 0);

export const useCartStore = create((set) => ({
  items: [],
  tasaBCV: 398.74,

  // Setter para actualizar tasa desde API ✅
  setTasaBCV: (nuevaTasa) => set({ tasaBCV: nuevaTasa }),

  // Agrupa por id (más robusto) ✅
  addItem: (newItem) =>
    set((state) => {
      const existing = state.items.find((item) => item.id === newItem.id);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === existing.id
              ? { ...item, qty: item.qty + newItem.qty }
              : item
          ),
        };
      }

      return { items: [...state.items, newItem] };
    }),

  // Delivery sin duplicados ✅
  addDelivery: () =>
    set((state) => {
      if (state.items.find((i) => i.id === "DELIVERY")) return state;

      return {
        items: [
          ...state.items,
          { id: "DELIVERY", nombre: "Envío Express", precio: 2.0, qty: 1 },
        ],
      };
    }),

  // Eliminar item ✅
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}));