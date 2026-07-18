// src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import userService from '../../services/userService'; // Importamos tu servicio real

const DashboardAdmin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- ESTADOS REALES PARA LAS MÉTRICAS ---
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [desgloseRoles, setDesgloseRoles] = useState([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    
    // Cargar los usuarios reales del sistema para calcular las métricas
    calcularMetricasReales();
  }, [navigate]);

  const calcularMetricasReales = async () => {
    setLoading(true);
    try {
      // 1. Traemos la lista completa y real de usuarios desde tu base de datos
      const listaUsuarios = await userService.getAll();
      
      const total = listaUsuarios.length;
      setTotalUsuarios(total);

      if (total === 0) {
        setDesgloseRoles([]);
        setLoading(false);
        return;
      }

      // 2. Contamos cuántos usuarios pertenecen a cada rol de forma estricta (Corregido a Español)
      const conteo = {
        'Administrador': 0,
        'Recepcionista': 0,
        'Entrenador': 0,
        'Cliente': 0
      };

      listaUsuarios.forEach(u => {
        // Ajustamos según cómo devuelva el backend la propiedad (u.rol o u.idrol)
        if (u.rol === 'Administrador' || u.idrol === 1) conteo['Administrador']++;
        else if (u.rol === 'Recepcionista' || u.idrol === 2) conteo['Recepcionista']++;
        else if (u.rol === 'Entrenador' || u.rol === 'Trainer' || u.idrol === 4) conteo['Entrenador']++;
        else conteo['Cliente']++; // Por defecto o idrol === 3
      });

      // 3. Transformamos el conteo en el array estructurado con porcentajes reales para la gráfica
      const dataProcesada = Object.keys(conteo).map(nombreRol => {
        const cantidad = conteo[nombreRol];
        // Fórmula matemática estándar para el porcentaje: (cantidad / total) * 100
        const porcentaje = Math.round((cantidad / total) * 100);
        
        return {
          nombre: nombreRol,
          conteo: cantidad,
          porcentaje: porcentaje
        };
      });

      setDesgloseRoles(dataProcesada);

    } catch (err) {
      console.error("Error al calcular las métricas reales del sistema:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="text-gym-neon animate-pulse font-mono tracking-widest">SINCRONIZANDO SISTEMA...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Card de Bienvenida */}
      <div className="card border-gym-neon/20 p-5 md:p-6 bg-gym-card/20 border rounded-2xl backdrop-blur-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gym-neon/10 border-2 border-gym-neon/30 flex items-center justify-center text-2xl font-bold text-gym-neon shrink-0">
            {user.nombre?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gym-white">
              Bienvenido, {user.nombre}
            </h1>
            <p className="text-gym-gray-light">
              <span className="text-gym-neon font-medium">{user.rol || 'Administrador'}</span>
            </p>
            <p className="text-gym-gray text-sm">{user.correo}</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE LA GRÁFICA Y MÉTRICA GLOBAL REAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gráfica de Barras Dinámica (Limpia sin textos técnicos ni títulos) */}
        <div className="md:col-span-2 card border-gym-neon/10 p-5 rounded-2xl bg-gym-dark-secondary/30 backdrop-blur-md flex flex-col justify-center">
          <div className="space-y-4 my-2">
            {desgloseRoles.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gym-white font-medium">{item.nombre}</span>
                  <span className="text-gym-neon font-bold">
                    {item.conteo} {item.conteo === 1 ? 'miembro' : 'miembros'} ({item.porcentaje}%)
                  </span>
                </div>
                {/* Barra Proporcional */}
                <div className="w-full bg-gym-dark rounded-full h-2.5 border border-gym-gray/5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-gym-neon/40 via-gym-neon/80 to-gym-neon h-full rounded-full shadow-neon transition-all duration-1000"
                    style={{ width: `${item.porcentaje}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tarjeta de KPI - Total de Cuentas Reales */}
        <div className="card border-gym-neon/10 p-5 rounded-2xl bg-gym-dark-secondary/30 backdrop-blur-md flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-6 text-gym-neon/5 font-mono text-8xl font-black select-none group-hover:text-gym-neon/10 transition-colors duration-500">
            BD
          </div>
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-gym-gray font-bold mb-2">
               Matrícula Global
            </h3>
            <p className="text-xs text-gym-gray-light font-medium leading-relaxed">
              Total de cuentas activas e inactivas registradas actualmente.
            </p>
          </div>
          <div className="mt-6 md:mt-0">
            <span className="text-5xl font-black font-mono tracking-tighter text-gym-white block">
              {totalUsuarios}
            </span>
            <span className="text-gym-neon font-mono text-[10px] uppercase tracking-widest font-bold block mt-1">
              Usuarios Registrados
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardAdmin;