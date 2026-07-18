// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExchangeRateProvider } from './context/ExchangeRateContext';

// ---- PÁGINAS PÚBLICAS ----
import Login from './pages/Login';
import Perfil from './pages/Perfil';
import LandingPage from './Informacion/landingpage';
import DashboardRouter from './pages/DashboardRouter';

// ---- LAYOUTS ----
import LayoutAdmin from './components/LayoutAdmin';
import LayoutRecepcionista from './components/LayoutRecepcionista';
import LayoutEntrenador from './components/LayoutEntrenador';
import LayoutCliente from './components/LayoutCliente';

// ---- PÁGINAS ADMIN ----
import DashboardAdmin from './pages/admin/DashboardAdmin';
import Usuarios from './pages/admin/Usuarios';
import Maquinas from './pages/admin/Maquinas';
import Ejercicios from './pages/admin/Ejercicios';
import Rutinas from './pages/admin/Rutinas';
import Accesos from './pages/admin/Accesos';
import Entrenamientos from './pages/admin/Entrenamientos';
import Entrenados from './pages/admin/Entrenados';
import Roles from './pages/admin/Roles';
import Evolucion from './pages/admin/Evolucion';
import QR from './pages/admin/QR';
import Configuracion from './pages/admin/Configuracion';
import Notificaciones from './pages/admin/Notificaciones';
import HistorialCambios from './pages/admin/HistorialCambios';
import Membresias from './pages/admin/Membresias';
import Pagos from './pages/admin/Pagos';
import PagoDetalle from './pages/admin/PagoDetalle';

// ---- PÁGINAS RECEPCIONISTA ----
import DashboardRecepcionista from './pages/recepcionista/DashboardRecepcionista';
import UsuariosRecepcionista from './pages/recepcionista/UsuariosRecepcionista';
import QRAccessRecepcionista from './pages/recepcionista/QRAccessRecepcionista';
import AccesosRecepcionista from './pages/recepcionista/AccesosRecepcionista';

// ---- PÁGINAS ENTRENADOR ----
import DashboardEntrenador from './pages/entrenador/DashboardEntrenador';
import ClientesEntrenador from './pages/entrenador/ClientesEntrenador';
import DetalleClienteEntrenador from './pages/entrenador/DetalleClienteEntrenador';
import EjerciciosEntrenador from './pages/entrenador/EjerciciosEntrenador';
import RutinasEntrenador from './pages/entrenador/RutinasEntrenador';
import RutinaFormEntrenador from './pages/entrenador/RutinaFormEntrenador';
import RutinaDetalleEntrenador from './pages/entrenador/RutinaDetalleEntrenador';
import RutinaDelDiaEntrenador from './pages/entrenador/RutinaDelDiaEntrenador';
import EvolucionEntrenador from './pages/entrenador/EvolucionEntrenador';
import EntrenamientosEntrenador from './pages/entrenador/EntrenamientosEntrenador';

// ---- PÁGINAS CLIENTE ----
import DashboardCliente from './pages/cliente/DashboardCliente';
import RutinaSemanal from './pages/cliente/RutinaSemanal';
import QRCliente from './pages/cliente/QRCliente';
import MembresiasCliente from './pages/cliente/MembresiasCliente';
import PagoCliente from './pages/cliente/PagoCliente';
import PerfilCliente from './pages/cliente/PerfilCliente';
import EjerciciosCliente from './pages/cliente/EjerciciosCliente';

function App() {
  return (
    <BrowserRouter>
      <ExchangeRateProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/dashboard" element={<DashboardRouter />} />

          {/* RUTAS ADMIN */}
          <Route path="/admin" element={<LayoutAdmin />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardAdmin />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="roles" element={<Roles />} />
            <Route path="ejercicios" element={<Ejercicios />} />
            <Route path="rutinas" element={<Rutinas />} />
            <Route path="entrenamientos" element={<Entrenamientos />} />
            <Route path="entrenados" element={<Entrenados />} />
            <Route path="maquinas" element={<Maquinas />} />
            <Route path="accesos" element={<Accesos />} />
            <Route path="qr" element={<QR />} />
            <Route path="membresias" element={<Membresias />} />
            <Route path="pagos" element={<Pagos />} />
            <Route path="pagos/:id" element={<PagoDetalle />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="notificaciones" element={<Notificaciones />} />
            <Route path="historial-cambios" element={<HistorialCambios />} />
            <Route path="evolucion" element={<Evolucion />} />
          </Route>

          {/* RUTAS RECEPCIONISTA */}
          <Route path="/recepcion" element={<LayoutRecepcionista />}>
            <Route index element={<Navigate to="/recepcion/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardRecepcionista />} />
            <Route path="usuarios" element={<UsuariosRecepcionista />} />
            <Route path="qr" element={<QRAccessRecepcionista />} />
            <Route path="accesos" element={<AccesosRecepcionista />} />
          </Route>

          {/* RUTAS ENTRENADOR */}
          <Route path="/entrenador" element={<LayoutEntrenador />}>
            <Route index element={<Navigate to="/entrenador/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardEntrenador />} />
            <Route path="clientes" element={<ClientesEntrenador />} />
            <Route path="clientes/:id" element={<DetalleClienteEntrenador />} />
            <Route path="ejercicios" element={<EjerciciosEntrenador />} />
            <Route path="rutinas" element={<RutinasEntrenador />} />
            <Route path="rutinas/crear" element={<RutinaFormEntrenador />} />
            <Route path="rutinas/editar/:id" element={<RutinaFormEntrenador />} />
            <Route path="rutinas/:id" element={<RutinaDetalleEntrenador />} />
            <Route path="rutina-del-dia" element={<RutinaDelDiaEntrenador />} />
            <Route path="entrenamientos" element={<EntrenamientosEntrenador />} />
            <Route path="evolucion" element={<EvolucionEntrenador />} />
          </Route>

          {/* RUTAS CLIENTE */}
          <Route path="/cliente" element={<LayoutCliente />}>
            <Route index element={<Navigate to="/cliente/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardCliente />} />
            <Route path="ejercicios" element={<EjerciciosCliente />} />
            <Route path="rutinas" element={<RutinaSemanal />} />
            <Route path="qr" element={<QRCliente />} />
            <Route path="membresias" element={<MembresiasCliente />} />
            <Route path="pagos" element={<PagoCliente />} />
            <Route path="perfil" element={<PerfilCliente />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ExchangeRateProvider>
    </BrowserRouter>
  );
}

export default App;