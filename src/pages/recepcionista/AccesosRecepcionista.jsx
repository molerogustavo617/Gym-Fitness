// src/pages/recepcionista/AccesosRecepcionista.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DoorOpen,
  DoorClosed,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Eye,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Activity,
  Filter
} from 'lucide-react';
import authService from '../../services/authService';
import accesoService from '../../services/accesoService';
import userService from '../../services/userService';

const AccesosRecepcionista = () => {
  const navigate = useNavigate();
  const [accesos, setAccesos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAcceso, setSelectedAcceso] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    dentro: 0,
    fuera: 0
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 2) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [accesosData, usuariosData] = await Promise.all([
        accesoService.getAll(),
        userService.getAll()
      ]);

      const accesosArray = Array.isArray(accesosData) ? accesosData : [];
      const usuariosArray = Array.isArray(usuariosData) ? usuariosData : [];
      
      // Ordenar por fecha (más reciente primero)
      const sorted = accesosArray.sort((a, b) => 
        new Date(b.fechaentrada) - new Date(a.fechaentrada)
      );
      
      setAccesos(sorted);
      setUsuarios(usuariosArray);
      
      // Calcular estadísticas
      const dentro = sorted.filter(a => !a.fechasalida);
      setStats({
        total: sorted.length,
        dentro: dentro.length,
        fuera: sorted.length - dentro.length
      });

    } catch (err) {
      console.error('Error al cargar accesos:', err);
      setError('Error al cargar los accesos');
    } finally {
      setLoading(false);
    }
  };

  const getUsuarioNombre = (id) => {
    const user = usuarios.find(u => u.idusuario === id);
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido';
  };

  const getUsuarioFoto = (id) => {
    const user = usuarios.find(u => u.idusuario === id);
    return user?.fotoperfil || null;
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

  const formatearHora = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularDuracion = (entrada, salida) => {
    if (!salida) return 'En curso';
    const diff = new Date(salida) - new Date(entrada);
    const horas = Math.floor(diff / (1000 * 60 * 60));
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos}m`;
  };

  const filteredAccesos = accesos.filter(acceso => {
    const search = searchTerm.toLowerCase();
    const nombre = getUsuarioNombre(acceso.idusuario).toLowerCase();
    const matchSearch = nombre.includes(search);
    
    const matchEstado = filterEstado !== '' 
      ? (filterEstado === 'dentro' ? !acceso.fechasalida : acceso.fechasalida)
      : true;
    
    return matchSearch && matchEstado;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAccesos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAccesos.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const openDetailModal = (acceso) => {
    setSelectedAcceso(acceso);
    setShowDetailModal(true);
  };

  if (loading && accesos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-[#00F2FE]/20 border-t-[#00F2FE] rounded-full animate-spin"></div>
        <div className="text-[#00F2FE] font-semibold text-sm tracking-wide">Cargando accesos...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-20">
      
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#00F2FE]/10 via-[#111625]/50 to-[#111625] border border-[#00F2FE]/20">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#00F2FE]/5 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#00F2FE]/5 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <DoorOpen className="w-7 h-7 text-[#00F2FE]" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Accesos</h1>
              <p className="text-[#9A9AA0] text-xs font-mono">Historial de entradas y salidas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 flex items-center gap-1">
              <DoorOpen className="w-3 h-3" />
              {stats.dentro} dentro
            </span>
            <span className="text-[10px] font-mono bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 flex items-center gap-1">
              <DoorClosed className="w-3 h-3" />
              {stats.fuera} fuera
            </span>
          </div>
        </div>
      </div>

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#111625]/30 border border-[#00F2FE]/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center justify-center gap-1">
            <Activity className="w-3 h-3" /> Total
          </p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-[#111625]/30 border border-green-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center justify-center gap-1">
            <DoorOpen className="w-3 h-3 text-green-400" /> Dentro
          </p>
          <p className="text-2xl font-bold text-green-400">{stats.dentro}</p>
        </div>
        <div className="bg-[#111625]/30 border border-red-500/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center justify-center gap-1">
            <DoorClosed className="w-3 h-3 text-red-400" /> Fuera
          </p>
          <p className="text-2xl font-bold text-red-400">{stats.fuera}</p>
        </div>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9A9AA0]" />
          <input
            type="text"
            placeholder="Buscar por nombre de cliente..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#0A0A0B]/50 border border-[#00F2FE]/10 rounded-xl text-white text-sm placeholder-[#9A9AA0] focus:outline-none focus:border-[#00F2FE]/40 transition-colors"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => {
            setFilterEstado(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-[#0A0A0B]/50 border border-[#00F2FE]/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F2FE]/40 transition-colors"
        >
          <option value="">Todos los estados</option>
          <option value="dentro">Dentro del gimnasio</option>
          <option value="fuera">Fuera del gimnasio</option>
        </select>
      </div>

      {/* TABLA */}
      <div className="bg-[#111625]/30 border border-[#00F2FE]/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-[#00F2FE]/10 bg-[#0A0A0B]/30">
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">Cliente</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Entrada</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Salida</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Duración</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">Estado</th>
                <th className="text-center py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">Acción</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-[#9A9AA0] text-sm">
                    No hay accesos que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                currentItems.map((acceso) => (
                  <tr key={acceso.idacceso} className="border-b border-[#00F2FE]/5 hover:bg-[#00F2FE]/5 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/20 flex items-center justify-center text-[#00F2FE] font-bold text-xs overflow-hidden flex-shrink-0">
                          {getUsuarioFoto(acceso.idusuario) ? (
                            <img src={getUsuarioFoto(acceso.idusuario)} alt="Foto" className="w-full h-full object-cover" />
                          ) : (
                            getUsuarioNombre(acceso.idusuario).charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {getUsuarioNombre(acceso.idusuario)}
                          </p>
                          <p className="text-[#9A9AA0] text-[10px] font-mono">
                            ID: {acceso.idusuario}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      <div>
                        <p className="text-white text-sm">{formatearFecha(acceso.fechaentrada)}</p>
                        <p className="text-[#9A9AA0] text-[10px] font-mono flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {formatearHora(acceso.fechaentrada)}
                        </p>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      {acceso.fechasalida ? (
                        <div>
                          <p className="text-white text-sm">{formatearFecha(acceso.fechasalida)}</p>
                          <p className="text-[#9A9AA0] text-[10px] font-mono flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {formatearHora(acceso.fechasalida)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[#9A9AA0] text-xs font-mono">En curso</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 hidden lg:table-cell">
                      <span className="text-[#9A9AA0] text-xs font-mono">
                        {calcularDuracion(acceso.fechaentrada, acceso.fechasalida)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${
                        acceso.fechasalida
                          ? 'bg-red-500/10 text-red-400 border-red-500/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {acceso.fechasalida ? (
                          <><DoorClosed className="w-3 h-3" /> Fuera</>
                        ) : (
                          <><DoorOpen className="w-3 h-3" /> Dentro</>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => openDetailModal(acceso)}
                        className="p-1.5 rounded-lg hover:bg-[#00F2FE]/10 text-[#9A9AA0] hover:text-[#00F2FE] transition-colors"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {filteredAccesos.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-[#00F2FE]/10">
            <span className="text-[#9A9AA0] text-[10px]">
              {filteredAccesos.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, filteredAccesos.length)} de {filteredAccesos.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded-lg text-xs ${
                  currentPage === 1 
                    ? 'text-[#9A9AA0]/30 cursor-not-allowed' 
                    : 'text-[#9A9AA0] hover:bg-[#00F2FE]/10'
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
                        ? 'bg-[#00F2FE]/20 text-[#00F2FE]'
                        : 'text-[#9A9AA0] hover:bg-[#00F2FE]/10'
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
                    : 'text-[#9A9AA0] hover:bg-[#00F2FE]/10'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL DETALLE ACCESO */}
      {/* ============================================================ */}
      {showDetailModal && selectedAcceso && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-[#00F2FE]/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <DoorOpen className="w-5 h-5 text-[#00F2FE]" />
                Detalle de Acceso
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Cliente */}
              <div className="flex items-center gap-3 p-3 bg-[#0A0A0B]/50 border border-[#00F2FE]/5 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-[#00F2FE]/10 border-2 border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] font-bold text-lg overflow-hidden flex-shrink-0">
                  {getUsuarioFoto(selectedAcceso.idusuario) ? (
                    <img src={getUsuarioFoto(selectedAcceso.idusuario)} alt="Foto" className="w-full h-full object-cover" />
                  ) : (
                    getUsuarioNombre(selectedAcceso.idusuario).charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-white font-bold">{getUsuarioNombre(selectedAcceso.idusuario)}</p>
                  <p className="text-[#9A9AA0] text-xs font-mono">ID: {selectedAcceso.idusuario}</p>
                </div>
              </div>

              {/* Entrada */}
              <div className="bg-[#0A0A0B]/50 border border-green-500/10 rounded-xl p-3">
                <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                  <DoorOpen className="w-3.5 h-3.5 text-green-400" /> Entrada
                </p>
                <p className="text-white font-medium">{formatearFechaHora(selectedAcceso.fechaentrada)}</p>
              </div>

              {/* Salida */}
              <div className="bg-[#0A0A0B]/50 border border-red-500/10 rounded-xl p-3">
                <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                  <DoorClosed className="w-3.5 h-3.5 text-red-400" /> Salida
                </p>
                {selectedAcceso.fechasalida ? (
                  <p className="text-white font-medium">{formatearFechaHora(selectedAcceso.fechasalida)}</p>
                ) : (
                  <p className="text-yellow-400 font-medium flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> En curso
                  </p>
                )}
              </div>

              {/* Duración */}
              <div className="bg-[#0A0A0B]/50 border border-[#00F2FE]/5 rounded-xl p-3">
                <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Duración
                </p>
                <p className="text-white font-medium">
                  {calcularDuracion(selectedAcceso.fechaentrada, selectedAcceso.fechasalida)}
                </p>
              </div>

              {/* Estado final */}
              <div className="text-center pt-2">
                <span className={`text-sm font-medium px-4 py-1.5 rounded-full border ${
                  selectedAcceso.fechasalida
                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                    : 'bg-green-500/10 text-green-400 border-green-500/20'
                }`}>
                  {selectedAcceso.fechasalida ? 'Fuera del gimnasio' : 'Dentro del gimnasio'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full mt-6 px-4 py-2 bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20 rounded-xl font-medium hover:bg-[#00F2FE]/20 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccesosRecepcionista;