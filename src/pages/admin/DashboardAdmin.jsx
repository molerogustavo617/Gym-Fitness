// src/pages/admin/DashboardAdmin.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  DoorOpen,
  DoorClosed,
  Dumbbell,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Clock,
  ArrowRight,
  Package
} from 'lucide-react';
import authService from '../../services/authService';
import userService from '../../services/userService';
import maquinaService from '../../services/maquinaService';
import accesoService from '../../services/accesoService';
import membresiaService from '../../services/membresiaService';
import pagoService from '../../services/pagoService';
import notificacionService from '../../services/notificacionService';
import ExchangeRateConfig from '../../components/ExchangeRateConfig';

const DashboardAdmin = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsuarios: 0,
    usuariosActivos: 0,
    usuariosInactivos: 0,
    totalMaquinas: 0,
    maquinasActivas: 0,
    dentroAhora: 0,
    accesosHoy: 0,
    totalMembresias: 0,
    pagosHoy: 0,
    pagosPendientes: 0,
    notificacionesNoLeidas: 0
  });

  const [desgloseRoles, setDesgloseRoles] = useState([]);
  const [accesosRecientes, setAccesosRecientes] = useState([]);
  const [pagosRecientes, setPagosRecientes] = useState([]);
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        usuariosData,
        maquinasData,
        accesosActivos,
        accesosHoyData,
        membresiasData,
        pagosData,
        notificacionesData
      ] = await Promise.all([
        userService.getAll(),
        maquinaService.getAll(),
        accesoService.getActivos(),
        accesoService.getAll(),
        membresiaService.getAll(),
        pagoService.getAll(),
        notificacionService.getAll()
      ]);

      const totalUsuarios = usuariosData.length;
      const usuariosActivos = usuariosData.filter(u => u.activo === true).length;
      const usuariosInactivos = usuariosData.filter(u => u.activo === false).length;

      const totalMaquinas = maquinasData.length;
      const maquinasActivas = maquinasData.filter(m => m.estado === 'Activa' || m.estado === 'Operativa').length;

      const dentroAhora = accesosActivos.usuarios?.length || 0;
      
      const hoy = new Date().toISOString().split('T')[0];
      const accesosHoy = accesosHoyData.filter(a => a.fechaentrada?.split('T')[0] === hoy).length;

      const membresiasActivas = membresiasData.filter(m => m.activo === true).length;

      const pagosHoy = pagosData.filter(p => p.fechapago === hoy).length;
      const pagosPendientes = pagosData.filter(p => p.estado === 'pendiente').length;

      const notificacionesNoLeidas = notificacionesData.filter(n => n.leido === false).length;

      setStats({
        totalUsuarios,
        usuariosActivos,
        usuariosInactivos,
        totalMaquinas,
        maquinasActivas,
        dentroAhora,
        accesosHoy,
        totalMembresias: membresiasActivas,
        pagosHoy,
        pagosPendientes,
        notificacionesNoLeidas
      });

      const conteoRoles = {
        'Administrador': 0,
        'Recepcionista': 0,
        'Entrenador': 0,
        'Cliente': 0
      };

      usuariosData.forEach(u => {
        if (u.rol === 'Administrador' || u.idrol === 1) conteoRoles['Administrador']++;
        else if (u.rol === 'Recepcionista' || u.idrol === 2) conteoRoles['Recepcionista']++;
        else if (u.rol === 'Entrenador' || u.rol === 'Trainer' || u.idrol === 4) conteoRoles['Entrenador']++;
        else conteoRoles['Cliente']++;
      });

      const rolesData = Object.keys(conteoRoles).map(nombre => {
        const cantidad = conteoRoles[nombre];
        return {
          nombre,
          conteo: cantidad,
          porcentaje: totalUsuarios > 0 ? Math.round((cantidad / totalUsuarios) * 100) : 0
        };
      });
      setDesgloseRoles(rolesData);

      const recientes = accesosHoyData.slice(0, 5).map(a => ({
        id: a.idacceso,
        usuario: usuariosData.find(u => u.idusuario === a.idusuario)?.nombre || 'Usuario',
        apellido: usuariosData.find(u => u.idusuario === a.idusuario)?.apellido || '',
        entrada: a.fechaentrada,
        salida: a.fechasalida,
        estado: a.fechasalida ? 'Completado' : 'Dentro'
      }));
      setAccesosRecientes(recientes);

      const pagosRecientesData = pagosData.slice(0, 5).map(p => ({
        id: p.idpago,
        usuario: usuariosData.find(u => u.idusuario === p.idusuario)?.nombre || 'Usuario',
        apellido: usuariosData.find(u => u.idusuario === p.idusuario)?.apellido || '',
        monto: p.monto,
        estado: p.estado,
        fecha: p.fechapago
      }));
      setPagosRecientes(pagosRecientesData);

      const actividad = [];
      
      accesosHoyData.slice(0, 3).forEach(a => {
        const usuario = usuariosData.find(u => u.idusuario === a.idusuario);
        if (usuario) {
          actividad.push({
            id: `acceso-${a.idacceso}`,
            tipo: 'acceso',
            usuario: `${usuario.nombre} ${usuario.apellido}`,
            descripcion: a.fechasalida ? 'Salió del gimnasio' : 'Ingresó al gimnasio',
            fecha: a.fechaentrada,
            icon: a.fechasalida ? 'salida' : 'entrada'
          });
        }
      });

      pagosData.slice(0, 3).forEach(p => {
        const usuario = usuariosData.find(u => u.idusuario === p.idusuario);
        if (usuario) {
          actividad.push({
            id: `pago-${p.idpago}`,
            tipo: 'pago',
            usuario: `${usuario.nombre} ${usuario.apellido}`,
            descripcion: `Pago de ${parseFloat(p.monto)?.toFixed(2) || '0.00'} USD - ${p.estado}`,
            fecha: p.fechapago,
            icon: 'pago'
          });
        }
      });

      actividad.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setActividadReciente(actividad.slice(0, 5));

    } catch (err) {
      console.error("Error al cargar datos del dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado': return 'text-green-400';
      case 'pendiente': return 'text-yellow-400';
      case 'rechazado': return 'text-red-400';
      default: return 'text-gym-gray';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'aprobado': return 'Aprobado';
      case 'pendiente': return 'Pendiente';
      case 'rechazado': return 'Rechazado';
      default: return estado || 'Desconocido';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatHora = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header - Bienvenida CON FOTO DE PERFIL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gym-neon/10 border-2 border-gym-neon/30 flex items-center justify-center text-2xl font-bold text-gym-neon shrink-0 overflow-hidden">
            {user?.fotoperfil ? (
              <img 
                src={user.fotoperfil} 
                alt="Perfil" 
                className="w-full h-full object-cover"
              />
            ) : (
              user?.nombre?.charAt(0) || 'A'
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gym-white">
              Bienvenido, {user?.nombre || 'Administrador'}
            </h1>
            <p className="text-gym-gray-light">
              <span className="text-gym-neon font-medium">{user?.rol || 'Administrador'}</span>
              <span className="text-gym-gray mx-2">•</span>
              <span className="text-gym-gray text-sm">{user?.correo || user?.email || ''}</span>
            </p>
          </div>
        </div>
        <div className="text-sm text-gym-gray-light">
          <Calendar className="w-4 h-4 inline mr-1" />
          {new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4">
          <div className="flex items-center gap-2 text-gym-gray-light text-xs">
            <Users className="w-4 h-4" /> Usuarios
          </div>
          <div className="text-2xl font-bold text-gym-white">{stats.totalUsuarios}</div>
          <div className="flex gap-2 mt-1 text-xs">
            <span className="text-green-400">{stats.usuariosActivos} activos</span>
            <span className="text-red-400">{stats.usuariosInactivos} inactivos</span>
          </div>
        </div>

        <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4">
          <div className="flex items-center gap-2 text-gym-gray-light text-xs">
            <DoorOpen className="w-4 h-4" /> Dentro ahora
          </div>
          <div className="text-2xl font-bold text-gym-white">{stats.dentroAhora}</div>
          <div className="text-xs text-gym-gray-light mt-1">Accesos hoy: {stats.accesosHoy}</div>
        </div>

        <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4">
          <div className="flex items-center gap-2 text-gym-gray-light text-xs">
            <Dumbbell className="w-4 h-4" /> Máquinas
          </div>
          <div className="text-2xl font-bold text-gym-white">{stats.totalMaquinas}</div>
          <div className="text-xs text-green-400 mt-1">{stats.maquinasActivas} operativas</div>
        </div>

        <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4">
          <div className="flex items-center gap-2 text-gym-gray-light text-xs">
            <Package className="w-4 h-4" /> Membresías
          </div>
          <div className="text-2xl font-bold text-gym-white">{stats.totalMembresias}</div>
          <div className="text-xs text-gym-gray-light mt-1">activas</div>
        </div>

        <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4">
          <div className="flex items-center gap-2 text-gym-gray-light text-xs">
            <CreditCard className="w-4 h-4" /> Pagos
          </div>
          <div className="text-2xl font-bold text-gym-white">{stats.pagosHoy}</div>
          <div className="flex gap-2 mt-1 text-xs">
            <span className="text-yellow-400">{stats.pagosPendientes} pendientes</span>
          </div>
        </div>
      </div>

      {/* ✅ NUEVO: Tasa de Cambio - Widget */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <ExchangeRateConfig />
        </div>
      </div>

      {/* Gráfica de roles + Notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
          <h3 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider mb-4">
            Usuarios por Rol
          </h3>
          <div className="space-y-3">
            {desgloseRoles.length > 0 ? (
              desgloseRoles.filter(item => item.conteo > 0).map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gym-white">{item.nombre}</span>
                    <span className="text-gym-neon font-medium">
                      {item.conteo} ({item.porcentaje}%)
                    </span>
                  </div>
                  <div className="w-full bg-gym-dark rounded-full h-2 border border-gym-gray/5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-gym-neon/40 via-gym-neon/80 to-gym-neon h-full rounded-full transition-all duration-1000"
                      style={{ width: `${item.porcentaje}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gym-gray text-sm">No hay usuarios registrados</p>
            )}
          </div>
        </div>

        <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
          <h3 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Notificaciones
          </h3>
          <div className="flex flex-col items-center justify-center h-full py-4">
            <div className="text-4xl font-bold text-gym-neon">{stats.notificacionesNoLeidas}</div>
            <p className="text-gym-gray-light text-sm mt-1">No leídas</p>
            <button 
              onClick={() => navigate('/admin/notificaciones')}
              className="mt-4 text-gym-neon text-sm hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
          <h3 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Accesos Recientes
          </h3>
          {accesosRecientes.length > 0 ? (
            <div className="space-y-2">
              {accesosRecientes.map((acceso) => (
                <div key={acceso.id} className="flex items-center justify-between py-2 border-b border-gym-gray/5">
                  <div>
                    <p className="text-gym-white text-sm font-medium">{acceso.usuario} {acceso.apellido}</p>
                    <p className="text-gym-gray-light text-xs">{formatHora(acceso.entrada)}</p>
                  </div>
                  <span className={`text-xs font-medium ${acceso.estado === 'Dentro' ? 'text-green-400' : 'text-gym-gray-light'}`}>
                    {acceso.estado}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gym-gray text-sm">No hay accesos recientes</p>
          )}
          <button 
            onClick={() => navigate('/admin/accesos')}
            className="mt-4 text-gym-neon text-sm hover:underline flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
          <h3 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Pagos Recientes
          </h3>
          {pagosRecientes.length > 0 ? (
            <div className="space-y-2">
              {pagosRecientes.map((pago) => (
                <div key={pago.id} className="flex items-center justify-between py-2 border-b border-gym-gray/5">
                  <div>
                    <p className="text-gym-white text-sm font-medium">{pago.usuario} {pago.apellido}</p>
                    <p className="text-gym-gray-light text-xs">{formatFecha(pago.fecha)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gym-white font-medium">
                      ${parseFloat(pago.monto)?.toFixed(2) || '0.00'}
                    </p>
                    <span className={`text-xs font-medium ${getEstadoColor(pago.estado)}`}>
                      {getEstadoLabel(pago.estado)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gym-gray text-sm">No hay pagos recientes</p>
          )}
          <button 
            onClick={() => navigate('/admin/pagos')}
            className="mt-4 text-gym-neon text-sm hover:underline flex items-center gap-1"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;