import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Payment from "../pages/Payment";
import Tracking from "../orders/Tracking";
import Confirmed from "../orders/Confirmed";
import Delivery from "../delivery/Delivery";
import Login from "../features/auth/Login";
import ProtectedRoute from "./ProtectedRoute"; 
import SalesForm from '../pages/SalesForm';

export default function AppRouter() {
  return (
    /* IMPORTANTE: El <BrowserRouter> ya NO va aquí. 
       Debe envolver al <AuthProvider> en tu archivo main.jsx 
    */
    <Routes>
      {/* 1. Ruta pública: Login */}
      <Route path="/login" element={<Login />} />

      // Dentro de tu configuración de rutas:
<Route path="/ventas" element={<SalesForm />} />

      {/* 2. Rutas Protegidas: Solo entras si Supabase confirma tu usuario */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/delivery" 
        element={
          <ProtectedRoute>
            <Delivery />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/payment" 
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/confirmed" 
        element={
          <ProtectedRoute>
            <Confirmed />
          </ProtectedRoute>
        } 
      />

      {/* 3. Seguimiento (puedes protegerla o no, según prefieras) */}
      <Route 
        path="/tracking/:id" 
        element={
          <ProtectedRoute>
            <Tracking />
          </ProtectedRoute>
        } 
      />

      {/* 4. Comodín: Cualquier ruta desconocida manda al Login o al Home si ya estás logueado */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );  
}