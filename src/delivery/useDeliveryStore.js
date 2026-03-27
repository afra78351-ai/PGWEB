import { create } from 'zustand';

export const useDeliveryStore = create((set) => ({
  step: 'location',

  customerData: {
    name: '',
    phone: '',
    email: '',
  },

  address: "",

  llegadaGPS: null,

  status: 'ESPERANDO VALIDACIÓN DE PAGO...',

  setStep: (newStep) => set({ step: newStep }),

  setAddress: (address) => set({ address }),

  setCoords: (coords) => set({ llegadaGPS: coords }),

  setCustomerData: (data) =>
    set((state) => ({
      customerData: {
        ...state.customerData,
        ...data,
      },
    })),

  setStatus: (newStatus) => set({ status: newStatus }),

  resetDelivery: () =>
    set({
      step: 'location',
      customerData: { name: '', phone: '', email: '' },
      address: "",
      llegadaGPS: null,
      status: 'ESPERANDO VALIDACIÓN DE PAGO...',
    }),
}));
