// src/pages/entrenador/EntrenamientosEntrenador.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Search,
  Eye,
  ArrowLeft,
  X,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  Clock,
  User,
  Activity,
  Filter,
  Check,
  CheckCircle,
  Clock as ClockIcon,
  User as UserIcon,
  List,
  Weight,
  Repeat,
  FileText,
  Tag
} from 'lucide-react';
import authService from '../../services/authService';
import userService from '../../services/userService';
import entrenadosService from '../../services/entrenadosService';
import entrenamientoService from '../../services/entrenamientoService';

const EntrenamientosEntrenador = () => {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCliente, setFilterCliente] = useState('');
  const [filterCompletado, setFilterCompletado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntrenamiento, setSelectedEntrenamiento] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 4) {
      navigate('/dashboard');
      return;
    }
    loadData(currentUser.idusuario);
  }, [navigate]);

  const loadData = async (userId) => {
    setLoading(true);
    setError('');
    try {
      // 1. Obtener clientes asignados
      const clientesData = await entrenadosService.getByEntrenador(userId);
      // ✅ FIX: Asegurar que sea un array
      const clientesArray = Array.isArray(clientesData) ? clientesData : [];
      setClientes(clientesArray);

      // 2. Obtener todos los usuarios
      const usuariosData = await userService.getAll();
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);

      // 3. Obtener entrenamientos de todos los clientes
      const allEntrenamientos = [];
      if (clientesArray.length > 0) {
        for (const cliente of clientesArray) {
          try {
            const entrenos = await entrenamientoService.getByUsuario(cliente.identrenado);
            if (entrenos && Array.isArray(entrenos) && entrenos.length > 0) {
              allEntrenamientos.push(...entrenos);
            }
          } catch (err) {
            console.error(`Error al cargar entrenamientos del cliente ${cliente.identrenado}:`, err);
          }
        }
      }
      setEntrenamientos(allEntrenamientos);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
      // ✅ FIX: En caso de error, asegurar arrays vacíos
      setClientes([]);
      setUsuarios([]);
      setEntrenamientos([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserData = (id) => {
    return usuarios.find(u => u.idusuario === id);
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

  const getEjerciciosCount = (entrenamiento) => {
    return entrenamiento.ejercicios?.length || 0;
  };

  // ✅ FIX: Asegurar que entrenamientos sea un array antes de filter
  const filteredEntrenamientos = Array.isArray(entrenamientos) ? entrenamientos.filter(entreno => {
    const search = searchTerm.toLowerCase();
    const nombreCliente = getNombreCompleto(entreno.idusuario).toLowerCase();
    const matchSearch = nombreCliente.includes(search);
    const matchCliente = filterCliente ? entreno.idusuario === parseInt(filterCliente) : true;
    const matchCompletado = filterCompletado !== '' ? entreno.completado === (filterCompletado === 'true') : true;
    return matchSearch && matchCliente && matchCompletado;
  }) : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEntrenamientos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEntrenamientos.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const openDetailModal = (entrenamiento) => {
    setSelectedEntrenamiento(entrenamiento);
    setShowDetailModal(true);
  };

  if (loading && entrenamientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando entrenamientos...</div>
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
              <Activity className="w-6 h-6 text-orange-400" />
              Entrenamientos de Clientes
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">Visualiza el historial de entrenamientos de tus clientes</p>
          </div>
        </div>
        <span className="text-sm text-[#9A9AA0] font-mono">
          {entrenamientos.length} entrenamientos
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
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
            placeholder="Buscar por cliente..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#0A0A0B]/50 border border-orange-500/10 rounded-xl text-white text-sm placeholder-[#9A9AA0] focus:outline-none focus:border-orange-500/40 transition-colors"
          />
        </div>
        <select
          value={filterCliente}
          onChange={(e) => {
            setFilterCliente(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-[#0A0A0B]/50 border border-orange-500/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/40 transition-colors"
        >
          <option value="">Todos los clientes</option>
          {clientes.map((cliente) => (
            <option key={cliente.identrenados} value={cliente.identrenado}>
              {getNombreCompleto(cliente.identrenado)}
            </option>
          ))}
        </select>
        <select
          value={filterCompletado}
          onChange={(e) => {
            setFilterCompletado(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-[#0A0A0B]/50 border border-orange-500/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/40 transition-colors"
        >
          <option value="">Todos los estados</option>
          <option value="true">Completados</option>
          <option value="false">Pendientes</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-orange-500/10 bg-[#0A0A0B]/30">
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider">Fecha</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider">Cliente</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Ejercicios</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Rutina</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-[#9A9AA0] text-sm">
                    No hay entrenamientos registrados
                  </td>
                </tr>
              ) : (
                currentItems.map((entreno) => {
                  const user = getUserData(entreno.idusuario);
                  return (
                    <tr key={entreno.identrenamiento} className="border-b border-orange-500/5 hover:bg-orange-500/5 transition-colors">
                      <td className="py-3 px-3">
                        <div>
                          <p className="text-white text-sm">{formatearFecha(entreno.fecha)}</p>
                          <p className="text-[#9A9AA0] text-[10px] font-mono">
                            {entreno.fecha ? new Date(entreno.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-xs overflow-hidden flex-shrink-0">
                            {user?.fotoperfil ? (
                              <img src={user.fotoperfil} alt={user.nombre} className="w-full h-full object-cover" />
                            ) : (
                              (user?.nombre?.charAt(0) || 'C').toUpperCase()
                            )}
                          </div>
                          <p className="text-white font-medium truncate max-w-[120px]">
                            {getNombreCompleto(entreno.idusuario)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <span className="text-[#9A9AA0] text-xs flex items-center gap-1">
                          <List className="w-3 h-3" />
                          {getEjerciciosCount(entreno)} ejercicios
                        </span>
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        <span className="text-[#9A9AA0] text-xs flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {entreno.idasignacion ? `#${entreno.idasignacion}` : 'Sin rutina'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-medium flex items-center gap-1 ${
                          entreno.completado ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {entreno.completado ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              Completado
                            </>
                          ) : (
                            <>
                              <ClockIcon className="w-3.5 h-3.5" />
                              Pendiente
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => openDetailModal(entreno)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-[#9A9AA0] hover:text-blue-400 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredEntrenamientos.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-orange-500/10">
            <span className="text-[#9A9AA0] text-[10px]">
              {filteredEntrenamientos.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, filteredEntrenamientos.length)} de {filteredEntrenamientos.length}
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

      {/* Modal Detalle Entrenamiento */}
      {showDetailModal && selectedEntrenamiento && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-orange-400" />
                Detalle del Entrenamiento
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Información del cliente */}
              <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-lg overflow-hidden">
                    {(() => {
                      const user = getUserData(selectedEntrenamiento.idusuario);
                      return user?.fotoperfil ? (
                        <img src={user.fotoperfil} alt={user.nombre} className="w-full h-full object-cover" />
                      ) : (
                        (user?.nombre?.charAt(0) || 'C').toUpperCase()
                      );
                    })()}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">
                      {getNombreCompleto(selectedEntrenamiento.idusuario)}
                    </p>
                    <p className="text-[#9A9AA0] text-xs font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatearFechaHora(selectedEntrenamiento.fecha)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles del entrenamiento */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl p-3">
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Estado
                  </p>
                  <p className={`text-sm font-medium flex items-center gap-1 ${
                    selectedEntrenamiento.completado ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {selectedEntrenamiento.completado ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Completado
                      </>
                    ) : (
                      <>
                        <ClockIcon className="w-4 h-4" />
                        Pendiente
                      </>
                    )}
                  </p>
                </div>
                <div className="bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl p-3">
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                    <Repeat className="w-3 h-3" />
                    Repeticiones
                  </p>
                  <p className="text-white font-medium">{selectedEntrenamiento.repeticiones || '-'}</p>
                </div>
                <div className="bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl p-3">
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    Peso
                  </p>
                  <p className="text-white font-medium">{selectedEntrenamiento.peso ? `${selectedEntrenamiento.peso} kg` : '-'}</p>
                </div>
                <div className="bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl p-3">
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Rutina
                  </p>
                  <p className="text-white font-medium">{selectedEntrenamiento.idasignacion ? `#${selectedEntrenamiento.idasignacion}` : 'Sin rutina'}</p>
                </div>
              </div>

              {/* Notas */}
              {selectedEntrenamiento.notas && (
                <div className="bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl p-3">
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Notas
                  </p>
                  <p className="text-white text-sm mt-1">{selectedEntrenamiento.notas}</p>
                </div>
              )}

              {/* Ejercicios del entrenamiento (si existen) */}
              {selectedEntrenamiento.ejercicios && selectedEntrenamiento.ejercicios.length > 0 && (
                <div>
                  <h3 className="text-white text-sm font-bold flex items-center gap-2 mb-2">
                    <Dumbbell className="w-4 h-4 text-orange-400" />
                    Ejercicios realizados
                  </h3>
                  <div className="space-y-2">
                    {selectedEntrenamiento.ejercicios.map((ej, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-[#0A0A0B]/50 border border-orange-500/5 rounded-lg">
                        <span className="text-white text-sm">{ej.nombre || `Ejercicio ${index + 1}`}</span>
                        <span className="text-[#9A9AA0] text-xs font-mono">
                          {ej.series || 0}x {ej.repeticiones || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-center pt-2">
                <p className="text-[#9A9AA0] text-xs font-mono flex items-center justify-center gap-1">
                  {selectedEntrenamiento.completado ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">Entrenamiento completado</span>
                    </>
                  ) : (
                    <>
                      <ClockIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">Entrenamiento pendiente de completar</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntrenamientosEntrenador;