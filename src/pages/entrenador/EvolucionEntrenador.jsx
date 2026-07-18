// src/pages/entrenador/EvolucionEntrenador.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Search,
  Eye,
  ArrowLeft,
  X,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  User,
  Weight,
  Activity,
  LineChart,
  Plus,
  Save,
  BarChart,
  FileText,
  Users,
  Target,
  Clock as ClockIcon
} from 'lucide-react';
import authService from '../../services/authService';
import userService from '../../services/userService';
import entrenadosService from '../../services/entrenadosService';
import evolucionService from '../../services/evolucionService';

const EvolucionEntrenador = () => {
  const [loading, setLoading] = useState(true);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [evoluciones, setEvoluciones] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRegistrarModal, setShowRegistrarModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingEvolucion, setLoadingEvolucion] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    peso: '',
    porcentajeGrasa: '',
    fecha: new Date().toISOString().split('T')[0],
    notas: ''
  });

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
      const clientesData = await entrenadosService.getByEntrenador(userId);
      // ✅ FIX: Asegurar que sea un array
      setClientes(Array.isArray(clientesData) ? clientesData : []);

      const usuariosData = await userService.getAll();
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);

      const evolucionesData = await evolucionService.getAll();
      setEvoluciones(Array.isArray(evolucionesData) ? evolucionesData : []);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
      // ✅ FIX: En caso de error, asegurar arrays vacíos
      setClientes([]);
      setUsuarios([]);
      setEvoluciones([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserData = (id) => {
    return usuarios.find(u => u.idusuario === id);
  };

  const getEvolucionesCliente = (idUsuario) => {
    return Array.isArray(evoluciones) 
      ? evoluciones.filter(e => e.idusuario === idUsuario)
          .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      : [];
  };

  const getUltimaEvolucion = (idUsuario) => {
    const evos = getEvolucionesCliente(idUsuario);
    return evos.length > 0 ? evos[0] : null;
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const openDetailModal = (cliente) => {
    setSelectedCliente(cliente);
    setShowDetailModal(true);
  };

  const openRegistrarModal = (cliente) => {
    setSelectedCliente(cliente);
    setFormData({
      peso: '',
      porcentajeGrasa: '',
      fecha: new Date().toISOString().split('T')[0],
      notas: ''
    });
    setShowRegistrarModal(true);
    setError('');
    setSuccess('');
  };

  const handleRegistrarEvolucion = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoadingEvolucion(true);

    try {
      if (!formData.peso || parseFloat(formData.peso) <= 0) {
        setError('El peso es obligatorio y debe ser mayor a 0');
        setLoadingEvolucion(false);
        return;
      }

      const dataToSend = {
        idUsuario: selectedCliente.identrenado,
        peso: parseFloat(formData.peso),
        porcentajeGrasa: formData.porcentajeGrasa ? parseFloat(formData.porcentajeGrasa) : null,
        fecha: formData.fecha,
        notas: formData.notas || null
      };

      await evolucionService.create(dataToSend);
      setSuccess('Evolución registrada correctamente');
      
      setTimeout(() => {
        setShowRegistrarModal(false);
        loadData(authService.getCurrentUser().idusuario);
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar la evolución');
    } finally {
      setLoadingEvolucion(false);
    }
  };

  // ✅ FIX: Asegurar que clientes sea un array antes de filter
  const filteredClientes = Array.isArray(clientes) ? clientes.filter(cliente => {
    const search = searchTerm.toLowerCase();
    const nombreCompleto = getNombreCompleto(cliente.identrenado).toLowerCase();
    return nombreCompleto.includes(search);
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
        <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando evolución...</div>
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
              <TrendingUp className="w-6 h-6 text-orange-400" />
              Evolución de Clientes
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">Registra y visualiza el progreso de tus clientes</p>
          </div>
        </div>
        <span className="text-sm text-[#9A9AA0] font-mono flex items-center gap-1">
          <Users className="w-4 h-4" />
          {clientes.length} clientes
        </span>
      </div>

      {/* Error/Success */}
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

      {/* Buscador */}
      <div className="relative">
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

      {/* Tabla */}
      <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-orange-500/10 bg-[#0A0A0B]/30">
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider">Cliente</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider hidden sm:table-cell">Último peso</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider hidden md:table-cell">Última medición</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">Registros</th>
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
                  const todasEvo = getEvolucionesCliente(cliente.identrenado);

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
                        {ultimaEvo ? (
                          <span className="text-white font-bold flex items-center gap-1">
                            <Weight className="w-3.5 h-3.5 text-orange-400" />
                            {ultimaEvo.peso} kg
                          </span>
                        ) : (
                          <span className="text-[#9A9AA0] text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Sin registro
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 hidden md:table-cell">
                        {ultimaEvo ? (
                          <span className="text-[#9A9AA0] text-xs flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatearFecha(ultimaEvo.fecha)}
                          </span>
                        ) : (
                          <span className="text-[#9A9AA0] text-xs">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 hidden lg:table-cell">
                        <span className="text-[#9A9AA0] text-xs flex items-center gap-1">
                          <BarChart className="w-3 h-3" />
                          {todasEvo.length} registros
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openDetailModal(cliente)}
                            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-[#9A9AA0] hover:text-blue-400 transition-colors"
                            title="Ver evolución"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openRegistrarModal(cliente)}
                            className="p-1.5 rounded-lg hover:bg-green-500/10 text-[#9A9AA0] hover:text-green-400 transition-colors"
                            title="Registrar evolución"
                          >
                            <Plus className="w-4 h-4" />
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

      {/* Modal Detalle Evolución */}
      {showDetailModal && selectedCliente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                Evolución de {getNombreCompleto(selectedCliente.identrenado)}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const evos = getEvolucionesCliente(selectedCliente.identrenado);
              if (evos.length === 0) {
                return (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-yellow-400/50 mx-auto mb-3" />
                    <p className="text-[#9A9AA0] text-sm font-mono">Este cliente no tiene registros de evolución</p>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openRegistrarModal(selectedCliente);
                      }}
                      className="mt-3 px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl text-sm font-bold hover:bg-orange-400 transition-all"
                    >
                      Registrar primera evolución
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {/* Gráfico de progreso (simple) */}
                  <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4">
                    <h3 className="text-white text-sm font-bold flex items-center gap-2 mb-3">
                      <LineChart className="w-4 h-4 text-orange-400" />
                      Progreso de peso
                    </h3>
                    <div className="flex items-end gap-1 h-24">
                      {evos.slice(0, 10).reverse().map((evo, index) => {
                        const maxPeso = Math.max(...evos.map(e => e.peso)) + 5;
                        const altura = (evo.peso / maxPeso) * 80;
                        const esUltimo = index === evos.slice(0, 10).length - 1;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className={`w-full rounded-t transition-all ${esUltimo ? 'bg-orange-400' : 'bg-orange-400/40'}`}
                              style={{ height: `${Math.max(altura, 10)}px`, minHeight: '10px' }}
                            />
                            <span className="text-[8px] text-[#9A9AA0] font-mono mt-0.5">
                              {new Date(evo.fecha).getDate()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lista de evoluciones */}
                  <div className="space-y-2">
                    <h3 className="text-white text-sm font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-400" />
                      Registros ({evos.length})
                    </h3>
                    {evos.map((evo) => (
                      <div key={evo.idevolucion} className="flex items-center justify-between p-3 bg-[#0A0A0B]/50 border border-orange-500/5 rounded-xl">
                        <div>
                          <p className="text-white font-medium flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-orange-400" />
                            {formatearFecha(evo.fecha)}
                          </p>
                          {evo.notas && (
                            <p className="text-[#9A9AA0] text-xs font-mono flex items-center gap-1 mt-0.5">
                              <FileText className="w-3 h-3" />
                              {evo.notas}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold flex items-center gap-1">
                            <Weight className="w-4 h-4 text-orange-400" />
                            {evo.peso} kg
                          </p>
                          {evo.porcentajegrasa && (
                            <p className="text-orange-400 text-xs font-mono flex items-center gap-1 justify-end">
                              <Target className="w-3 h-3" />
                              {evo.porcentajegrasa}% grasa
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      openRegistrarModal(selectedCliente);
                    }}
                    className="w-full py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl text-sm font-medium hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar nueva evolución
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Modal Registrar Evolución */}
      {showRegistrarModal && selectedCliente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-400" />
                Registrar Evolución
              </h2>
              <button
                onClick={() => setShowRegistrarModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[#9A9AA0] text-sm mb-4 flex items-center gap-1">
              <User className="w-4 h-4" />
              Cliente: <span className="text-white font-medium">{getNombreCompleto(selectedCliente.identrenado)}</span>
            </p>

            <form onSubmit={handleRegistrarEvolucion} className="space-y-4">
              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                  <Weight className="w-3.5 h-3.5" />
                  Peso (kg) *
                </label>
                <input
                  name="peso"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="Ej: 75.5"
                  value={formData.peso}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" />
                  Porcentaje de grasa (%)
                </label>
                <input
                  name="porcentajeGrasa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="Ej: 15.5"
                  value={formData.porcentajeGrasa}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Fecha
                </label>
                <input
                  name="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  Notas
                </label>
                <textarea
                  name="notas"
                  placeholder="Observaciones adicionales..."
                  value={formData.notas}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegistrarModal(false)}
                  className="flex-1 px-4 py-2 bg-[#0A0A0B] border border-orange-500/10 text-[#9A9AA0] rounded-xl hover:bg-orange-500/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingEvolucion}
                  className="flex-1 px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl font-medium hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loadingEvolucion ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Registrar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvolucionEntrenador;