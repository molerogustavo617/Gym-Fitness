// src/pages/recepcionista/DashboardRecepcionista.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  DoorOpen,
  DoorClosed,
  Activity,
  QrCode,
  Calendar,
  Clock,
  User,
  TrendingUp,
  UserCheck,
  Sparkles,
  Zap,
  Shield,
  BarChart,
  ArrowRight,
  ChevronRight,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import authService from '../../services/authService';
import accesoService from '../../services/accesoService';
import userService from '../../services/userService';

const DashboardRecepcionista = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    dentroAhora: 0,
    accesosHoy: 0,
    totalClientes: 0
  });
  const [accesosRecientes, setAccesosRecientes] = useState([]);
  const [clientesDentro, setClientesDentro] = useState([]);
  const navigate = useNavigate();

  const frases = [
    "Bienvenido al gimnasio",
    "Hoy es un gran día para entrenar",
    "Cada cliente cuenta",
    "El éxito comienza con un paso",
    "A darle duro"
  ];

  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 2) {
      navigate('/dashboard');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usuarios, accesos] = await Promise.all([
        userService.getAll(),
        accesoService.getAll()
      ]);

      const clientes = usuarios.filter(u => u.idrol === 3);
      const hoy = new Date().toISOString().split('T')[0];
      const accesosHoy = accesos.filter(a => a.fechaentrada?.split('T')[0] === hoy);
      const dentroAhora = accesos.filter(a => !a.fechasalida);

      const dentroIds = dentroAhora.map(a => a.idusuario);
      const clientesDentroList = clientes.filter(c => dentroIds.includes(c.idusuario));

      setStats({
        dentroAhora: dentroAhora.length,
        accesosHoy: accesosHoy.length,
        totalClientes: clientes.length
      });

      setClientesDentro(clientesDentroList);

      const recientes = accesos.slice(0, 5).map(a => {
        const usuario = usuarios.find(u => u.idusuario === a.idusuario);
        return {
          ...a,
          nombre: usuario?.nombre || 'Usuario',
          apellido: usuario?.apellido || '',
          foto: usuario?.fotoperfil || null
        };
      });
      setAccesosRecientes(recientes);

    } catch (err) {
      console.error('Error al cargar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatearHora = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00F2FE]/20 border-t-[#00F2FE] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#9A9AA0] font-mono text-sm animate-pulse">Cargando tu espacio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-20">
      
      {/* ============================================================ */}
      {/* HEADER HERO */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[#00F2FE]/15 via-[#111625] to-[#0A0A0B] border border-[#00F2FE]/20">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#00F2FE]/5 blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#00F2FE]/5 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#00F2FE]/10 border-2 border-[#00F2FE]/30 flex items-center justify-center text-2xl font-bold text-[#00F2FE] overflow-hidden flex-shrink-0">
              {user?.fotoperfil ? (
                <img src={user.fotoperfil} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                user?.nombre?.charAt(0) || 'R'
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Hola, {user?.nombre || 'Recepcionista'}
              </h1>
              <p className="text-[#00F2FE] text-sm font-mono font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-[#9A9AA0] text-xs font-mono mt-0.5 italic">
                {fraseAleatoria}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/recepcion/qr')}
            className="px-5 py-2.5 bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 rounded-xl text-sm font-medium hover:bg-[#00F2FE]/20 transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(0,242,254,0.05)] hover:shadow-[0_0_40px_rgba(0,242,254,0.15)] group"
          >
            <QrCode className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Validar QR
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TARJETAS DE ESTADÍSTICAS */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#111625]/80 backdrop-blur-sm border border-[#00F2FE]/10 rounded-2xl p-4 hover:border-[#00F2FE]/30 transition-all group">
          <div className="flex items-center gap-2 text-[#00F2FE] text-xs">
            <DoorOpen className="w-4 h-4" />
            <span className="font-mono uppercase tracking-wider">Dentro ahora</span>
          </div>
          <div className="text-3xl font-black text-white mt-1">{stats.dentroAhora}</div>
          <div className="text-[10px] text-[#9A9AA0] mt-0.5">clientes en el gimnasio</div>
          <div className="mt-2 h-0.5 w-full bg-[#00F2FE]/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00F2FE] to-[#00F2FE]/50 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((stats.dentroAhora / 20) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-[#111625]/80 backdrop-blur-sm border border-[#00F2FE]/10 rounded-2xl p-4 hover:border-[#00F2FE]/30 transition-all group">
          <div className="flex items-center gap-2 text-[#00F2FE] text-xs">
            <Activity className="w-4 h-4" />
            <span className="font-mono uppercase tracking-wider">Accesos hoy</span>
          </div>
          <div className="text-3xl font-black text-white mt-1">{stats.accesosHoy}</div>
          <div className="text-[10px] text-[#9A9AA0] mt-0.5">entradas registradas</div>
          <div className="mt-2 h-0.5 w-full bg-[#00F2FE]/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00F2FE] to-[#00F2FE]/50 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((stats.accesosHoy / 30) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-[#111625]/80 backdrop-blur-sm border border-[#00F2FE]/10 rounded-2xl p-4 hover:border-[#00F2FE]/30 transition-all group">
          <div className="flex items-center gap-2 text-[#00F2FE] text-xs">
            <Users className="w-4 h-4" />
            <span className="font-mono uppercase tracking-wider">Clientes</span>
          </div>
          <div className="text-3xl font-black text-white mt-1">{stats.totalClientes}</div>
          <div className="text-[10px] text-[#9A9AA0] mt-0.5">registrados en total</div>
          <div className="mt-2 h-0.5 w-full bg-[#00F2FE]/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#00F2FE] to-[#00F2FE]/50 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((stats.totalClientes / 100) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#00F2FE]/5 to-transparent border border-[#00F2FE]/10 rounded-2xl p-4 hover:border-[#00F2FE]/30 transition-all group">
          <div className="flex items-center gap-2 text-[#00F2FE] text-xs">
            <TrendingUp className="w-4 h-4" />
            <span className="font-mono uppercase tracking-wider">Hoy</span>
          </div>
          <div className="text-3xl font-black text-white mt-1 flex items-end gap-1">
            {stats.accesosHoy > 0 ? (
              <>
                <span>{stats.accesosHoy}</span>
                <span className="text-[10px] text-green-400 font-mono">↑ activo</span>
              </>
            ) : (
              <span className="text-[#5C5C60]">0</span>
            )}
          </div>
          <div className="text-[10px] text-[#9A9AA0] mt-0.5">movimiento del día</div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CLIENTES DENTRO AHORA */}
      {/* ============================================================ */}
      {clientesDentro.length > 0 && (
        <div className="bg-[#111625]/50 border border-[#00F2FE]/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <DoorOpen className="w-4 h-4 text-green-400" />
              <h3 className="text-white text-sm font-bold">Clientes dentro ahora</h3>
              <span className="bg-green-500/20 text-green-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-green-500/20">
                {clientesDentro.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/recepcion/accesos')}
              className="text-[#9A9AA0] text-xs font-mono hover:text-[#00F2FE] transition-colors flex items-center gap-0.5"
            >
              Ver todos <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {clientesDentro.slice(0, 10).map((cliente, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 px-3 py-1.5 bg-[#0A0A0B]/60 border border-green-500/10 rounded-full hover:border-green-500/30 transition-all group"
              >
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-[10px] overflow-hidden flex-shrink-0">
                  {cliente.fotoperfil ? (
                    <img src={cliente.fotoperfil} alt={cliente.nombre} className="w-full h-full object-cover" />
                  ) : (
                    cliente.nombre?.charAt(0) || 'C'
                  )}
                </div>
                <span className="text-white text-xs font-medium group-hover:text-[#00F2FE] transition-colors truncate max-w-[80px]">
                  {cliente.nombre}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400/50 animate-pulse"></span>
              </div>
            ))}
            {clientesDentro.length > 10 && (
              <span className="text-[#9A9AA0] text-xs font-mono px-3 py-1.5 bg-[#0A0A0B]/50 rounded-full">
                +{clientesDentro.length - 10} más
              </span>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ACCESO RÁPIDO */}
      {/* ============================================================ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => navigate('/recepcion/qr')}
          className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-[#00F2FE]/10 to-[#00F2FE]/5 border border-[#00F2FE]/20 hover:border-[#00F2FE]/50 transition-all group text-center"
        >
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-[#00F2FE]/5 blur-xl"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-[#00F2FE]/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <QrCode className="w-6 h-6 text-[#00F2FE]" />
            </div>
            <span className="block text-xs font-medium text-[#9A9AA0] group-hover:text-white transition-colors">Validar QR</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/recepcion/accesos')}
          className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/50 transition-all group text-center"
        >
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-green-500/5 blur-xl"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <DoorOpen className="w-6 h-6 text-green-400" />
            </div>
            <span className="block text-xs font-medium text-[#9A9AA0] group-hover:text-white transition-colors">Ver Accesos</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/recepcion/usuarios')}
          className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 hover:border-blue-500/50 transition-all group text-center"
        >
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-blue-500/5 blur-xl"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <span className="block text-xs font-medium text-[#9A9AA0] group-hover:text-white transition-colors">Usuarios</span>
          </div>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 hover:border-purple-500/50 transition-all group text-center"
        >
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-purple-500/5 blur-xl"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <span className="block text-xs font-medium text-[#9A9AA0] group-hover:text-white transition-colors">Actualizar</span>
          </div>
        </button>
      </div>

      {/* ============================================================ */}
      {/* ÚLTIMOS ACCESOS */}
      {/* ============================================================ */}
      <div className="bg-[#111625]/50 border border-[#00F2FE]/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00F2FE]" />
            Últimos Accesos
          </h3>
          <button
            onClick={() => navigate('/recepcion/accesos')}
            className="text-[#9A9AA0] text-xs font-mono hover:text-[#00F2FE] transition-colors flex items-center gap-0.5"
          >
            Ver todos <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {accesosRecientes.length > 0 ? (
          <div className="space-y-2">
            {accesosRecientes.map((acceso) => (
              <div 
                key={acceso.idacceso} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0A0A0B]/50 border border-[#00F2FE]/5 hover:border-[#00F2FE]/20 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/20 flex items-center justify-center text-[#00F2FE] font-bold text-xs overflow-hidden flex-shrink-0">
                    {acceso.foto ? (
                      <img src={acceso.foto} alt={acceso.nombre} className="w-full h-full object-cover" />
                    ) : (
                      acceso.nombre?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {acceso.nombre} {acceso.apellido}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#9A9AA0]">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatearFecha(acceso.fechaentrada)}
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-[#5C5C60]"></span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {formatearHora(acceso.fechaentrada)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                    acceso.fechasalida
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : 'bg-green-500/10 text-green-400 border-green-500/20'
                  }`}>
                    {acceso.fechasalida ? (
                      <><DoorClosed className="w-3 h-3" /> Salió</>
                    ) : (
                      <><DoorOpen className="w-3 h-3" /> Dentro</>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-[#00F2FE]/5 border border-[#00F2FE]/10 flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-[#00F2FE]/30" />
            </div>
            <p className="text-[#9A9AA0] text-sm font-mono">No hay accesos registrados hoy</p>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* BANNER INFORMATIVO */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00F2FE]/5 via-transparent to-[#00F2FE]/5 border border-[#00F2FE]/10 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-[#00F2FE]" />
          </div>
          <div>
            <p className="text-white text-sm font-medium">Control de acceso en tiempo real</p>
            <p className="text-[#9A9AA0] text-xs font-mono">
              {stats.dentroAhora} clientes dentro • {stats.accesosHoy} accesos hoy
            </p>
          </div>
          <div className="ml-auto">
            <span className="text-[10px] font-mono bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
              Activo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRecepcionista;