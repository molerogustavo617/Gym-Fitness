// src/pages/DashboardRouter.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const DashboardRouter = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    console.log('👤 Usuario en DashboardRouter:', currentUser);
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gym-dark">
        <div className="text-gym-neon font-mono text-sm animate-pulse">
          Cargando tu panel...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  console.log(`✅ Rol del usuario: idrol=${user.idrol}`);

  // ✅ REDIRIGIR SEGÚN EL ROL
  switch (user.idrol) {
    case 1: // Administrador
      return <Navigate to="/admin/dashboard" replace />;
    case 2: // Recepcionista
      return <Navigate to="/recepcion/dashboard" replace />;
    case 3: // Cliente
      return <Navigate to="/cliente/dashboard" replace />;
    case 4: // Entrenador
      return <Navigate to="/entrenador/dashboard" replace />; // ✅ CAMBIADO
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRouter;