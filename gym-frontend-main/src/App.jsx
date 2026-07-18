// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ---- PÁGINAS PÚBLICAS ----
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import LandingPage from './informacion/landingpage';
import DashboardRouter from './pages/DashboardRouter';

// ---- LAYOUTS ----
import LayoutAdmin from './components/LayoutAdmin';
import LayoutCliente from './components/LayoutCliente';

// ---- PÁGINAS ADMIN ----
import DashboardAdmin from './pages/admin/DashboardAdmin'; 
import Usuarios from './pages/admin/Usuarios';
import Maquinas from './pages/admin/Maquinas';
import Accesos from './pages/admin/Accesos';
import Entrenamientos from './pages/admin/Entrenamientos';
import Entrenados from './pages/admin/Entrenados';
import Roles from './pages/admin/Roles';
import Evolucion from './pages/admin/Evolucion';
import QR from './pages/admin/QR';
import Configuracion from './pages/admin/Configuracion';

// ---- PÁGINAS CLIENTE ----
import DashboardCliente from './pages/cliente/DashboardCliente';
import RutinaSemanal from './pages/cliente/RutinaSemanal';
import DietaCliente from './pages/cliente/DietaCliente';
import QRCliente from './pages/cliente/QRCliente';
import PagoCliente from './pages/cliente/PagoCliente';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---- RUTA PRINCIPAL (LANDING) ---- */}
        <Route path="/" element={<LandingPage />} />

        {/* ---- RUTAS PÚBLICAS ---- */}
        <Route path="/login" element={<Login />} />
        <Route path="/perfil" element={<Perfil />} />

        {/* ============================================================ */}
        {/* DASHBOARD ROUTER - Redirige según el rol del usuario */}
        {/* ============================================================ */}
        <Route path="/dashboard" element={<DashboardRouter />} />

        {/* ============================================================ */}
        {/* RUTAS ADMIN (LayoutAdmin) - SOLO PARA ADMIN */}
        {/* ============================================================ */}
        <Route path="/admin" element={<LayoutAdmin />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardAdmin />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="maquinas" element={<Maquinas />} />
          <Route path="accesos" element={<Accesos />} />
          <Route path="entrenamientos" element={<Entrenamientos />} />
          <Route path="entrenados" element={<Entrenados />} />
          <Route path="roles" element={<Roles />} />
          <Route path="evolucion" element={<Evolucion />} />
          <Route path="qr" element={<QR />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        {/* ============================================================ */}
        {/* RUTAS CLIENTE (LayoutCliente) - SOLO PARA CLIENTE */}
        {/* ============================================================ */}
        <Route path="/cliente" element={<LayoutCliente />}>
          <Route index element={<Navigate to="/cliente/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardCliente />} />
          <Route path="rutinas" element={<RutinaSemanal />} />
          <Route path="dieta" element={<DietaCliente />} />
          <Route path="qr" element={<QRCliente />} />
          <Route path="pago" element={<PagoCliente />} />
        </Route>

        {/* ---- REDIRECCIÓN ---- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;