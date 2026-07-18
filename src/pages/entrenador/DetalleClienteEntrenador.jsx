// src/pages/entrenador/DetalleClienteEntrenador.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  Dumbbell,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Target,
  Weight,
  Ruler,
  Edit,
  PlusCircle,
  Eye,
  FileText,
  Users,
  BarChart,
  Zap,
  Flame,
  CircleDot,
  Circle,
  Calendar as CalendarIcon,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import authService from '../../services/authService';
import userService from '../../services/userService';
import entrenadosService from '../../services/entrenadosService';
import rutinaService from '../../services/rutinaService';
import entrenamientoService from '../../services/entrenamientoService';
import evolucionService from '../../services/evolucionService';
import ejercicioService from '../../services/ejercicioService';
import RegistrarEntrenamientoModal from './components/RegistrarEntrenamientoModal';

const DetalleClienteEntrenador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Datos del cliente
  const [cliente, setCliente] = useState(null);
  const [usuarioData, setUsuarioData] = useState(null);
  const [relacionEntrenador, setRelacionEntrenador] = useState(null);
  
  // Rutinas
  const [rutinaAsignada, setRutinaAsignada] = useState(null);
  const [ejerciciosRutina, setEjerciciosRutina] = useState([]);
  const [dias, setDias] = useState([]);
  const [ejerciciosCatalogo, setEjerciciosCatalogo] = useState([]);
  
  // Entrenamientos
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [entrenamientosRecientes, setEntrenamientosRecientes] = useState([]);
  
  // Evolución
  const [evoluciones, setEvoluciones] = useState([]);
  const [ultimaEvolucion, setUltimaEvolucion] = useState(null);
  const [estadisticasEvolucion, setEstadisticasEvolucion] = useState(null);
  
  // Estadísticas
  const [stats, setStats] = useState({
    totalEntrenamientos: 0,
    completados: 0,
    pendientes: 0,
    racha: 0,
    mejorPeso: null,
    mejorEjercicio: null
  });
  
  // Modal
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [showEjerciciosRutina, setShowEjerciciosRutina] = useState(false);

  // ============================================================
  // ✅ useEffect CON LOGS
  // ============================================================
  useEffect(() => {
    console.log('🔁 useEffect de DetalleClienteEntrenador ejecutado');
    console.log('📌 ID del cliente desde URL:', id);
    
    const currentUser = authService.getCurrentUser();
    console.log('👤 CurrentUser en useEffect:', currentUser);
    
    if (!currentUser || currentUser.idrol !== 4) {
      console.log('❌ Usuario no autorizado, redirigiendo...');
      navigate('/dashboard');
      return;
    }
    console.log('✅ Usuario autorizado, cargando datos...');
    loadData(currentUser.idusuario);
  }, [navigate, id]);

  // ============================================================
  // ✅ loadData CON LOGS DETALLADOS
  // ============================================================
  const loadData = async (userId) => {
    console.log('🚀 loadData iniciado para userId:', userId);
    console.log('📌 Buscando cliente con ID:', id);
    setLoading(true);
    setError('');
    
    try {
      // 1. OBTENER RELACIÓN ENTRENADOR-CLIENTE
      console.log('📡 Llamando a entrenadosService.getByEntrenador con:', userId);
      const relaciones = await entrenadosService.getByEntrenador(userId);
      console.log('✅ Relaciones recibidas:', relaciones);
      console.log('📊 Es array?', Array.isArray(relaciones));
      console.log('📊 Cantidad de relaciones:', relaciones?.length || 0);
      
      const relacionesArray = Array.isArray(relaciones) ? relaciones : [];
      console.log('🔍 Buscando relación con identrenado =', parseInt(id));
      
      const relacion = relacionesArray.find(r => r.identrenado === parseInt(id));
      console.log('✅ Relación encontrada:', relacion);
      
      if (!relacion) {
        console.log('❌ No se encontró relación para el cliente', id);
        setError('Este cliente no está asignado a ti');
        setLoading(false);
        return;
      }
      setRelacionEntrenador(relacion);

      // 2. OBTENER DATOS DEL CLIENTE
      console.log('📡 Llamando a userService.getAll()');
      const usuariosData = await userService.getAll();
      console.log('✅ Usuarios recibidos:', usuariosData?.length || 0);
      
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];
      const usuario = usuariosArray.find(u => u.idusuario === parseInt(id));
      console.log('✅ Usuario encontrado:', usuario);
      
      if (!usuario) {
        console.log('❌ No se encontró usuario con ID', id);
        setError('Usuario no encontrado');
        setLoading(false);
        return;
      }
      setUsuarioData(usuario);

      // 3. OBTENER RUTINA ASIGNADA
      console.log('📡 Llamando a rutinaService.getAsignaciones()');
      const asignaciones = await rutinaService.getAsignaciones();
      console.log('✅ Asignaciones recibidas:', asignaciones?.length || 0);
      
      const asignacionesArray = Array.isArray(asignaciones) ? asignaciones : [];
      const asignacion = asignacionesArray.find(a => a.idusuario === parseInt(id) && a.activo === true);
      console.log('✅ Asignación activa encontrada:', asignacion);
      
      if (asignacion) {
        setRutinaAsignada(asignacion);
        console.log('📡 Llamando a rutinaService.getEjerciciosByRutina con:', asignacion.idrutina);
        const ejercicios = await rutinaService.getEjerciciosByRutina(asignacion.idrutina);
        console.log('✅ Ejercicios de rutina recibidos:', ejercicios?.length || 0);
        setEjerciciosRutina(Array.isArray(ejercicios) ? ejercicios : []);
      }

      // 4. OBTENER DÍAS
      console.log('📡 Llamando a rutinaService.getDias()');
      const diasData = await rutinaService.getDias();
      console.log('✅ Días recibidos:', diasData?.length || 0);
      setDias(Array.isArray(diasData) ? diasData : []);

      // 5. OBTENER CATÁLOGO DE EJERCICIOS
      console.log('📡 Llamando a ejercicioService.getAll()');
      const ejerciciosData = await ejercicioService.getAll();
      console.log('✅ Ejercicios catálogo recibidos:', ejerciciosData?.length || 0);
      setEjerciciosCatalogo(Array.isArray(ejerciciosData) ? ejerciciosData : []);

      // 6. OBTENER ENTRENAMIENTOS DEL CLIENTE
      console.log('📡 Llamando a entrenamientoService.getByUsuario con:', parseInt(id));
      const entrenamientosData = await entrenamientoService.getByUsuario(parseInt(id));
      console.log('✅ Entrenamientos recibidos:', entrenamientosData?.length || 0);
      const entrenosArray = Array.isArray(entrenamientosData) ? entrenamientosData : [];
      setEntrenamientos(entrenosArray);

      // 7. OBTENER EVOLUCIONES
      console.log('📡 Llamando a evolucionService.getByUsuario con:', parseInt(id));
      const evolucionesData = await evolucionService.getByUsuario(parseInt(id));
      console.log('✅ Evoluciones recibidas:', evolucionesData?.length || 0);
      const evolucionesArray = Array.isArray(evolucionesData) ? evolucionesData : [];
      setEvoluciones(evolucionesArray);

      // 8. CALCULAR ESTADÍSTICAS
      console.log('📊 Calculando estadísticas...');
      calcularEstadisticas(entrenosArray);
      calcularRacha(entrenosArray);

      // 9. ÚLTIMOS ENTRENAMIENTOS
      const recientes = [...entrenosArray]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 5);
      console.log('📊 Últimos 5 entrenamientos:', recientes.length);
      setEntrenamientosRecientes(recientes);

      // 10. ÚLTIMA EVOLUCIÓN
      if (evolucionesArray.length > 0) {
        console.log('📊 Procesando evolución...');
        const ultima = [...evolucionesArray]
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
        setUltimaEvolucion(ultima);
        
        const primera = [...evolucionesArray]
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
        setEstadisticasEvolucion({
          total: evolucionesArray.length,
          pesoInicial: primera.peso,
          pesoActual: ultima.peso,
          pesoCambio: ultima.peso - primera.peso,
          grasaInicial: primera.porcentajegrasa,
          grasaActual: ultima.porcentajegrasa,
          grasaCambio: ultima.porcentajegrasa - primera.porcentajegrasa
        });
        console.log('✅ Estadísticas de evolución calculadas');
      }

      console.log('✅ loadData completado exitosamente');

    } catch (err) {
      console.error('❌ ERROR al cargar datos:', err);
      console.error('❌ Detalle del error:', err.response?.data);
      console.error('❌ Status del error:', err.response?.status);
      console.error('❌ Mensaje del error:', err.message);
      setError(`Error al cargar los datos: ${err.response?.data?.error || err.message}`);
    } finally {
      console.log('🏁 loadData finalizado, loading=false');
      setLoading(false);
    }
  };

  const calcularEstadisticas = (entrenos) => {
    console.log('📊 calcularEstadisticas - Entrenos:', entrenos?.length || 0);
    const total = entrenos.length;
    const completados = entrenos.filter(e => e.completado === true).length;
    const pendientes = total - completados;

    // Mejor peso por ejercicio
    const ejerciciosPeso = {};
    entrenos.forEach(e => {
      if (e.peso > 0) {
        if (!ejerciciosPeso[e.idejercicio] || e.peso > ejerciciosPeso[e.idejercicio].peso) {
          ejerciciosPeso[e.idejercicio] = {
            idejercicio: e.idejercicio,
            peso: e.peso,
            fecha: e.fecha
          };
        }
      }
    });

    let mejorPeso = null;
    let mejorEjercicio = null;
    let maxPeso = 0;
    Object.values(ejerciciosPeso).forEach(ej => {
      if (ej.peso > maxPeso) {
        maxPeso = ej.peso;
        mejorPeso = ej;
        const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === ej.idejercicio);
        mejorEjercicio = ejercicio ? ejercicio.nombre : 'Ejercicio';
      }
    });

    console.log('📊 Estadísticas calculadas:', { total, completados, pendientes, mejorPeso, mejorEjercicio });

    setStats({
      totalEntrenamientos: total,
      completados,
      pendientes,
      mejorPeso,
      mejorEjercicio
    });
  };

  const calcularRacha = (entrenos) => {
    console.log('📊 calcularRacha - Entrenos:', entrenos?.length || 0);
    if (entrenos.length === 0) {
      setStats(prev => ({ ...prev, racha: 0 }));
      return;
    }
    
    const fechas = [...new Set(entrenos.map(e => e.fecha))].sort();
    let racha = 0;
    
    // Calcular días consecutivos desde hoy hacia atrás
    let fechaActual = new Date();
    let diasConsecutivos = 0;
    
    while (true) {
      const fechaStr = fechaActual.toISOString().split('T')[0];
      const tieneEntreno = entrenos.some(e => e.fecha === fechaStr && e.completado === true);
      
      if (tieneEntreno) {
        diasConsecutivos++;
        fechaActual.setDate(fechaActual.getDate() - 1);
      } else {
        break;
      }
    }
    
    console.log('📊 Racha calculada:', diasConsecutivos);
    setStats(prev => ({ ...prev, racha: diasConsecutivos }));
  };

  const getNombreEjercicio = (idEjercicio) => {
    const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === idEjercicio);
    return ejercicio ? ejercicio.nombre : 'Ejercicio desconocido';
  };

  const getNombreDia = (idDia) => {
    const dia = dias.find(d => d.iddia === idDia);
    return dia ? dia.nombre : 'Sin día';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProgresoEjercicio = (idEjercicio) => {
    const ejercicios = entrenamientos
      .filter(e => e.idejercicio === idEjercicio && e.peso > 0)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    return ejercicios;
  };

  const handleRegistrarEntreno = () => {
    if (usuarioData) {
      setShowRegistrarModal(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando datos del cliente...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertCircle className="w-12 h-12 text-red-400/50" />
        <p className="text-red-400 text-sm font-mono">{error}</p>
        <button
          onClick={() => navigate('/entrenador/clientes')}
          className="px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl text-sm font-bold hover:bg-orange-400"
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  if (!usuarioData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <AlertCircle className="w-12 h-12 text-yellow-400/50" />
        <p className="text-[#9A9AA0] text-sm font-mono">Cliente no encontrado</p>
        <button
          onClick={() => navigate('/entrenador/clientes')}
          className="px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl text-sm font-bold hover:bg-orange-400"
        >
          Volver a Clientes
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111625]/50 border border-orange-500/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/entrenador/clientes')}
            className="p-2 rounded-xl border border-orange-500/20 hover:border-orange-500/40 text-[#9A9AA0] hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-orange-400" />
              {usuarioData.nombre} {usuarioData.apellido}
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">
              @{usuarioData.usuario} • {usuarioData.correo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRegistrarEntreno}
            className="px-4 py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-bold hover:bg-green-500/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Registrar Entrenamiento
          </button>
          <span className={`text-xs font-mono px-3 py-1 rounded-full ${
            relacionEntrenador?.activo 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {relacionEntrenador?.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 1: INFORMACIÓN PERSONAL */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-2xl overflow-hidden flex-shrink-0">
              {usuarioData.fotoperfil ? (
                <img src={usuarioData.fotoperfil} alt={usuarioData.nombre} className="w-full h-full object-cover" />
              ) : (
                (usuarioData.nombre?.charAt(0) || 'C').toUpperCase()
              )}
            </div>
            <div>
              <p className="text-white font-bold">{usuarioData.nombre} {usuarioData.apellido}</p>
              <p className="text-[#9A9AA0] text-xs font-mono">@{usuarioData.usuario}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Contacto</p>
          <div className="space-y-1 mt-1">
            <p className="text-white text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-400" />
              {usuarioData.correo || 'Sin correo'}
            </p>
            <p className="text-white text-sm flex items-center gap-2">
              <Phone className="w-4 h-4 text-orange-400" />
              {usuarioData.telefono || 'Sin teléfono'}
            </p>
            <p className="text-white text-sm flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-orange-400" />
              Cédula: {usuarioData.cedula || 'No registrada'}
            </p>
          </div>
        </div>

        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Información</p>
          <div className="space-y-1 mt-1">
            <p className="text-white text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-orange-400" />
              Registro: {formatearFecha(usuarioData.fecharegistro)}
            </p>
            <p className="text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-400" />
              Entrenando desde: {formatearFecha(relacionEntrenador?.fechainicio)}
            </p>
            <p className="text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-400" />
              {relacionEntrenador?.activo ? 'Cliente activo' : 'Cliente inactivo'}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 2: ESTADÍSTICAS RÁPIDAS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-[#111625]/50 backdrop-blur-md border border-orange-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Total Entrenos</p>
          <p className="text-2xl font-bold text-white">{stats.totalEntrenamientos}</p>
        </div>
        <div className="bg-[#111625]/50 backdrop-blur-md border border-orange-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Completados</p>
          <p className="text-2xl font-bold text-green-400">{stats.completados}</p>
        </div>
        <div className="bg-[#111625]/50 backdrop-blur-md border border-orange-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Racha</p>
          <p className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
            <Flame className="w-5 h-5" />
            {stats.racha}
          </p>
        </div>
        <div className="bg-[#111625]/50 backdrop-blur-md border border-orange-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Último peso</p>
          <p className="text-2xl font-bold text-white flex items-center justify-center gap-1">
            <Weight className="w-5 h-5 text-orange-400" />
            {ultimaEvolucion?.peso || '-'}kg
          </p>
        </div>
        <div className="bg-[#111625]/50 backdrop-blur-md border border-orange-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Mejor peso</p>
          <p className="text-lg font-bold text-white truncate">
            {stats.mejorPeso ? `${stats.mejorPeso.peso}kg` : '-'}
          </p>
          <p className="text-[8px] text-[#9A9AA0] font-mono truncate">
            {stats.mejorEjercicio || ''}
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 3: RUTINA ACTUAL Y EVOLUCIÓN */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Rutina Actual */}
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-orange-400" />
              Rutina Actual
            </h3>
            <button
              onClick={() => setShowEjerciciosRutina(!showEjerciciosRutina)}
              className="text-orange-400 text-xs font-mono hover:underline flex items-center gap-1"
            >
              {showEjerciciosRutina ? 'Ocultar' : 'Ver ejercicios'}
              {showEjerciciosRutina ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {rutinaAsignada ? (
            <div>
              <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                <p className="text-white font-bold">{rutinaAsignada.rutina?.nombre || 'Rutina'}</p>
                <p className="text-[#9A9AA0] text-xs font-mono">
                  Asignada: {formatearFecha(rutinaAsignada.fechaasignacion)}
                </p>
                {rutinaAsignada.rutina?.descripcion && (
                  <p className="text-[#9A9AA0] text-xs mt-1">{rutinaAsignada.rutina.descripcion}</p>
                )}
              </div>

              {showEjerciciosRutina && ejerciciosRutina.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Ejercicios</p>
                  {ejerciciosRutina
                    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
                    .map((ej, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-[#0A0A0B]/50 border border-orange-500/5 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-[#9A9AA0] text-[10px] font-mono w-4">{index + 1}</span>
                          <div className="min-w-0">
                            <p className="text-white text-sm truncate">{getNombreEjercicio(ej.idejercicio)}</p>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-[#9A9AA0]">
                              <span>{ej.series} series</span>
                              <span>{ej.repeticiones} reps</span>
                              {ej.pesosugerido > 0 && <span>{ej.pesosugerido} kg</span>}
                              {ej.iddia && <span>• {getNombreDia(ej.iddia)}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-yellow-400/50 mx-auto mb-2" />
              <p className="text-[#9A9AA0] text-sm font-mono">Este cliente no tiene rutina asignada</p>
            </div>
          )}
        </div>

        {/* Evolución */}
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <h3 className="text-white text-sm font-bold flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            Evolución
          </h3>

          {estadisticasEvolucion ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl p-2 text-center">
                  <p className="text-[#9A9AA0] text-[8px] font-mono uppercase">Peso inicial</p>
                  <p className="text-white font-bold">{estadisticasEvolucion.pesoInicial}kg</p>
                </div>
                <div className="bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl p-2 text-center">
                  <p className="text-[#9A9AA0] text-[8px] font-mono uppercase">Peso actual</p>
                  <p className="text-white font-bold">{estadisticasEvolucion.pesoActual}kg</p>
                </div>
                <div className={`bg-[#0A0A0B]/50 border rounded-xl p-2 text-center ${
                  estadisticasEvolucion.pesoCambio > 0 ? 'border-green-500/20' : 
                  estadisticasEvolucion.pesoCambio < 0 ? 'border-red-500/20' : 'border-orange-500/20'
                }`}>
                  <p className="text-[#9A9AA0] text-[8px] font-mono uppercase">Cambio</p>
                  <p className={`font-bold ${
                    estadisticasEvolucion.pesoCambio > 0 ? 'text-green-400' : 
                    estadisticasEvolucion.pesoCambio < 0 ? 'text-red-400' : 'text-orange-400'
                  }`}>
                    {estadisticasEvolucion.pesoCambio > 0 ? '+' : ''}{estadisticasEvolucion.pesoCambio}kg
                  </p>
                </div>
                <div className="bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl p-2 text-center">
                  <p className="text-[#9A9AA0] text-[8px] font-mono uppercase">Registros</p>
                  <p className="text-white font-bold">{estadisticasEvolucion.total}</p>
                </div>
              </div>

              {ultimaEvolucion && (
                <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-2">
                  <p className="text-[#9A9AA0] text-[8px] font-mono uppercase">Última medición</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-white font-bold flex items-center gap-1">
                      <Weight className="w-4 h-4 text-orange-400" />
                      {ultimaEvolucion.peso}kg
                    </span>
                    {ultimaEvolucion.porcentajegrasa && (
                      <span className="text-white font-bold flex items-center gap-1">
                        <Target className="w-4 h-4 text-orange-400" />
                        {ultimaEvolucion.porcentajegrasa}% grasa
                      </span>
                    )}
                    <span className="text-[#9A9AA0] text-xs font-mono">
                      {formatearFecha(ultimaEvolucion.fecha)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 text-yellow-400/50 mx-auto mb-2" />
              <p className="text-[#9A9AA0] text-sm font-mono">No hay registros de evolución</p>
            </div>
          )}

          <button
            onClick={() => navigate('/entrenador/evolucion')}
            className="w-full mt-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-xs font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver evolución completa
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 4: ENTRENAMIENTOS RECIENTES */}
      {/* ============================================================ */}
      <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            Últimos Entrenamientos
          </h3>
          <button
            onClick={() => navigate('/entrenador/entrenamientos')}
            className="text-orange-400 text-xs font-mono hover:underline"
          >
            Ver todos
          </button>
        </div>

        {entrenamientosRecientes.length > 0 ? (
          <div className="space-y-2">
            {entrenamientosRecientes.map((entreno) => (
              <div key={entreno.identrenamiento} className="flex items-center justify-between p-2 bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <Dumbbell className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {getNombreEjercicio(entreno.idejercicio)}
                    </p>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-[#9A9AA0]">
                      <span>{entreno.peso} kg</span>
                      <span>{entreno.repeticiones} reps</span>
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatearFecha(entreno.fecha)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono flex items-center gap-0.5 ${
                  entreno.completado ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {entreno.completado ? (
                    <><CheckCircle className="w-3 h-3" /> Completado</>
                  ) : (
                    <><XCircle className="w-3 h-3" /> Pendiente</>
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#9A9AA0] text-sm font-mono text-center py-4">
            No hay entrenamientos registrados aún
          </p>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECCIÓN 5: ACCIONES RÁPIDAS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={handleRegistrarEntreno}
          className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 hover:bg-green-500/20 transition-colors flex flex-col items-center gap-1"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-mono">Registrar Entreno</span>
        </button>
        <button
          onClick={() => navigate('/entrenador/rutinas')}
          className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 hover:bg-blue-500/20 transition-colors flex flex-col items-center gap-1"
        >
          <Dumbbell className="w-5 h-5" />
          <span className="text-[10px] font-mono">Ver Rutinas</span>
        </button>
        <button
          onClick={() => navigate('/entrenador/evolucion')}
          className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-colors flex flex-col items-center gap-1"
        >
          <TrendingUp className="w-5 h-5" />
          <span className="text-[10px] font-mono">Evolución</span>
        </button>
        <button
          onClick={() => navigate('/entrenador/clientes')}
          className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400 hover:bg-orange-500/20 transition-colors flex flex-col items-center gap-1"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[10px] font-mono">Volver</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* MODAL REGISTRAR ENTRENAMIENTO */}
      {/* ============================================================ */}
      {showRegistrarModal && usuarioData && (
        <RegistrarEntrenamientoModal
          cliente={{
            identrenado: usuarioData.idusuario,
            nombre: usuarioData.nombre,
            apellido: usuarioData.apellido,
            correo: usuarioData.correo
          }}
          onClose={() => setShowRegistrarModal(false)}
          onRegistrado={() => {
            const currentUser = authService.getCurrentUser();
            loadData(currentUser.idusuario);
          }}
        />
      )}
    </div>
  );
};

export default DetalleClienteEntrenador;