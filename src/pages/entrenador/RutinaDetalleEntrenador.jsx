// src/pages/entrenador/RutinaDetalleEntrenador.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  UserPlus,
  Trash2,
  Dumbbell,
  Calendar,
  Clock,
  FileText,
  Hash,
  Repeat,
  Weight,
  Timer,
  Users,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import authService from '../../services/authService';
import rutinaService from '../../services/rutinaService';
import ejercicioService from '../../services/ejercicioService';
import diasService from '../../services/diasService';

const RutinaDetalleEntrenador = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [rutina, setRutina] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [dias, setDias] = useState([]);
  const [ejerciciosCatalogo, setEjerciciosCatalogo] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 4) {
      navigate('/dashboard');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [navigate, id]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Obtener rutina
      const rutinaData = await rutinaService.getById(parseInt(id));
      setRutina(rutinaData);

      // Obtener ejercicios de la rutina
      const ejerciciosData = await rutinaService.getEjerciciosByRutina(parseInt(id));
      setEjercicios(Array.isArray(ejerciciosData) ? ejerciciosData : []);

      // Obtener días
      const diasData = await diasService.getAll();
      setDias(Array.isArray(diasData) ? diasData : []);

      // Obtener catálogo de ejercicios
      const catalogoData = await ejercicioService.getAll();
      setEjerciciosCatalogo(Array.isArray(catalogoData) ? catalogoData : []);

      // Obtener asignaciones
      const asignacionesData = await rutinaService.getAsignaciones();
      const filtradas = Array.isArray(asignacionesData) 
        ? asignacionesData.filter(a => a.idrutina === parseInt(id) && a.activo === true)
        : [];
      setAsignaciones(filtradas);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los detalles de la rutina');
    } finally {
      setLoading(false);
    }
  };

  const getNombreEjercicio = (idEjercicio) => {
    const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === idEjercicio);
    return ejercicio ? ejercicio.nombre : 'Ejercicio desconocido';
  };

  const getNombreDia = (idDia) => {
    const dia = dias.find(d => d.iddia === idDia);
    return dia ? dia.nombre : 'Sin día';
  };

  const getMusculoEjercicio = (idEjercicio) => {
    const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === idEjercicio);
    return ejercicio?.musculo || null;
  };

  const agruparPorDia = () => {
    const grouped = {};
    ejercicios.forEach(ej => {
      const dia = ej.iddia || 'sin-dia';
      if (!grouped[dia]) grouped[dia] = [];
      grouped[dia].push(ej);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando detalles...</div>
      </div>
    );
  }

  if (!rutina) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertCircle className="w-12 h-12 text-yellow-400/50" />
        <p className="text-[#9A9AA0] text-sm font-mono">Rutina no encontrada</p>
        <button
          onClick={() => navigate('/entrenador/rutinas')}
          className="px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl text-sm font-bold hover:bg-orange-400"
        >
          Volver a Rutinas
        </button>
      </div>
    );
  }

  const ejerciciosPorDia = agruparPorDia();

  return (
    <div className="w-full space-y-4">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111625]/50 border border-orange-500/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/entrenador/rutinas')}
            className="p-2 rounded-xl border border-orange-500/20 hover:border-orange-500/40 text-[#9A9AA0] hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <FileText className="w-6 h-6 text-orange-400" />
              {rutina.nombre}
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">Detalle de la rutina</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-3 py-1 rounded-full ${
            rutina.activo 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {rutina.activo ? 'Activa' : 'Inactiva'}
          </span>
          <button
            onClick={() => navigate(`/entrenador/rutinas/editar/${id}`)}
            className="px-3 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg text-sm hover:bg-orange-500/20 transition-colors flex items-center gap-1"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>

      {/* INFORMACIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Descripción</p>
          <p className="text-white text-sm mt-1">
            {rutina.descripcion || 'Sin descripción'}
          </p>
        </div>
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Duración</p>
          <p className="text-white text-sm mt-1 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-orange-400" />
            {rutina.duracionsemanas || 0} semanas
          </p>
        </div>
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Clientes asignados</p>
          <p className="text-white text-sm mt-1 flex items-center gap-1">
            <Users className="w-4 h-4 text-orange-400" />
            {asignaciones.length} clientes
          </p>
        </div>
      </div>

      {/* EJERCICIOS POR DÍA */}
      <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-6">
        <h3 className="text-white font-bold flex items-center gap-2 mb-4">
          <Dumbbell className="w-5 h-5 text-orange-400" />
          Ejercicios ({ejercicios.length})
        </h3>

        {ejercicios.length === 0 ? (
          <div className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-[#9A9AA0]/20 mx-auto mb-3" />
            <p className="text-[#9A9AA0] text-sm font-mono">Esta rutina no tiene ejercicios</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(ejerciciosPorDia).map(([diaId, ejerciciosDia]) => (
              <div key={diaId} className="space-y-2">
                <h4 className="text-orange-400 font-medium text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {getNombreDia(parseInt(diaId))}
                  <span className="text-[#9A9AA0] text-[10px] font-mono">
                    ({ejerciciosDia.length} ejercicios)
                  </span>
                </h4>
                <div className="space-y-2">
                  {ejerciciosDia
                    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                    .map((ej, index) => {
                      const musculo = getMusculoEjercicio(ej.idejercicio);
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl hover:bg-orange-500/5 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-[#9A9AA0] text-xs font-mono w-5">{index + 1}</span>
                            <div className="min-w-0">
                              <p className="text-white font-medium text-sm truncate">
                                {getNombreEjercicio(ej.idejercicio)}
                              </p>
                              <div className="flex items-center gap-3 text-xs font-mono text-[#9A9AA0] flex-wrap">
                                <span className="flex items-center gap-0.5">
                                  <Hash className="w-3 h-3" />
                                  {ej.series} series
                                </span>
                                <span className="flex items-center gap-0.5">
                                  <Repeat className="w-3 h-3" />
                                  {ej.repeticiones} reps
                                </span>
                                {ej.pesosugerido > 0 && (
                                  <span className="flex items-center gap-0.5">
                                    <Weight className="w-3 h-3" />
                                    {ej.pesosugerido} kg
                                  </span>
                                )}
                                {ej.descansosegundos > 0 && (
                                  <span className="flex items-center gap-0.5">
                                    <Timer className="w-3 h-3" />
                                    {ej.descansosegundos}s
                                  </span>
                                )}
                                {musculo && (
                                  <span className="flex items-center gap-0.5 text-orange-400">
                                    <Tag className="w-3 h-3" />
                                    {musculo}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate(`/entrenador/rutinas/editar/${id}`)}
          className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Editar Rutina
        </button>
        <button
          onClick={() => navigate('/entrenador/rutinas')}
          className="p-3 bg-[#0A0A0B]/50 border border-orange-500/10 rounded-xl text-[#9A9AA0] hover:bg-orange-500/5 transition-colors flex items-center justify-center gap-2"
        >
          Volver a Rutinas
        </button>
      </div>
    </div>
  );
};

export default RutinaDetalleEntrenador;