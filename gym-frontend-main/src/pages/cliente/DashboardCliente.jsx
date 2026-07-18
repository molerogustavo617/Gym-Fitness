// src/pages/cliente/DashboardCliente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/api';

// Iconos
import {
  Calendar,
  Dumbbell,
  Activity,
  Clock,
  Target,
  LineChart,
  Weight,
  Check,
  CreditCard,
  Utensils,
  Smartphone,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

// ============================================================
// IMAGENES
// ============================================================
const IMAGENES = {
  musculoDia: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  pressBanca: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=200&q=80',
  aperturas: 'https://images.unsplash.com/photo-1541534741688-3f6a0d80d98b?auto=format&fit=crop&w=200&q=80',
  fondos: 'https://images.unsplash.com/photo-1571731956672-f2b94d7c0f1d?auto=format&fit=crop&w=200&q=80',
  extensionesTriceps: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=200&q=80'
};

// ============================================================
// DATOS FICTICIOS (para lo que falta en el backend)
// ============================================================
const MOCK_DATA = {
  evolucion: {
    pesoActual: 78.2,
    pesoInicioMes: 81.2,
    pesoObjetivo: 72.0,
    historial: [
      { mes: 'Ene', peso: 85 },
      { mes: 'Feb', peso: 83 },
      { mes: 'Mar', peso: 81 },
      { mes: 'Abr', peso: 79 },
      { mes: 'May', peso: 77 },
      { mes: 'Jun', peso: 78.2 }
    ]
  },
  rutinaHoy: {
    nombre: 'Pecho y Triceps',
    ejercicios: [
      { nombre: 'Press de Banca', series: 4, reps: '12-10-8-6', musculo: 'Pecho' },
      { nombre: 'Aperturas con Mancuernas', series: 3, reps: '12', musculo: 'Pecho' },
      { nombre: 'Fondos en Paralelas', series: 3, reps: 'Fallo', musculo: 'Triceps' },
      { nombre: 'Extensiones de Triceps', series: 4, reps: '12', musculo: 'Triceps' }
    ]
  }
};

const DashboardCliente = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [accesos, setAccesos] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [evolucion, setEvolucion] = useState(MOCK_DATA.evolucion);
  const [rutinaHoy, setRutinaHoy] = useState(MOCK_DATA.rutinaHoy);
  const navigate = useNavigate();

  // ============================================================
  // CARGAR DATOS DEL BACKEND
  // ============================================================
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadDashboardData(currentUser.idusuario);
  }, [navigate]);

  const loadDashboardData = async (userId) => {
    setLoading(true);
    setError('');
    
    try {
      // ============================================================
      // 1. DATOS REALES (endpoints que ya existen)
      // ============================================================
      
      // Usuario
      const usuarioRes = await api.get(`/usuarios/${userId}`);
      setUserData(usuarioRes.data);
      
      // Entrenamientos
      const entrenamientosRes = await api.get(`/entrenamientos/usuario/${userId}?limit=50`);
      setEntrenamientos(entrenamientosRes.data || []);
      
      // Accesos
      const accesosRes = await api.get(`/accesos/usuario/${userId}?limit=50`);
      setAccesos(accesosRes.data || []);
      
      // Entrenadores
      const entrenadoresRes = await api.get(`/entrenados/alumno/${userId}`);
      setEntrenadores(entrenadoresRes.data || []);
      
      // ============================================================
      // 2. DATOS FICTICIOS (lo que falta en el backend)
      //    Se mantienen los datos de MOCK_DATA
      // ============================================================
      // evolucion y rutinaHoy ya estan en el estado con MOCK_DATA
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar algunos datos. Usando datos de ejemplo.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // CALCULOS
  // ============================================================
  const nombre = userData?.nombre || 'Usuario';
  const plan = userData?.plan || 'Premium';
  
  const pesoActual = evolucion.pesoActual || 0;
  const pesoInicioMes = evolucion.pesoInicioMes || 0;
  const pesoObjetivo = evolucion.pesoObjetivo || 72;
  const perdidaPeso = (pesoInicioMes - pesoActual).toFixed(1);
  const historialPeso = evolucion.historial || [];
  
  const totalEntrenamientos = entrenamientos?.length || 0;
  const metaEntrenamientos = 20;
  const porcentajeEntrenamientos = metaEntrenamientos > 0 
    ? Math.round((totalEntrenamientos / metaEntrenamientos) * 100) 
    : 0;
  
  // Asistencia desde accesos
  const diasAsistidos = Math.min(accesos?.length || 0, 7);
  const diasSemana = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const asistencia = diasSemana.reduce((acc, dia, index) => {
    acc[dia] = index < diasAsistidos;
    return acc;
  }, {});
  
  // Ultimos accesos
  const ultimosAccesos = (accesos || []).slice(0, 3).map(a => ({
    dia: new Date(a.fechaentrada).toLocaleDateString('es-ES', { weekday: 'short' }),
    hora: new Date(a.fechaentrada).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    estado: 'Entrada'
  }));

  // ============================================================
  // RENDER
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white font-mono text-sm animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin"></div>
          Cargando tu espacio...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 pb-6 sm:pb-8 max-w-4xl mx-auto px-3 sm:px-4">
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#00F2FE]/30 to-[#00F2FE]/10 border-2 border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] font-bold text-base sm:text-lg flex-shrink-0">
            {nombre?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-white truncate">
              Hola, <span className="text-[#00F2FE]">{nombre}</span>
            </h1>
            <p className="text-[#9A9AA0] text-[8px] sm:text-[10px] font-mono flex items-center gap-1 sm:gap-2 truncate">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0"></span>
              <span className="hidden xs:inline">Activo</span>
              <span className="hidden sm:inline">{plan}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          <span className="px-2 py-1 sm:px-3 sm:py-1.5 text-[8px] sm:text-[10px] font-mono font-bold bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] rounded-full truncate max-w-[70px] sm:max-w-none">
            {plan}
          </span>
        </div>
      </div>



      {/* ============================================================ */}
      {/* TARJETA PRINCIPAL - Entrenamiento de Hoy (FICTICIO) */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#00F2FE]/20 via-[#00F2FE]/5 to-[#111625] border border-[#00F2FE]/20 p-4 sm:p-6">
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#00F2FE]/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-[#00F2FE]/5 blur-xl"></div>
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-6 relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-[#00F2FE]/30 flex-shrink-0">
            <img 
              src={IMAGENES.musculoDia}
              alt="Entrenamiento"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 text-center sm:text-left w-full min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <p className="text-[#9A9AA0] text-[8px] sm:text-[10px] font-mono uppercase tracking-wider">Entrenamiento de Hoy</p>
              <span className="bg-[#00F2FE]/20 text-[#00F2FE] text-[8px] px-2 py-0.5 rounded-full font-mono">Ejemplo</span>
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white truncate">
              {rutinaHoy.nombre}
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 sm:gap-3 mt-0.5 sm:mt-1">
              <span className="text-[#00F2FE] text-[10px] sm:text-xs font-mono">{rutinaHoy.ejercicios?.length || 0} ejercicios</span>
              <span className="w-1 h-1 rounded-full bg-[#5C5C60] hidden xs:inline"></span>
              <span className="text-[#9A9AA0] text-[10px] sm:text-xs font-mono">45 min</span>
              <span className="w-1 h-1 rounded-full bg-[#5C5C60] hidden xs:inline"></span>
              <span className="text-orange-400 text-[10px] sm:text-xs font-mono">Alta</span>
            </div>
            <button 
              onClick={() => navigate('/cliente/rutinas')}
              className="mt-2 sm:mt-3 px-3 py-1.5 sm:px-4 sm:py-2 bg-[#00F2FE] text-[#0A0A0B] text-[10px] sm:text-xs font-mono font-bold uppercase rounded-xl hover:bg-[#00D4E0] transition-all flex items-center gap-1 sm:gap-2 mx-auto sm:mx-0"
            >
              Ver Rutina <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TARJETAS DE ESTADISTICAS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        
        {/* PESO - FICTICIO */}
        <div className="bg-[#111625]/50 backdrop-blur-md border border-[#00F2FE]/10 rounded-2xl p-2 sm:p-4 text-center relative">
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
            <span className="bg-[#00F2FE]/20 text-[#00F2FE] text-[6px] sm:text-[8px] px-1.5 py-0.5 rounded-full font-mono">Ejemplo</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00F2FE]/10 flex items-center justify-center mx-auto mb-0.5 sm:mb-1">
            <Weight className="w-4 h-4 sm:w-5 sm:h-5 text-[#00F2FE]" />
          </div>
          <p className="text-white text-base sm:text-xl font-bold">{pesoActual || 0} kg</p>
          <p className="text-[#9A9AA0] text-[7px] sm:text-[8px] font-mono uppercase truncate">Peso</p>
          {perdidaPeso > 0 && (
            <p className="text-green-400 text-[8px] sm:text-[9px] font-mono">-{perdidaPeso} kg</p>
          )}
        </div>

        {/* ENTRENAMIENTOS - REAL */}
        <div className="bg-[#111625]/50 backdrop-blur-md border border-[#00F2FE]/10 rounded-2xl p-2 sm:p-4 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00F2FE]/10 flex items-center justify-center mx-auto mb-0.5 sm:mb-1">
            <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-[#00F2FE]" />
          </div>
          <p className="text-white text-base sm:text-xl font-bold">{totalEntrenamientos}</p>
          <p className="text-[#9A9AA0] text-[7px] sm:text-[8px] font-mono uppercase truncate">Completados</p>
          <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-1 overflow-hidden">
            <div className="h-full bg-[#00F2FE] rounded-full" style={{ width: `${porcentajeEntrenamientos}%` }} />
          </div>
        </div>

        {/* ASISTENCIA - REAL */}
        <div className="bg-[#111625]/50 backdrop-blur-md border border-[#00F2FE]/10 rounded-2xl p-2 sm:p-4 text-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00F2FE]/10 flex items-center justify-center mx-auto mb-0.5 sm:mb-1">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#00F2FE]" />
          </div>
          <p className="text-white text-base sm:text-xl font-bold">{diasAsistidos}/7</p>
          <p className="text-[#9A9AA0] text-[7px] sm:text-[8px] font-mono uppercase truncate">Asistencia</p>
          <div className="flex justify-center gap-0.5 mt-0.5">
            {diasSemana.map((dia) => (
              <span key={dia} className={`text-[6px] sm:text-[7px] font-mono ${asistencia[dia] ? 'text-[#00F2FE]' : 'text-[#5C5C60]'}`}>
                {dia}
              </span>
            ))}
          </div>
        </div>

        {/* META - FICTICIO */}
        <div className="bg-[#111625]/50 backdrop-blur-md border border-[#00F2FE]/10 rounded-2xl p-2 sm:p-4 text-center relative">
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
            <span className="bg-[#00F2FE]/20 text-[#00F2FE] text-[6px] sm:text-[8px] px-1.5 py-0.5 rounded-full font-mono">Ejemplo</span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#00F2FE]/10 flex items-center justify-center mx-auto mb-0.5 sm:mb-1">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#00F2FE]" />
          </div>
          <p className="text-white text-base sm:text-xl font-bold">{pesoObjetivo || 0} kg</p>
          <p className="text-[#9A9AA0] text-[7px] sm:text-[8px] font-mono uppercase truncate">Meta</p>
          <p className="text-[#00F2FE] text-[7px] sm:text-[8px] font-mono truncate">
            {pesoActual > pesoObjetivo ? `${(pesoActual - pesoObjetivo).toFixed(1)} kg restan` : 'Meta alcanzada'}
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* EJERCICIOS DEL DIA - FICTICIO */}
      {/* ============================================================ */}
      <div className="bg-[#111625]/50 backdrop-blur-md border border-[#00F2FE]/10 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-white text-xs sm:text-sm font-bold uppercase flex items-center gap-1 sm:gap-2">
              <Dumbbell className="w-3 h-3 sm:w-4 sm:h-4 text-[#00F2FE]" />
              <span className="hidden xs:inline">Ejercicios de Hoy</span>
              <span className="xs:hidden">Ejercicios</span>
            </h3>
            <span className="bg-[#00F2FE]/20 text-[#00F2FE] text-[8px] px-2 py-0.5 rounded-full font-mono">Ejemplo</span>
          </div>
          <span className="text-[#9A9AA0] text-[8px] sm:text-[9px] font-mono">{rutinaHoy.ejercicios?.length || 0} ejercicios</span>
        </div>
        
        <div className="space-y-1.5 sm:space-y-2">
          {(rutinaHoy.ejercicios || []).map((ej, index) => {
            let imagen = IMAGENES.musculoDia;
            if (ej.nombre.includes('Press')) imagen = IMAGENES.pressBanca;
            else if (ej.nombre.includes('Apertura')) imagen = IMAGENES.aperturas;
            else if (ej.nombre.includes('Fondos')) imagen = IMAGENES.fondos;
            else if (ej.nombre.includes('Extension')) imagen = IMAGENES.extensionesTriceps;
            
            return (
              <div key={index} className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl bg-[#0A0A0B]/50 border border-[#00F2FE]/5 hover:border-[#00F2FE]/20 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border border-[#00F2FE]/20 flex-shrink-0">
                  <img src={imagen} alt={ej.nombre} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs sm:text-sm font-medium truncate">{ej.nombre}</p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                    <span className="text-[#00F2FE] text-[8px] sm:text-[9px] font-mono">{ej.series} series</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-[#5C5C60] hidden xs:inline"></span>
                    <span className="text-[#9A9AA0] text-[8px] sm:text-[9px] font-mono">{ej.reps} reps</span>
                    <span className="w-0.5 h-0.5 rounded-full bg-[#5C5C60] hidden xs:inline"></span>
                    <span className="text-[#9A9AA0] text-[8px] sm:text-[9px] font-mono hidden xs:inline">{ej.musculo}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* GRAFICOS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        
        {/* EVOLUCION DE PESO - FICTICIO */}
        <div className="bg-[#111625]/50 backdrop-blur-md border border-[#00F2FE]/10 rounded-2xl p-3 sm:p-4 relative">
          <div className="absolute top-2 right-2">
            <span className="bg-[#00F2FE]/20 text-[#00F2FE] text-[8px] px-2 py-0.5 rounded-full font-mono">Ejemplo</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <LineChart className="w-3 h-3 sm:w-4 sm:h-4 text-[#00F2FE]" />
            <span className="text-white text-[10px] sm:text-xs font-bold uppercase">Evolucion</span>
          </div>
          <div className="h-12 sm:h-16 flex items-end gap-0.5 sm:gap-1">
            {(historialPeso || []).map((item, index) => {
              const maxPeso = Math.max(...(historialPeso || []).map(p => p.peso));
              const minPeso = Math.min(...(historialPeso || []).map(p => p.peso));
              const rango = maxPeso - minPeso || 1;
              const altura = ((item.peso - minPeso) / rango) * 40 + 10;
              const esUltimo = index === (historialPeso || []).length - 1;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full rounded-t transition-all ${esUltimo ? 'bg-[#00F2FE]' : 'bg-[#00F2FE]/40'}`}
                    style={{ height: `${altura}%`, minHeight: '4px' }}
                  />
                  <span className="text-[5px] sm:text-[6px] text-[#9A9AA0] font-mono mt-0.5">{item.mes}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-[6px] sm:text-[7px] font-mono text-[#5C5C60]">
            <span>Inicio: {historialPeso[0]?.peso || 0} kg</span>
            <span className="text-[#00F2FE]">Actual: {pesoActual} kg</span>
          </div>
        </div>

        {/* ULTIMOS ACCESOS - REAL */}
        <div className="bg-[#111625]/50 backdrop-blur-md border border-[#00F2FE]/10 rounded-2xl p-3 sm:p-4">
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-[#00F2FE]" />
            <span className="text-white text-[10px] sm:text-xs font-bold uppercase">Ultimos Accesos</span>
          </div>
          <div className="space-y-1 sm:space-y-1.5">
            {ultimosAccesos.length > 0 ? (
              ultimosAccesos.map((acceso, index) => (
                <div key={index} className="flex items-center justify-between p-1.5 sm:p-2 rounded-lg bg-[#0A0A0B]/50 border border-[#00F2FE]/5">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-[10px] sm:text-xs font-medium truncate">{acceso.dia}</p>
                      <p className="text-[#9A9AA0] text-[7px] sm:text-[8px] font-mono">{acceso.hora}</p>
                    </div>
                  </div>
                  <span className="text-[7px] sm:text-[8px] font-mono text-green-400 flex-shrink-0">{acceso.estado}</span>
                </div>
              ))
            ) : (
              <div className="text-[#9A9AA0] text-xs font-mono text-center py-4">
                No hay accesos registrados
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ACCESO RAPIDO */}
      {/* ============================================================ */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        <button 
          onClick={() => navigate('/cliente/rutinas')}
          className="p-2 sm:p-3 rounded-xl bg-[#0A0A0B]/50 border border-[#00F2FE]/10 hover:border-[#00F2FE]/30 hover:bg-[#00F2FE]/5 transition-all flex flex-col items-center gap-0.5 sm:gap-1 group"
        >
          <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#00F2FE]/50 group-hover:text-[#00F2FE] transition-colors" />
          <span className="text-[7px] sm:text-[8px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">Rutina</span>
        </button>
        <button 
          onClick={() => navigate('/cliente/dieta')}
          className="p-2 sm:p-3 rounded-xl bg-[#0A0A0B]/50 border border-[#00F2FE]/10 hover:border-[#00F2FE]/30 hover:bg-[#00F2FE]/5 transition-all flex flex-col items-center gap-0.5 sm:gap-1 group"
        >
          <Utensils className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#00F2FE]/50 group-hover:text-[#00F2FE] transition-colors" />
          <span className="text-[7px] sm:text-[8px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">Dieta</span>
        </button>
        <button 
          onClick={() => navigate('/cliente/qr')}
          className="p-2 sm:p-3 rounded-xl bg-[#0A0A0B]/50 border border-[#00F2FE]/10 hover:border-[#00F2FE]/30 hover:bg-[#00F2FE]/5 transition-all flex flex-col items-center gap-0.5 sm:gap-1 group"
        >
          <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#00F2FE]/50 group-hover:text-[#00F2FE] transition-colors" />
          <span className="text-[7px] sm:text-[8px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">QR</span>
        </button>
        <button 
          onClick={() => navigate('/cliente/pago')}
          className="p-2 sm:p-3 rounded-xl bg-[#0A0A0B]/50 border border-[#00F2FE]/10 hover:border-[#00F2FE]/30 hover:bg-[#00F2FE]/5 transition-all flex flex-col items-center gap-0.5 sm:gap-1 group"
        >
          <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-[#00F2FE]/50 group-hover:text-[#00F2FE] transition-colors" />
          <span className="text-[7px] sm:text-[8px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">Pagos</span>
        </button>
      </div>

    </div>
  );
};

export default DashboardCliente;