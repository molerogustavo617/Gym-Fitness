// src/pages/cliente/RutinaSemanal.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Calendar,
  Clock,
  Target,
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Circle,
  Weight,
  Repeat,
  Timer,
  Sparkles,
  Eye,
  Info,
  Play,
  Image as ImageIcon,
  User,
  Users
} from 'lucide-react';
import authService from '../../services/authService';
import rutinaService from '../../services/rutinaService';
import ejercicioService from '../../services/ejercicioService';
import entrenadosService from '../../services/entrenadosService';
import userService from '../../services/userService';

const RutinaSemanal = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rutinaAsignada, setRutinaAsignada] = useState(null);
  const [ejercicios, setEjercicios] = useState([]);
  const [ejerciciosCatalogo, setEjerciciosCatalogo] = useState([]);
  const [dias, setDias] = useState([]);
  const [diaActivo, setDiaActivo] = useState(null);
  const [entrenador, setEntrenador] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadRutina(currentUser.idusuario);
  }, [navigate]);

  const loadRutina = async (userId) => {
    setLoading(true);
    setError('');
    try {
      // 1. Obtener catálogo de ejercicios
      const catalogo = await ejercicioService.getAll();
      setEjerciciosCatalogo(Array.isArray(catalogo) ? catalogo : []);

      // 2. Obtener asignaciones de rutina
      const asignaciones = await rutinaService.getAsignaciones();
      const asignacionActiva = Array.isArray(asignaciones)
        ? asignaciones.find(a => a.idusuario === userId && a.activo === true)
        : null;

      if (!asignacionActiva) {
        setLoading(false);
        return;
      }

      // 3. Obtener la rutina
      const rutina = await rutinaService.getById(asignacionActiva.idrutina);
      setRutinaAsignada(rutina);

      // 4. Obtener ejercicios de la rutina
      const ejerciciosData = await rutinaService.getEjerciciosByRutina(rutina.idrutina);
      setEjercicios(Array.isArray(ejerciciosData) ? ejerciciosData : []);

      // 5. Obtener días
      const diasData = await rutinaService.getDias();
      if (diasData && diasData.length > 0) {
        setDias(diasData);
        setDiaActivo(diasData[0].iddia);
      } else {
        const diasDefault = [
          { iddia: 1, nombre: 'Lunes', orden: 1 },
          { iddia: 2, nombre: 'Martes', orden: 2 },
          { iddia: 3, nombre: 'Miércoles', orden: 3 },
          { iddia: 4, nombre: 'Jueves', orden: 4 },
          { iddia: 5, nombre: 'Viernes', orden: 5 },
          { iddia: 6, nombre: 'Sábado', orden: 6 },
          { iddia: 7, nombre: 'Domingo', orden: 7 }
        ];
        setDias(diasDefault);
        setDiaActivo(1);
      }

      // 6. Obtener entrenador
      const relaciones = await entrenadosService.getByCliente(userId);
      const relacionActiva = Array.isArray(relaciones)
        ? relaciones.find(r => r.activo === true)
        : null;

      if (relacionActiva) {
        const entrenadores = await userService.getAll();
        const entrenadorData = Array.isArray(entrenadores)
          ? entrenadores.find(u => u.idusuario === relacionActiva.identrenador)
          : null;
        setEntrenador(entrenadorData);
      }

    } catch (err) {
      console.error('Error al cargar rutina:', err);
      setError('No se pudo cargar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const getNombreEjercicio = (idEjercicio) => {
    const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === idEjercicio);
    return ejercicio ? ejercicio.nombre : 'Ejercicio desconocido';
  };

  const getImagenEjercicio = (idEjercicio) => {
    const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === idEjercicio);
    return ejercicio?.imagenurl || null;
  };

  const getMusculoEjercicio = (idEjercicio) => {
    const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === idEjercicio);
    return ejercicio?.musculo || null;
  };

  const getDiaNombre = (idDia) => {
    const dia = dias.find(d => d.iddia === idDia);
    return dia ? dia.nombre : 'Sin día';
  };

  const ejerciciosDelDia = ejercicios.filter(e => e.iddia === diaActivo);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white font-mono text-sm animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin"></div>
          Cargando tu rutina...
        </div>
      </div>
    );
  }

  if (!rutinaAsignada) {
    return (
      <div className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/cliente/dashboard')}
            className="p-2 rounded-xl border border-[#00F2FE]/10 hover:border-[#00F2FE]/30 text-[#9A9AA0] hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-[#00F2FE]" />
              Mi Rutina
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">No tienes una rutina asignada aún</p>
          </div>
        </div>
        <div className="bg-[#111625]/30 border border-[#00F2FE]/10 rounded-2xl p-8 text-center">
          <Dumbbell className="w-12 h-12 text-[#00F2FE]/30 mx-auto mb-3" />
          <p className="text-white font-medium">Sin rutina asignada</p>
          <p className="text-[#9A9AA0] text-sm font-mono">Habla con tu entrenador para obtener una rutina personalizada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111625]/50 border border-[#00F2FE]/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/cliente/dashboard')}
            className="p-2 rounded-xl border border-[#00F2FE]/10 hover:border-[#00F2FE]/30 text-[#9A9AA0] hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-[#00F2FE]" />
              Mi Rutina
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">
              {rutinaAsignada.nombre} • {rutinaAsignada.duracionsemanas || 4} semanas
            </p>
          </div>
        </div>
        {entrenador && (
          <div className="flex items-center gap-2 bg-[#0A0A0B]/50 px-3 py-1.5 rounded-xl border border-[#00F2FE]/10">
            <div className="w-6 h-6 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/20 flex items-center justify-center text-[#00F2FE] font-bold text-[10px] overflow-hidden">
              {entrenador.fotoperfil ? (
                <img src={entrenador.fotoperfil} alt={entrenador.nombre} className="w-full h-full object-cover" />
              ) : (
                entrenador.nombre?.charAt(0) || 'E'
              )}
            </div>
            <span className="text-[#9A9AA0] text-[10px] font-mono">
              Entrenador: <span className="text-white">{entrenador.nombre}</span>
            </span>
          </div>
        )}
      </div>

      {/* DESCRIPCIÓN */}
      {rutinaAsignada.descripcion && (
        <div className="bg-gradient-to-r from-[#00F2FE]/5 to-purple-500/5 border border-[#00F2FE]/10 rounded-2xl p-4">
          <p className="text-[#9A9AA0] text-sm font-mono flex items-start gap-2">
            <Info className="w-4 h-4 text-[#00F2FE] flex-shrink-0 mt-0.5" />
            {rutinaAsignada.descripcion}
          </p>
        </div>
      )}

      {/* DÍAS DE LA SEMANA */}
      <div className="flex flex-wrap gap-2">
        {dias.map((dia) => {
          const tieneEjercicios = ejercicios.some(e => e.iddia === dia.iddia);
          const esHoy = dia.iddia === new Date().getDay();
          return (
            <button
              key={dia.iddia}
              onClick={() => setDiaActivo(dia.iddia)}
              className={`px-4 py-2 text-xs font-mono font-bold uppercase rounded-xl transition-all flex items-center gap-2 ${
                diaActivo === dia.iddia
                  ? 'bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 shadow-[0_0_15px_rgba(0,242,254,0.1)]'
                  : 'text-[#9A9AA0] border border-transparent hover:text-white hover:bg-[#111625]/50'
              } ${esHoy ? 'border-[#00F2FE]/20' : ''}`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {dia.nombre}
              {tieneEjercicios && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]"></span>
              )}
              {esHoy && (
                <span className="text-[8px] bg-[#00F2FE]/20 text-[#00F2FE] px-1.5 py-0.5 rounded-full">
                  HOY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* EJERCICIOS DEL DÍA */}
      <div className="bg-[#111625]/30 border border-[#00F2FE]/10 rounded-2xl p-4">
        <div className="flex items-center justify-between border-b border-[#00F2FE]/5 pb-3 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#9A9AA0] font-bold flex items-center gap-2">
            <Target className="w-4 h-4 text-[#00F2FE]" />
            {getDiaNombre(diaActivo)}
          </span>
          <span className="text-[#00F2FE] text-xs font-mono">
            {ejerciciosDelDia.length} ejercicios
          </span>
        </div>

        {ejerciciosDelDia.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-[#00F2FE]/5 border border-[#00F2FE]/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-8 h-8 text-[#00F2FE]/30" />
            </div>
            <p className="text-white font-medium">¡Día de descanso activo!</p>
            <p className="text-[#9A9AA0] text-sm font-mono mt-1">Aprovecha para recuperarte y recargar energías</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ejerciciosDelDia.map((ej, index) => {
              const imagen = getImagenEjercicio(ej.idejercicio);
              const musculo = getMusculoEjercicio(ej.idejercicio);
              return (
                <div key={ej.idrutinaejercicio} className="group bg-[#0A0A0B]/50 border border-[#00F2FE]/5 rounded-xl overflow-hidden hover:border-[#00F2FE]/20 transition-all hover:bg-[#0A0A0B]/70">
                  <div className="flex items-center p-3 gap-4">
                    {/* Imagen del ejercicio */}
                    <div className="w-14 h-14 rounded-xl bg-[#111625]/50 border border-[#00F2FE]/10 overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:border-[#00F2FE]/30 transition-all">
                      {imagen ? (
                        <img 
                          src={imagen} 
                          alt={getNombreEjercicio(ej.idejercicio)}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<div class="flex items-center justify-center w-full h-full"><svg class="w-6 h-6 text-[#00F2FE]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>`;
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <Dumbbell className="w-6 h-6 text-[#00F2FE]/30" />
                        </div>
                      )}
                    </div>

                    {/* Información */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-sm truncate">
                          {getNombreEjercicio(ej.idejercicio)}
                        </p>
                        {musculo && (
                          <span className="text-[8px] font-mono bg-[#00F2FE]/10 text-[#00F2FE] px-2 py-0.5 rounded-full whitespace-nowrap">
                            {musculo}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs font-mono text-[#9A9AA0] mt-0.5 flex-wrap">
                        <span className="flex items-center gap-0.5">
                          <Repeat className="w-3 h-3" />
                          {ej.series} × {ej.repeticiones}
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
                      </div>
                    </div>

                    {/* Check */}
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-[#00F2FE]/20 group-hover:text-[#00F2FE]/60 transition-colors cursor-pointer" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-[#00F2FE]/5 to-[#00F2FE]/0 border border-[#00F2FE]/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Total ejercicios</p>
          <p className="text-white text-xl font-bold">{ejercicios.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/5 to-purple-500/0 border border-purple-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Días activos</p>
          <p className="text-white text-xl font-bold">
            {dias.filter(d => ejercicios.some(e => e.iddia === d.iddia)).length}
          </p>
        </div>
      </div>

      {/* ACCIÓN: Ver todos los ejercicios */}
      <button
        onClick={() => navigate('/cliente/ejercicios')}
        className="w-full py-3 bg-[#00F2FE]/5 border border-[#00F2FE]/20 rounded-xl text-[#00F2FE] text-sm font-medium hover:bg-[#00F2FE]/10 transition-all flex items-center justify-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Ver catálogo de ejercicios
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default RutinaSemanal;