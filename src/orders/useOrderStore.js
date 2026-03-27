import { create } from "zustand";

export const useOrderStore = create((set) => ({
  orderId:       null,
  deliveryData:  null,
  paymentData:   null,
  totalUSD:      0,
  totalBs:       0,
  status:        0,        // 0=Recibido, 1=Producción, 2=Listo, 3=Entregado
  paymentDigits: null,     // ✅ últimos 4 dígitos del pago móvil = código de orden

  setOrderId:      (id)       => set({ orderId: id }),
  setDeliveryData: (data)     => set({ deliveryData: data }),
  setPaymentData:  (data)     => set({ paymentData: data }),
  setTotals:       (usd, bs)  => set({ totalUSD: usd, totalBs: bs }),
  setStatus:       (step)     => set({ status: step }),
  setPaymentDigits:(digits)   => set({ paymentDigits: digits }), // ✅
}));