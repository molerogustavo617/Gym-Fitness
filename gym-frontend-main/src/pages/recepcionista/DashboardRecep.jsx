// src/pages/recepcionista/DashboardRecep.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const DashboardRecep = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gym-dark flex items-center justify-center">
        <div className="text-gym-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gym-dark">
      <header className="bg-gym-gray p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gym-neon">Gym System - Recepción</h1>
            <p className="text-gym-white text-sm">
              {user.nombre} {user.apellido} • {user.rol || 'Recepcionista'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-gym-neon text-sm uppercase tracking-wider">Personas Dentro</div>
            <div className="text-gym-white text-3xl font-bold mt-2">0</div>
            <div className="text-gym-gray text-sm mt-1">Actualmente en el gimnasio</div>
          </div>
          <div className="card">
            <div className="text-gym-neon text-sm uppercase tracking-wider">Entradas Hoy</div>
            <div className="text-gym-white text-3xl font-bold mt-2">0</div>
            <div className="text-gym-gray text-sm mt-1">Registros de hoy</div>
          </div>
          <div className="card">
            <div className="text-gym-neon text-sm uppercase tracking-wider">Usuarios Activos</div>
            <div className="text-gym-white text-3xl font-bold mt-2">0</div>
            <div className="text-gym-gray text-sm mt-1">Miembros del gimnasio</div>
          </div>
        </div>

        <h2 className="text-gym-neon text-xl font-bold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card hover:border-gym-neon border-2 border-transparent transition-colors cursor-pointer">
            <h3 className="text-gym-white text-lg font-bold">Registrar Entrada</h3>
            <p className="text-gym-gray text-sm">Marcar ingreso de un usuario</p>
          </div>
          <div className="card hover:border-gym-neon border-2 border-transparent transition-colors cursor-pointer">
            <h3 className="text-gym-white text-lg font-bold">Registrar Salida</h3>
            <p className="text-gym-gray text-sm">Marcar salida de un usuario</p>
          </div>
          <div className="card hover:border-gym-neon border-2 border-transparent transition-colors cursor-pointer">
            <h3 className="text-gym-white text-lg font-bold">Buscar Usuario</h3>
            <p className="text-gym-gray text-sm">Consultar información de un miembro</p>
          </div>
          <div className="card hover:border-gym-neon border-2 border-transparent transition-colors cursor-pointer">
            <h3 className="text-gym-white text-lg font-bold">Ver QR</h3>
            <p className="text-gym-gray text-sm">Escanear o mostrar código QR</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardRecep;