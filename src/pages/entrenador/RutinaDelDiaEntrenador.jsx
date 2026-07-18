// src/pages/entrenador/RutinaDelDiaEntrenador.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Dumbbell,
  Users,
  ArrowLeft,
  Eye,
  PlusCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  User as UserIcon,
  List,
  Repeat,
  Hash,
  Weight,
  Timer,
  CircleDot,
  Circle
} from 'lucide-react';
import authService from '../../services/authService';
import userService from '../../services/userService';
import entrenadosService from '../../services/entrenadosService';
import rutinaService from '../../services/rutinaService';
import ejercicioService from '../../services/ejercicioService';
import entrenamientoService from '../../services/entrenamientoService';
import diasService from '../../services/diasService';
import RegistrarEntrenamientoModal from './components/RegistrarEntrenamientoModal';

const RutinaDelDiaEntrenador = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Datos principales
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [rutinasAsignadas, setRutinasAsignadas] = useState([]);
  const [ejerciciosRutina, setEjerciciosRutina] = useState({});
  const [ejerciciosCatalogo, setEjerciciosCatalogo] = useState([]);
  const [dias, setDias] = useState([]);
  const [entrenamientosHoy, setEntrenamientosHoy] = useState({});

  // Modal
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [clienteParaRegistrar, setClienteParaRegistrar] = useState(null);

  // Día actual
  const [diaActual, setDiaActual] = useState(null);
  const [fechaHoy, setFechaHoy] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 4) {
      navigate('/dashboard');
      return;
    }
    setUser(currentUser);
    
    // Calcular día actual
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diaMap = { 0: 7, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
    setDiaActual(diaMap[diaSemana]);
    setFechaHoy(hoy.toISOString().split('T')[0]);
    
    loadData(currentUser.idusuario);
  }, [navigate]);

  const loadData = async (userId) => {
    setLoading(true);
    setError('');
    try {
      // 1. Obtener clientes asignados
      const clientesData = await entrenadosService.getByEntrenador(userId);
      const clientesArray = Array.isArray(clientesData) ? clientesData : [];
      setClientes(clientesArray);

      // 2. Obtener usuarios
      const usuariosData = await userService.getAll();
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);

      // 3. Obtener días
      const diasData = await diasService.getAll();
      setDias(Array.isArray(diasData) ? diasData : []);

      // 4. Obtener catálogo de ejercicios
      const ejerciciosData = await ejercicioService.getAll();
      setEjerciciosCatalogo(Array.isArray(ejerciciosData) ? ejerciciosData : []);

      // 5. Obtener rutinas asignadas de los clientes
      const asignaciones = await rutinaService.getAsignaciones();
      const asignacionesArray = Array.isArray(asignaciones) ? asignaciones : [];
      setRutinasAsignadas(asignacionesArray);

      // 6. Para cada cliente, obtener ejercicios de su rutina
      const ejerciciosMap = {};
      for (const cliente of clientesArray) {
        const asignacion = asignacionesArray.find(a => 
          a.idusuario === cliente.identrenado && a.activo === true
        );
        if (asignacion) {
          try {
            const ejercicios = await rutinaService.getEjerciciosByRutina(asignacion.idrutina);
            ejerciciosMap[cliente.identrenado] = Array.isArray(ejercicios) ? ejercicios : [];
          } catch (e) {
            ejerciciosMap[cliente.identrenado] = [];
          }
        } else {
          ejerciciosMap[cliente.identrenado] = [];
        }
      }
      setEjerciciosRutina(ejerciciosMap);

      // 7. Verificar si ya entrenaron hoy
      const hoy = new Date().toISOString().split('T')[0];
      const entrenosMap = {};
      for (const cliente of clientesArray) {
        try {
          const entrenos = await entrenamientoService.getByUsuario(cliente.identrenado);
          const entrenosArray = Array.isArray(entrenos) ? entrenos : [];
          const entrenoHoy = entrenosArray.some(e => e.fecha === hoy && e.completado === true);
          entrenosMap[cliente.identrenado] = entrenoHoy;
        } catch (e) {
          entrenosMap[cliente.identrenado] = false;
        }
      }
      setEntrenamientosHoy(entrenosMap);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar la rutina del día');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData(user.idusuario);
    setRefreshing(false);
  };

  const getUserData = (id) => {
    return usuarios.find(u => u.idusuario === id);
  };

  const getNombreCompleto = (id) => {
    const user = getUserData(id);
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido';
  };

  const getNombreDia = (idDia) => {
    const dia = dias.find(d => d.iddia === idDia);
    return dia ? dia.nombre : 'Sin día';
  };

  const getNombreEjercicio = (idEjercicio) => {
    const ejercicio = ejerciciosCatalogo.find(e => e.idejercicio === idEjercicio);
    return ejercicio ? ejercicio.nombre : 'Ejercicio desconocido';
  };

  const getEjerciciosDelDia = (idCliente) => {
    const ejercicios = ejerciciosRutina[idCliente] || [];
    return ejercicios
      .filter(ej => ej.iddia === diaActual)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));
  };

  const tieneRutinaHoy = (idCliente) => {
    const ejercicios = getEjerciciosDelDia(idCliente);
    return ejercicios.length > 0;
  };

  const yaEntrenoHoy = (idCliente) => {
    return entrenamientosHoy[idCliente] || false;
  };

  const handleRegistrarEntreno = (cliente) => {
    const userData = getUserData(cliente.identrenado);
    setClienteParaRegistrar({
      ...cliente,
      nombre: userData?.nombre || 'Cliente',
      apellido: userData?.apellido || '',
      correo: userData?.correo || ''
    });
    setShowRegistrarModal(true);
  };

  // Filtrar solo clientes activos
  const clientesActivos = clientes.filter(c => c.activo === true);

  // Ordenar: primero los pendientes, luego los completados
  const clientesOrdenados = [...clientesActivos].sort((a, b) => {
    const aEntreno = yaEntrenoHoy(a.identrenado);
    const bEntreno = yaEntrenoHoy(b.identrenado);
    if (aEntreno === bEntreno) return 0;
    return aEntreno ? 1 : -1;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando rutina del día...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111625]/50 border border-orange-500/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/entrenador/dashboard')}
            className="p-2 rounded-xl border border-orange-500/20 hover:border-orange-500/40 text-[#9A9AA0] hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-orange-400" />
              Rutina del Día
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
              {diaActual && ` • ${getNombreDia(diaActual)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#9A9AA0] font-mono">
            {clientesActivos.length} clientes activos
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1"
          >
            {refreshing ? (
              <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Actualizar'
            )}
          </button>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CONTADOR RÁPIDO */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111625]/50 border border-orange-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Clientes Activos</p>
          <p className="text-2xl font-bold text-white">{clientesActivos.length}</p>
        </div>
        <div className="bg-[#111625]/50 border border-orange-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Pendientes Hoy</p>
          <p className="text-2xl font-bold text-yellow-400">
            {clientesActivos.filter(c => !yaEntrenoHoy(c.identrenado) && tieneRutinaHoy(c.identrenado)).length}
          </p>
        </div>
        <div className="bg-[#111625]/50 border border-orange-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Completados Hoy</p>
          <p className="text-2xl font-bold text-green-400">
            {clientesActivos.filter(c => yaEntrenoHoy(c.identrenado)).length}
          </p>
        </div>
      </div>

      {/* LISTA DE CLIENTES */}
      {clientesOrdenados.length === 0 ? (
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-8 text-center">
          <Users className="w-12 h-12 text-[#9A9AA0]/20 mx-auto mb-3" />
          <p className="text-[#9A9AA0] text-sm font-mono">No tienes clientes activos</p>
          <button
            onClick={() => navigate('/entrenador/clientes')}
            className="mt-3 text-orange-400 text-sm hover:underline"
          >
            Ver mis clientes
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {clientesOrdenados.map((cliente) => {
            const user = getUserData(cliente.identrenado);
            const ejercicios = getEjerciciosDelDia(cliente.identrenado);
            const tieneRutina = ejercicios.length > 0;
            const entrenoHoy = yaEntrenoHoy(cliente.identrenado);
            const tieneEjerciciosHoy = tieneRutina;

            return (
              <div
                key={cliente.identrenados}
                className={`bg-[#111625]/30 border rounded-2xl p-4 transition-all ${
                  entrenoHoy 
                    ? 'border-green-500/20 bg-green-500/5' 
                    : tieneEjerciciosHoy 
                      ? 'border-orange-500/10 hover:border-orange-500/30' 
                      : 'border-[#5C5C60]/20 opacity-60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Info del cliente */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm overflow-hidden flex-shrink-0">
                      {user?.fotoperfil ? (
                        <img src={user.fotoperfil} alt={user.nombre} className="w-full h-full object-cover" />
                      ) : (
                        (user?.nombre?.charAt(0) || 'C').toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium truncate">
                          {getNombreCompleto(cliente.identrenado)}
                        </p>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                          entrenoHoy 
                            ? 'bg-green-500/10 text-green-400' 
                            : tieneEjerciciosHoy 
                              ? 'bg-yellow-500/10 text-yellow-400' 
                              : 'bg-[#5C5C60]/20 text-[#9A9AA0]'
                        }`}>
                          {entrenoHoy ? (
                            <><CheckCircle className="w-2.5 h-2.5" /> Completado</>
                          ) : tieneEjerciciosHoy ? (
                            <><Clock className="w-2.5 h-2.5" /> Pendiente</>
                          ) : (
                            <><AlertCircle className="w-2.5 h-2.5" /> Sin rutina</>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#9A9AA0]">
                        <span>{getNombreDia(diaActual)}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-[#5C5C60]"></span>
                        <span>{tieneEjerciciosHoy ? `${ejercicios.length} ejercicios` : 'Sin ejercicios hoy'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ejercicios resumidos */}
                  <div className="flex-1 min-w-0">
                    {tieneEjerciciosHoy ? (
                      <div className="flex flex-wrap gap-1">
                        {ejercicios.slice(0, 3).map((ej, index) => (
                          <span key={index} className="text-[10px] bg-[#0A0A0B]/50 px-2 py-0.5 rounded-full text-[#9A9AA0] truncate max-w-[120px]">
                            {getNombreEjercicio(ej.idejercicio)}
                          </span>
                        ))}
                        {ejercicios.length > 3 && (
                          <span className="text-[10px] bg-[#0A0A0B]/50 px-2 py-0.5 rounded-full text-[#9A9AA0]">
                            +{ejercicios.length - 3} más
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-[#9A9AA0] text-xs font-mono">Sin ejercicios para hoy</p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleRegistrarEntreno(cliente)}
                      disabled={!tieneEjerciciosHoy || entrenoHoy}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                        !tieneEjerciciosHoy || entrenoHoy
                          ? 'bg-[#0A0A0B]/50 text-[#9A9AA0]/50 cursor-not-allowed'
                          : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                      }`}
                      title={entrenoHoy ? 'Ya entrenó hoy' : !tieneEjerciciosHoy ? 'Sin ejercicios para hoy' : 'Registrar entrenamiento'}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Registrar
                    </button>
                    <button
                      onClick={() => navigate(`/entrenador/clientes/${cliente.identrenado}`)}
                      className="p-1.5 rounded-lg hover:bg-blue-500/10 text-[#9A9AA0] hover:text-blue-400 transition-colors"
                      title="Ver detalle"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Ejercicios detallados (solo si tiene) */}
                {tieneEjerciciosHoy && (
                  <div className="mt-3 pt-3 border-t border-orange-500/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                      {ejercicios.map((ej, index) => (
                        <div key={index} className="flex items-center gap-2 p-1.5 bg-[#0A0A0B]/30 rounded-lg">
                          <span className="text-[#9A9AA0] text-[9px] font-mono w-4">{index + 1}</span>
                          <span className="text-white text-xs truncate flex-1">
                            {getNombreEjercicio(ej.idejercicio)}
                          </span>
                          <div className="flex items-center gap-1 text-[9px] font-mono text-[#9A9AA0] flex-shrink-0">
                            <Hash className="w-2.5 h-2.5" />
                            {ej.series}
                            <Repeat className="w-2.5 h-2.5 ml-1" />
                            {ej.repeticiones}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL REGISTRAR ENTRENAMIENTO */}
      {/* ============================================================ */}
      {showRegistrarModal && clienteParaRegistrar && (
        <RegistrarEntrenamientoModal
          cliente={clienteParaRegistrar}
          onClose={() => {
            setShowRegistrarModal(false);
            setClienteParaRegistrar(null);
          }}
          onRegistrado={() => {
            loadData(user.idusuario);
          }}
        />
      )}
    </div>
  );
};

export default RutinaDelDiaEntrenador;