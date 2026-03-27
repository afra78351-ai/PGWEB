import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Payment from "../pages/Payment";

import Tracking from "../orders/Tracking";
import Confirmed from "../orders/Confirmed";
import Delivery from "../delivery/Delivery";
import Login from "../features/auth/Login";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tracking/:id" element={<Tracking />} />
        <Route path="/delivery" element={<Delivery />} />
        <Route path="/confirmed" element={<Confirmed />} />
      </Routes>
    </BrowserRouter>
  );
}