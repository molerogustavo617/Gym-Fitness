// src/pages/entrenador/DashboardEntrenador.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Dumbbell,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  ArrowRight,
  Award,
  Flame,
  Target,
  Eye,
  CheckCircle,
  Clock as ClockIcon,
  Circle,
  CircleDot,
  User,
  BarChart,
  Zap,
  Trophy,
  PlusCircle
} from 'lucide-react';
import authService from '../../services/authService';
import userService from '../../services/userService';
import entrenadosService from '../../services/entrenadosService';
import entrenamientoService from '../../services/entrenamientoService';
import evolucionService from '../../services/evolucionService';
import rutinaService from '../../services/rutinaService';
import RegistrarEntrenamientoModal from './components/RegistrarEntrenamientoModal';

const DashboardEntrenador = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [evoluciones, setEvoluciones] = useState([]);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [clienteParaRegistrar, setClienteParaRegistrar] = useState(null);
  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesActivos: 0,
    clientesInactivos: 0,
    totalEntrenamientos: 0,
    entrenamientosHoy: 0,
    totalRutinas: 0
  });
  const [clientesRecientes, setClientesRecientes] = useState([]);
  const [entrenamientosRecientes, setEntrenamientosRecientes] = useState([]);
  const navigate = useNavigate();

  // Imágenes de fondo motivacionales
  const imagenesFondo = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80'
  ];
  const imagenFondo = imagenesFondo[Math.floor(Math.random() * imagenesFondo.length)];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 4) {
      navigate('/dashboard');
      return;
    }
    setUser(currentUser);
    loadDashboardData(currentUser.idusuario);
  }, [navigate]);

  const loadDashboardData = async (userId) => {
    setLoading(true);
    try {
      const clientesData = await entrenadosService.getByEntrenador(userId);
      const clientesArray = Array.isArray(clientesData) ? clientesData : [];
      setClientes(clientesArray);

      const usuariosData = await userService.getAll();
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];

      const allEntrenamientos = [];
      if (clientesArray.length > 0) {
        for (const cliente of clientesArray) {
          try {
            const entrenos = await entrenamientoService.getByUsuario(cliente.identrenado);
            if (entrenos && Array.isArray(entrenos) && entrenos.length > 0) {
              allEntrenamientos.push(...entrenos);
            }
          } catch (e) {
            console.log('Error al obtener entrenamientos del cliente:', e);
          }
        }
      }
      setEntrenamientos(allEntrenamientos);

      const totalClientes = clientesArray.length;
      const clientesActivos = clientesArray.filter(c => c.activo === true).length;
      const clientesInactivos = clientesArray.filter(c => c.activo === false).length;

      const hoy = new Date().toISOString().split('T')[0];
      const entrenamientosHoy = allEntrenamientos.filter(e => e.fecha?.split('T')[0] === hoy).length;

      let totalRutinas = 0;
      if (clientesArray.length > 0) {
        try {
          const asignaciones = await rutinaService.getAsignaciones();
          const asignacionesArray = Array.isArray(asignaciones) ? asignaciones : [];
          if (asignacionesArray.length > 0) {
            for (const cliente of clientesArray) {
              const asignacion = asignacionesArray.find(a => a.idusuario === cliente.identrenado && a.activo === true);
              if (asignacion) totalRutinas++;
            }
          }
        } catch (e) {
          console.log('Error al obtener rutinas:', e);
        }
      }

      setStats({
        totalClientes,
        clientesActivos,
        clientesInactivos,
        totalEntrenamientos: allEntrenamientos.length,
        entrenamientosHoy,
        totalRutinas
      });

      const recientes = clientesArray.slice(0, 3).map(c => {
        const usuario = usuariosArray.find(u => u.idusuario === c.identrenado);
        return {
          ...c,
          nombre: usuario?.nombre || 'Cliente',
          apellido: usuario?.apellido || '',
          fotoPerfil: usuario?.fotoperfil || null,
          correo: usuario?.correo || '',
          telefono: usuario?.telefono || '',
          usuarioCompleto: usuario
        };
      });
      setClientesRecientes(recientes);

      const recientesEntrenos = allEntrenamientos
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 3)
        .map(e => {
          const usuario = usuariosArray.find(u => u.idusuario === e.idusuario);
          return {
            ...e,
            clienteNombre: usuario?.nombre || 'Cliente',
            clienteApellido: usuario?.apellido || ''
          };
        });
      setEntrenamientosRecientes(recientesEntrenos);

    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
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

  const handleRegistrarEntreno = (cliente) => {
    setClienteParaRegistrar(cliente);
    setShowRegistrarModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando tu espacio...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      
      {/* Header - Con imagen de fondo */}
      <div className="relative overflow-hidden rounded-2xl p-6 min-h-[180px] flex items-end">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{ backgroundImage: `url(${imagenFondo})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent" />
        
        <div className="relative z-10 w-full">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-orange-500/30 text-orange-400 text-[10px] font-mono uppercase tracking-wider px-3 py-0.5 rounded-full border border-orange-500/20">
                  Entrenador
                </span>
                <span className="text-[#9A9AA0] text-[10px] font-mono">
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight">
                Hola, {user?.nombre || 'Entrenador'}
              </h1>
              <p className="text-orange-400 text-sm font-mono font-bold tracking-wider mt-0.5">
                ¡A darle duro hoy!
              </p>
            </div>
            <button 
              onClick={() => navigate('/entrenador/clientes')}
              className="px-4 py-2 bg-orange-500 text-[#0A0A0B] text-xs font-bold uppercase rounded-xl hover:bg-orange-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,107,53,0.2)]"
            >
              Ver Clientes <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-[#111625]/50 backdrop-blur-md border border-orange-500/10 rounded-2xl p-4 hover:border-orange-500/30 transition-all">
          <div className="flex items-center gap-2 text-orange-400 text-xs">
            <Users className="w-4 h-4" /> Clientes
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalClientes}</div>
          <div className="flex gap-2 mt-1 text-[10px]">
            <span className="text-green-400 flex items-center gap-0.5">
              <CircleDot className="w-2.5 h-2.5" />
              {stats.clientesActivos} activos
            </span>
            <span className="text-red-400 flex items-center gap-0.5">
              <Circle className="w-2.5 h-2.5" />
              {stats.clientesInactivos} inactivos
            </span>
          </div>
        </div>

        <div className="bg-[#111625]/50 backdrop-blur-md border border-orange-500/10 rounded-2xl p-4 hover:border-orange-500/30 transition-all">
          <div className="flex items-center gap-2 text-orange-400 text-xs">
            <Dumbbell className="w-4 h-4" /> Entrenos
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalEntrenamientos}</div>
          <div className="text-[10px] text-orange-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Hoy: {stats.entrenamientosHoy}
          </div>
        </div>

        <div className="bg-[#111625]/50 backdrop-blur-md border border-orange-500/10 rounded-2xl p-4 hover:border-orange-500/30 transition-all">
          <div className="flex items-center gap-2 text-orange-400 text-xs">
            <TrendingUp className="w-4 h-4" /> Rutinas
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalRutinas}</div>
          <div className="text-[10px] text-orange-400 mt-1">asignadas</div>
        </div>

        <div className="bg-[#111625]/50 backdrop-blur-md border border-orange-500/10 rounded-2xl p-4 hover:border-orange-500/30 transition-all">
          <div className="flex items-center gap-2 text-orange-400 text-xs">
            <Trophy className="w-4 h-4" /> Logros
          </div>
          <div className="text-2xl font-bold text-white">
            {stats.totalClientes > 5 ? (
              <Trophy className="w-8 h-8 text-yellow-400" />
            ) : (
              <Target className="w-8 h-8 text-orange-400" />
            )}
          </div>
          <div className="text-[10px] text-orange-400 mt-1">{stats.totalClientes} clientes</div>
        </div>

        <div className="bg-[#111625]/50 backdrop-blur-md border border-orange-500/10 rounded-2xl p-4 hover:border-orange-500/30 transition-all">
          <div className="flex items-center gap-2 text-orange-400 text-xs">
            <Zap className="w-4 h-4" /> Racha
          </div>
          <div className="text-2xl font-bold text-white">
            <Flame className="w-8 h-8 text-orange-400" />
          </div>
          <div className="text-[10px] text-orange-400 mt-1">¡Sigue así!</div>
        </div>
      </div>

      {/* Sección de clientes y actividad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Clientes recientes */}
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-400" />
              Clientes Recientes
            </h3>
            <button 
              onClick={() => navigate('/entrenador/clientes')}
              className="text-orange-400 text-xs font-mono hover:underline"
            >
              Ver todos
            </button>
          </div>

          {clientesRecientes.length > 0 ? (
            <div className="space-y-2">
              {clientesRecientes.map((cliente) => (
                <div key={cliente.identrenados} className="flex items-center justify-between p-2 rounded-xl bg-[#0A0A0B]/50 border border-orange-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs overflow-hidden">
                      {cliente.fotoPerfil ? (
                        <img src={cliente.fotoPerfil} alt={cliente.nombre} className="w-full h-full object-cover" />
                      ) : (
                        (cliente.nombre?.charAt(0) || 'C').toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{cliente.nombre} {cliente.apellido}</p>
                      <p className="text-[#9A9AA0] text-[10px] font-mono flex items-center gap-1">
                        {cliente.activo ? (
                          <>
                            <CircleDot className="w-2.5 h-2.5 text-green-400" />
                            <span className="text-green-400">Activo</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-2.5 h-2.5 text-red-400" />
                            <span className="text-red-400">Inactivo</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleRegistrarEntreno({
                        ...cliente,
                        nombre: cliente.nombre,
                        apellido: cliente.apellido,
                        correo: cliente.correo
                      })}
                      className="p-1.5 rounded-lg hover:bg-green-500/10 text-[#9A9AA0] hover:text-green-400 transition-colors"
                      title="Registrar entrenamiento"
                    >
                      <PlusCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/entrenador/clientes/${cliente.identrenado}`)}
                      className="p-1.5 rounded-lg hover:bg-orange-500/10 text-orange-400 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#9A9AA0] text-sm font-mono text-center py-4">
              No tienes clientes asignados aún
            </p>
          )}
        </div>

        {/* Entrenamientos recientes */}
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Entrenamientos Recientes
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
                <div key={entreno.identrenamiento} className="flex items-center justify-between p-2 rounded-xl bg-[#0A0A0B]/50 border border-orange-500/5">
                  <div className="flex items-center gap-3 min-w-0">
                    <Dumbbell className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {entreno.clienteNombre} {entreno.clienteApellido}
                      </p>
                      <p className="text-[#9A9AA0] text-[10px] font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatearFecha(entreno.fecha)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono flex items-center gap-0.5 ${
                    entreno.completado ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {entreno.completado ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Completado
                      </>
                    ) : (
                      <>
                        <ClockIcon className="w-3 h-3" />
                        Pendiente
                      </>
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
      </div>

      {/* Acceso rápido */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => navigate('/entrenador/clientes')}
          className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 border border-orange-500/20 hover:border-orange-500/50 transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5 text-orange-400" />
          </div>
          <span className="block text-[9px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">Clientes</span>
        </button>
        <button
          onClick={() => navigate('/entrenador/rutinas')}
          className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/50 transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
            <Dumbbell className="w-5 h-5 text-blue-400" />
          </div>
          <span className="block text-[9px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">Rutinas</span>
        </button>
        <button
          onClick={() => navigate('/entrenador/evolucion')}
          className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/50 transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 text-green-400" />
          </div>
          <span className="block text-[9px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">Evolución</span>
        </button>
        <button
          onClick={() => navigate('/entrenador/entrenamientos')}
          className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/50 transition-all group text-center"
        >
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
            <Activity className="w-5 h-5 text-purple-400" />
          </div>
          <span className="block text-[9px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">Entrenos</span>
        </button>
      </div>

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
            const currentUser = authService.getCurrentUser();
            loadDashboardData(currentUser.idusuario);
          }}
        />
      )}
    </div>
  );
};

export default DashboardEntrenador;