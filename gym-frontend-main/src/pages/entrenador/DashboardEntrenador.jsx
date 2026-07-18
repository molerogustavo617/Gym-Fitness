// src/pages/entrenador/DashboardEntrenador.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

const DashboardEntrenador = () => {
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
            <h1 className="text-2xl font-bold text-gym-neon">Gym System - Entrenador</h1>
            <p className="text-gym-white text-sm">
              {user.nombre} {user.apellido} • {user.rol || 'Entrenador'}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="text-gym-neon text-sm uppercase tracking-wider">Mis Alumnos</div>
            <div className="text-gym-white text-3xl font-bold mt-2">0</div>
            <div className="text-gym-gray text-sm mt-1">Asignados a ti</div>
          </div>
          <div className="card">
            <div className="text-gym-neon text-sm uppercase tracking-wider">Entrenamientos Hoy</div>
            <div className="text-gym-white text-3xl font-bold mt-2">0</div>
            <div className="text-gym-gray text-sm mt-1">Registros de hoy</div>
          </div>
          <div className="card">
            <div className="text-gym-neon text-sm uppercase tracking-wider">Pagos Pendientes</div>
            <div className="text-gym-white text-3xl font-bold mt-2">0</div>
            <div className="text-gym-gray text-sm mt-1">Próximos a vencer</div>
          </div>
        </div>

        <h2 className="text-gym-neon text-xl font-bold mb-4">Gestión de Alumnos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card hover:border-gym-neon border-2 border-transparent transition-colors cursor-pointer">
            <h3 className="text-gym-white text-lg font-bold">Mis Alumnos</h3>
            <p className="text-gym-gray text-sm">Ver lista de alumnos asignados</p>
          </div>
          <div className="card hover:border-gym-neon border-2 border-transparent transition-colors cursor-pointer">
            <h3 className="text-gym-white text-lg font-bold">Registrar Entrenamiento</h3>
            <p className="text-gym-gray text-sm">Agregar ejercicio a un alumno</p>
          </div>
          <div className="card hover:border-gym-neon border-2 border-transparent transition-colors cursor-pointer">
            <h3 className="text-gym-white text-lg font-bold">Evolución</h3>
            <p className="text-gym-gray text-sm">Ver progreso de tus alumnos</p>
          </div>
          <div className="card hover:border-gym-neon border-2 border-transparent transition-colors cursor-pointer">
            <h3 className="text-gym-white text-lg font-bold">Pagos</h3>
            <p className="text-gym-gray text-sm">Control de pagos de alumnos</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardEntrenador;