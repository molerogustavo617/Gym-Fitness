// src/pages/entrenador/ClientesEntrenador.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Edit,
  Eye,
  UserCheck,
  UserX,
  Dumbbell,
  TrendingUp,
  Calendar,
  ArrowLeft,
  X,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  AlertCircle,
  Clock,
  Activity,
  PlusCircle,
  Target
} from 'lucide-react';
import authService from '../../services/authService';
import userService from '../../services/userService';
import entrenadosService from '../../services/entrenadosService';
import rutinaService from '../../services/rutinaService';
import evolucionService from '../../services/evolucionService';
import RegistrarEntrenamientoModal from './components/RegistrarEntrenamientoModal';

const ClientesEntrenador = () => {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [evoluciones, setEvoluciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [showRutinaModal, setShowRutinaModal] = useState(false);
  const [rutinaCliente, setRutinaCliente] = useState(null);
  const [showEvolucionModal, setShowEvolucionModal] = useState(false);
  const [evolucionCliente, setEvolucionCliente] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [clienteParaRegistrar, setClienteParaRegistrar] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // ============================================================
  // ✅ useEffect CON LOGS
  // ============================================================
  useEffect(() => {
    console.log('🔁 useEffect de ClientesEntrenador ejecutado');
    const currentUser = authService.getCurrentUser();
    console.log('👤 CurrentUser en useEffect:', currentUser);
    
    if (!currentUser || currentUser.idrol !== 4) {
      console.log('❌ Usuario no autorizado, redirigiendo...');
      navigate('/dashboard');
      return;
    }
    console.log('✅ Usuario autorizado, cargando datos...');
    loadData(currentUser.idusuario);
  }, [navigate]);

  // ============================================================
  // ✅ loadData CON LOGS Y EXTRACCIÓN DE alumnos
  // ============================================================
  const loadData = async (userId) => {
    console.log('🚀 loadData iniciado para userId:', userId);
    setLoading(true);
    setError('');
    
    try {
      // 1. OBTENER CLIENTES ASIGNADOS
      console.log('📡 Llamando a entrenadosService.getByEntrenador con:', userId);
      const clientesData = await entrenadosService.getByEntrenador(userId);
      console.log('✅ Respuesta de getByEntrenador:', clientesData);
      
      // ✅ CORREGIDO: Extraer alumnos del objeto
      let clientesArray = [];
      if (clientesData) {
        // Si tiene la propiedad "alumnos", usarla
        if (clientesData.alumnos && Array.isArray(clientesData.alumnos)) {
          clientesArray = clientesData.alumnos;
          console.log('✅ Clientes extraídos de alumnos:', clientesArray.length);
        } 
        // Si es un array directamente, usarlo
        else if (Array.isArray(clientesData)) {
          clientesArray = clientesData;
          console.log('✅ Clientes es un array directamente:', clientesArray.length);
        }
        // Si es un objeto con otros datos
        else {
          console.log('⚠️ Formato de datos inesperado:', typeof clientesData);
          clientesArray = [];
        }
      }
      
      console.log('📋 Clientes procesados:', clientesArray);
      console.log('📊 Cantidad de clientes:', clientesArray.length);
      setClientes(clientesArray);

      // 2. OBTENER TODOS LOS USUARIOS
      console.log('📡 Llamando a userService.getAll()');
      const usuariosData = await userService.getAll();
      console.log('✅ Usuarios recibidos:', usuariosData?.length || 0);
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];
      setUsuarios(usuariosArray);

      // 3. OBTENER RUTINAS ASIGNADAS
      console.log('📡 Llamando a rutinaService.getAsignaciones()');
      const rutinasData = await rutinaService.getAsignaciones();
      console.log('✅ Rutinas recibidas:', rutinasData?.length || 0);
      const rutinasArray = Array.isArray(rutinasData) ? rutinasData : [];
      setRutinas(rutinasArray);

      // 4. OBTENER EVOLUCIONES
      console.log('📡 Llamando a evolucionService.getAll()');
      const evolucionesData = await evolucionService.getAll();
      console.log('✅ Evoluciones recibidas:', evolucionesData?.length || 0);
      const evolucionesArray = Array.isArray(evolucionesData) ? evolucionesData : [];
      setEvoluciones(evolucionesArray);

      console.log('✅ loadData completado exitosamente');

    } catch (err) {
      console.error('❌ ERROR al cargar datos:', err);
      console.error('❌ Detalle del error:', err.response?.data);
      console.error('❌ Status del error:', err.response?.status);
      console.error('❌ Mensaje del error:', err.message);
      setError(`Error al cargar los datos: ${err.response?.data?.error || err.message}`);
      setClientes([]);
      setUsuarios([]);
      setRutinas([]);
      setEvoluciones([]);
    } finally {
      console.log('🏁 loadData finalizado, loading=false');
      setLoading(false);
    }
  };

  const getUserData = (id) => {
    return usuarios.find(u => u.idusuario === id);
  };

  const getRutinaCliente = (idUsuario) => {
    const rutina = rutinas.find(r => r.idusuario === idUsuario && r.activo !== false);
    return rutina || null;
  };

  const getUltimaEvolucion = (idUsuario) => {
    const evolucionesCliente = evoluciones.filter(e => e.idusuario === idUsuario);
    if (evolucionesCliente.length === 0) return null;
    return evolucionesCliente.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
  };

  const getNombreCompleto = (id) => {
    const user = getUserData(id);
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido';
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

  const handleToggleStatus = async (cliente) => {
    setSelectedCliente(cliente);
    setShowStatusModal(true);
  };

  const confirmToggleStatus = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const newStatus = !selectedCliente.activo;
      await entrenadosService.update(selectedCliente.identrenados, {
        activo: newStatus
      });
      setSuccess(`Cliente ${newStatus ? 'activado' : 'desactivado'} correctamente`);
      setShowStatusModal(false);
      const currentUser = authService.getCurrentUser();
      loadData(currentUser.idusuario);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (cliente) => {
    setSelectedCliente(cliente);
    setShowDetailModal(true);
  };

  const openRutinaModal = (cliente) => {
    const rutina = getRutinaCliente(cliente.identrenado);
    setRutinaCliente(rutina);
    setSelectedCliente(cliente);
    setShowRutinaModal(true);
  };

  const openEvolucionModal = async (cliente) => {
    setSelectedCliente(cliente);
    setLoading(true);
    try {
      const evolucionesCliente = await evolucionService.getByUsuario(cliente.identrenado);
      setEvolucionCliente(Array.isArray(evolucionesCliente) ? evolucionesCliente : []);
      setShowEvolucionModal(true);
    } catch (err) {
      setError('Error al cargar evoluciones');
      setEvolucionCliente([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarEntreno = (cliente) => {
    setClienteParaRegistrar(cliente);
    setShowRegistrarModal(true);
  };

  const filteredClientes = Array.isArray(clientes) ? clientes.filter(cliente => {
    const search = searchTerm.toLowerCase();
    const nombreCompleto = getNombreCompleto(cliente.identrenado).toLowerCase();
    const matchSearch = nombreCompleto.includes(search);
    const matchActivo = filterActivo !== '' ? cliente.activo === (filterActivo === 'true') : true;
    return matchSearch && matchActivo;
  }) : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredClientes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading && clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      
      {/* Header */}
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
              <Users className="w-6 h-6 text-orange-400" />
              Mis Clientes
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">Gestiona tus clientes asignados</p>
          </div>
        </div>
        <span className="text-sm text-[#9A9AA0] font-mono">
          {clientes.length} clientes
        </span>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9A9AA0]" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#0A0A0B]/50 border border-orange-500/10 rounded-xl text-white text-sm placeholder-[#9A9AA0] focus:outline-none focus:border-orange-500/40 transition-colors"
          />
        </div>
        <select
          value={filterActivo}
          onChange={(e) => {
            setFilterActivo(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-[#0A0A0B]/50 border border-orange-500/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/40 transition-colors"
        >
          <option value="">Todos los estados</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[850px]">
            <thead>
              <tr className="border-b border-orange-500/10 bg-[#0A0A0B]/30">
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider">Cliente</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Contacto</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Inicio</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-[#9A9AA0] text-sm">
                    No tienes clientes asignados
                  </td>
                </tr>
              ) : (
                currentItems.map((cliente) => {
                  const user = getUserData(cliente.identrenado);
                  const ultimaEvo = getUltimaEvolucion(cliente.identrenado);
                  const tieneRutina = getRutinaCliente(cliente.identrenado) !== null;

                  return (
                    <tr key={cliente.identrenados} className="border-b border-orange-500/5 hover:bg-orange-500/5 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm overflow-hidden flex-shrink-0">
                            {user?.fotoperfil ? (
                              <img src={user.fotoperfil} alt={user.nombre} className="w-full h-full object-cover" />
                            ) : (
                              (user?.nombre?.charAt(0) || 'C').toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium truncate">
                              {getNombreCompleto(cliente.identrenado)}
                            </p>
                            <p className="text-[#9A9AA0] text-[10px] font-mono truncate">
                              @{user?.usuario || 'usuario'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <p className="text-[#9A9AA0] text-xs truncate max-w-[120px]">
                          {user?.correo || '-'}
                        </p>
                        <p className="text-[#9A9AA0] text-[10px] font-mono">
                          {user?.telefono || '-'}
                        </p>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <p className="text-[#9A9AA0] text-xs">
                          {formatearFecha(cliente.fechainicio)}
                        </p>
                        {ultimaEvo && (
                          <p className="text-orange-400 text-[10px] font-mono flex items-center gap-0.5">
                            <TrendingUp className="w-2.5 h-2.5" />
                            {ultimaEvo.peso}kg
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-medium ${cliente.activo ? 'text-green-400' : 'text-red-400'}`}>
                          {cliente.activo ? 'Activo' : 'Inactivo'}
                        </span>
                        {tieneRutina && (
                          <span className="block text-[8px] font-mono text-blue-400 flex items-center gap-0.5">
                            <Dumbbell className="w-2.5 h-2.5" />
                            Rutina asignada
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-0.5 flex-wrap">
                          <button
                            onClick={() => handleRegistrarEntreno({
                              ...cliente,
                              nombre: user?.nombre || 'Cliente',
                              apellido: user?.apellido || '',
                              correo: user?.correo || ''
                            })}
                            className="p-1.5 rounded-lg hover:bg-green-500/10 text-[#9A9AA0] hover:text-green-400 transition-colors"
                            title="Registrar entrenamiento"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDetailModal(cliente)}
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-[#9A9AA0] hover:text-blue-400 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openRutinaModal(cliente)}
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-[#9A9AA0] hover:text-blue-400 transition-colors"
                            title="Ver rutina"
                          >
                            <Dumbbell className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEvolucionModal(cliente)}
                            className="p-1.5 rounded-lg hover:bg-green-500/10 text-[#9A9AA0] hover:text-green-400 transition-colors"
                            title="Ver evolución"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(cliente)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              cliente.activo 
                                ? 'hover:bg-red-500/10 text-[#9A9AA0] hover:text-red-400'
                                : 'hover:bg-green-500/10 text-[#9A9AA0] hover:text-green-400'
                            }`}
                            title={cliente.activo ? 'Desactivar' : 'Activar'}
                          >
                            {cliente.activo ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredClientes.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-orange-500/10">
            <span className="text-[#9A9AA0] text-[10px]">
              {filteredClientes.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, filteredClientes.length)} de {filteredClientes.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded-lg text-xs ${
                  currentPage === 1 
                    ? 'text-[#9A9AA0]/30 cursor-not-allowed' 
                    : 'text-[#9A9AA0] hover:bg-orange-500/10'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium ${
                      currentPage === pageNum
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'text-[#9A9AA0] hover:bg-orange-500/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-2 py-1 rounded-lg text-xs ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-[#9A9AA0]/30 cursor-not-allowed' 
                    : 'text-[#9A9AA0] hover:bg-orange-500/10'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL DETALLE CLIENTE */}
      {/* ============================================================ */}
      {showDetailModal && selectedCliente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-orange-400" />
                Detalles del Cliente
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const user = getUserData(selectedCliente.identrenado);
              const rutina = getRutinaCliente(selectedCliente.identrenado);
              const ultimaEvo = getUltimaEvolucion(selectedCliente.identrenado);

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-orange-500/10">
                    <div className="w-16 h-16 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-2xl overflow-hidden">
                      {user?.fotoperfil ? (
                        <img src={user.fotoperfil} alt={user.nombre} className="w-full h-full object-cover" />
                      ) : (
                        (user?.nombre?.charAt(0) || 'C').toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{getNombreCompleto(selectedCliente.identrenado)}</p>
                      <p className="text-[#9A9AA0] text-xs font-mono">@{user?.usuario || 'usuario'}</p>
                      <span className={`text-xs font-medium ${selectedCliente.activo ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedCliente.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Cédula</p>
                      <p className="text-white font-medium">{user?.cedula || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Email</p>
                      <p className="text-white font-medium">{user?.correo || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Teléfono</p>
                      <p className="text-white font-medium">{user?.telefono || '-'}</p>
                    </div>
                    <div>
                      <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Fecha inicio</p>
                      <p className="text-white font-medium">{formatearFecha(selectedCliente.fechainicio)}</p>
                    </div>
                  </div>

                  {ultimaEvo && (
                    <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                      <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Última evolución</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-white font-bold flex items-center gap-0.5">
                          <TrendingUp className="w-4 h-4 text-orange-400" />
                          {ultimaEvo.peso} kg
                        </span>
                        {ultimaEvo.porcentajegrasa && (
                          <span className="text-white font-bold flex items-center gap-0.5">
                            <Target className="w-4 h-4 text-orange-400" />
                            {ultimaEvo.porcentajegrasa}% grasa
                          </span>
                        )}
                        <span className="text-[#9A9AA0] text-xs font-mono">{formatearFecha(ultimaEvo.fecha)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-4 border-t border-orange-500/10">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openRutinaModal(selectedCliente);
                      }}
                      className="w-full py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-sm font-medium hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Dumbbell className="w-4 h-4" />
                      Ver rutina asignada
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openEvolucionModal(selectedCliente);
                      }}
                      className="w-full py-2 bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl text-sm font-medium hover:bg-green-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Ver evolución
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        handleRegistrarEntreno({
                          ...selectedCliente,
                          nombre: user?.nombre || 'Cliente',
                          apellido: user?.apellido || '',
                          correo: user?.correo || ''
                        });
                      }}
                      className="w-full py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl text-sm font-medium hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Registrar entrenamiento
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL RUTINA CLIENTE */}
      {/* ============================================================ */}
      {showRutinaModal && selectedCliente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-orange-400" />
                Rutina de {getNombreCompleto(selectedCliente.identrenado)}
              </h2>
              <button
                onClick={() => setShowRutinaModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {rutinaCliente ? (
              <div className="space-y-4">
                <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4">
                  <p className="text-white font-bold text-lg">{rutinaCliente.rutina?.nombre || 'Rutina'}</p>
                  <p className="text-[#9A9AA0] text-xs font-mono">
                    Asignada: {formatearFecha(rutinaCliente.fechaasignacion)}
                  </p>
                </div>
                <div className="text-center py-4">
                  <p className="text-[#9A9AA0] text-sm font-mono flex items-center justify-center gap-2">
                    <Dumbbell className="w-4 h-4" />
                    Para ver los ejercicios de esta rutina, ve al módulo de Rutinas
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-yellow-400/50 mx-auto mb-3" />
                <p className="text-[#9A9AA0] text-sm font-mono">Este cliente no tiene rutina asignada</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL EVOLUCIÓN CLIENTE */}
      {/* ============================================================ */}
      {showEvolucionModal && selectedCliente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Evolución de {getNombreCompleto(selectedCliente.identrenado)}
              </h2>
              <button
                onClick={() => setShowEvolucionModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {evolucionCliente.length > 0 ? (
              <div className="space-y-2">
                {evolucionCliente.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((evo) => (
                  <div key={evo.idevolucion} className="flex items-center justify-between p-3 bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl">
                    <div>
                      <p className="text-white font-medium">{formatearFecha(evo.fecha)}</p>
                      <p className="text-[#9A9AA0] text-xs font-mono">
                        {evo.identrenamiento ? `Entreno #${evo.identrenamiento}` : 'Registro manual'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold flex items-center gap-0.5">
                        <TrendingUp className="w-4 h-4 text-orange-400" />
                        {evo.peso} kg
                      </p>
                      {evo.porcentajegrasa && (
                        <p className="text-orange-400 text-xs font-mono flex items-center gap-0.5 justify-end">
                          <Target className="w-3 h-3" />
                          {evo.porcentajegrasa}% grasa
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-yellow-400/50 mx-auto mb-3" />
                <p className="text-[#9A9AA0] text-sm font-mono">Este cliente no tiene registros de evolución</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CAMBIAR ESTADO */}
      {/* ============================================================ */}
      {showStatusModal && selectedCliente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-full ${selectedCliente.activo ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                {selectedCliente.activo ? <UserX className="w-6 h-6 text-red-400" /> : <UserCheck className="w-6 h-6 text-green-400" />}
              </div>
              <h2 className="text-xl font-bold text-white">
                {selectedCliente.activo ? 'Desactivar' : 'Activar'} Cliente
              </h2>
            </div>
            <p className="text-[#9A9AA0] text-sm mb-4">
              ¿Estás seguro de que deseas {selectedCliente.activo ? 'desactivar' : 'activar'} al cliente 
              <span className="text-white font-medium"> {getNombreCompleto(selectedCliente.identrenado)}</span>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 bg-[#0A0A0B] border border-orange-500/10 text-[#9A9AA0] rounded-xl hover:bg-orange-500/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmToggleStatus}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                  selectedCliente.activo
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {selectedCliente.activo ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
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
            const currentUser = authService.getCurrentUser();
            loadData(currentUser.idusuario);
          }}
        />
      )}
    </div>
  );
};

export default ClientesEntrenador;