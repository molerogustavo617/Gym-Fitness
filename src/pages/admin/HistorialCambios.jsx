// src/pages/admin/HistorialCambios.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
  X,
  Eye,
  FileText,
  Filter,
  RefreshCw
} from 'lucide-react';
import historialCambioService from '../../services/historialCambioService';
import userService from '../../services/userService';
import authService from '../../services/authService';

const HistorialCambios = () => {
  const [historial, setHistorial] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterTabla, setFilterTabla] = useState('');
  const [filterAccion, setFilterAccion] = useState('');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.idrol !== 1) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [historialData, usuariosData] = await Promise.all([
        historialCambioService.getAll(),
        userService.getAll()
      ]);
      setHistorial(historialData);
      setUsuarios(usuariosData);
    } catch (err) {
      setError('Error al cargar el historial');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistorial = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await historialCambioService.getAll();
      setHistorial(data);
    } catch (err) {
      setError('Error al cargar el historial');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    setError('');
    setCurrentPage(1);
    
    try {
      let data = [];
      
      if (filterFechaInicio && filterFechaFin) {
        data = await historialCambioService.getByRangoFechas(filterFechaInicio, filterFechaFin);
      } else if (filterUsuario) {
        data = await historialCambioService.getByUsuario(parseInt(filterUsuario));
      } else if (filterTabla) {
        data = await historialCambioService.getByTabla(filterTabla);
      } else if (filterAccion) {
        data = await historialCambioService.getByAccion(filterAccion);
      } else {
        data = await historialCambioService.getAll();
      }
      
      setHistorial(data);
    } catch (err) {
      setError('Error al aplicar los filtros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterUsuario('');
    setFilterTabla('');
    setFilterAccion('');
    setFilterFechaInicio('');
    setFilterFechaFin('');
    setSearchTerm('');
    setCurrentPage(1);
    loadHistorial();
  };

  const openDetailModal = (registro) => {
    setSelectedRegistro(registro);
    setShowDetailModal(true);
  };

  const getUserName = (id) => {
    const user = usuarios.find(u => u.idusuario === id);
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido';
  };

  const getAccionColor = (accion) => {
    switch (accion?.toUpperCase()) {
      case 'INSERT': return 'text-green-400';
      case 'UPDATE': return 'text-yellow-400';
      case 'DELETE': return 'text-red-400';
      default: return 'text-gym-gray';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredHistorial = historial.filter(item => {
    const search = searchTerm.toLowerCase();
    const matchSearch = 
      getUserName(item.idusuario).toLowerCase().includes(search) ||
      item.tablaafectada?.toLowerCase().includes(search) ||
      item.accion?.toLowerCase().includes(search);
    return matchSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistorial.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredHistorial.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando historial...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <History className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-2xl font-bold text-gym-white tracking-tight">Historial de Cambios</h1>
            <p className="text-gym-gray text-sm hidden sm:block">Auditoría de las acciones realizadas en el sistema</p>
          </div>
        </div>
        <button
          onClick={loadHistorial}
          className="bg-gym-dark border border-gym-gray/20 text-gym-gray-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-gym-card transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gym-gray-light" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>
          <select
            value={filterUsuario}
            onChange={(e) => setFilterUsuario(e.target.value)}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todos los usuarios</option>
            {usuarios.map((user) => (
              <option key={user.idusuario} value={user.idusuario}>
                {user.nombre} {user.apellido}
              </option>
            ))}
          </select>
          <select
            value={filterTabla}
            onChange={(e) => setFilterTabla(e.target.value)}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todas las tablas</option>
            <option value="Usuarios">Usuarios</option>
            <option value="Maquinas">Máquinas</option>
            <option value="Membresias">Membresías</option>
            <option value="Pagos">Pagos</option>
            <option value="Configuracion">Configuración</option>
            <option value="Accesos">Accesos</option>
          </select>
          <select
            value={filterAccion}
            onChange={(e) => setFilterAccion(e.target.value)}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todas las acciones</option>
            <option value="INSERT">Creación</option>
            <option value="UPDATE">Actualización</option>
            <option value="DELETE">Eliminación</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 w-full justify-center"
            >
              <Filter className="w-4 h-4" /> Filtrar
            </button>
            <button
              onClick={clearFilters}
              className="bg-gym-dark border border-gym-gray/20 text-gym-gray-light px-4 py-2 rounded-lg text-sm font-medium hover:bg-gym-card transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gym-neon" />
            <h3 className="text-lg font-semibold text-gym-white">Registros</h3>
            <span className="px-2 py-0.5 bg-gym-neon/10 text-gym-neon rounded-md text-xs font-bold">
              {historial.length}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gym-gray/10">
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Fecha</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Usuario</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden sm:table-cell">Tabla</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden md:table-cell">Registro</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Acción</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => (
                  <tr key={item.idhistorial} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 px-3 text-gym-gray-light text-xs whitespace-nowrap">
                      {formatFecha(item.fecha)}
                    </td>
                    <td className="py-2.5 px-3 text-gym-white">{getUserName(item.idusuario)}</td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden sm:table-cell">{item.tablaafectada}</td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden md:table-cell">#{item.idregistroafectado}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-medium ${getAccionColor(item.accion)}`}>
                        {item.accion === 'INSERT' ? 'Creación' : item.accion === 'UPDATE' ? 'Actualización' : item.accion === 'DELETE' ? 'Eliminación' : item.accion}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => openDetailModal(item)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-400/10"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gym-gray">
                    No hay registros de historial
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredHistorial.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gym-gray/10">
            <span className="text-gym-gray-light text-xs">
              Mostrando {indexOfFirstItem + 1} al {Math.min(indexOfLastItem, filteredHistorial.length)} de {filteredHistorial.length} registros
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPage === 1 
                    ? 'text-gym-gray/30 cursor-not-allowed' 
                    : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
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
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-gym-neon/10 text-gym-neon border border-gym-neon/30'
                        : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-gym-gray/30 cursor-not-allowed' 
                    : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Detalles */}
      {showDetailModal && selectedRegistro && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-2xl w-full border border-gym-gray/10 max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gym-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gym-neon" />
                  Detalles del Cambio
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gym-gray hover:text-gym-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gym-dark rounded-lg p-3">
                    <p className="text-xs text-gym-gray-light">Usuario</p>
                    <p className="text-gym-white font-medium">{getUserName(selectedRegistro.idusuario)}</p>
                  </div>
                  <div className="bg-gym-dark rounded-lg p-3">
                    <p className="text-xs text-gym-gray-light">Fecha</p>
                    <p className="text-gym-white font-medium">{formatFecha(selectedRegistro.fecha)}</p>
                  </div>
                  <div className="bg-gym-dark rounded-lg p-3">
                    <p className="text-xs text-gym-gray-light">Tabla</p>
                    <p className="text-gym-white font-medium">{selectedRegistro.tablaafectada}</p>
                  </div>
                  <div className="bg-gym-dark rounded-lg p-3">
                    <p className="text-xs text-gym-gray-light">Registro ID</p>
                    <p className="text-gym-white font-medium">#{selectedRegistro.idregistroafectado}</p>
                  </div>
                  <div className="bg-gym-dark rounded-lg p-3 col-span-2">
                    <p className="text-xs text-gym-gray-light">Acción</p>
                    <span className={`text-sm font-medium ${getAccionColor(selectedRegistro.accion)}`}>
                      {selectedRegistro.accion === 'INSERT' ? 'Creación' : selectedRegistro.accion === 'UPDATE' ? 'Actualización' : selectedRegistro.accion === 'DELETE' ? 'Eliminación' : selectedRegistro.accion}
                    </span>
                  </div>
                  {selectedRegistro.ip && (
                    <div className="bg-gym-dark rounded-lg p-3 col-span-2">
                      <p className="text-xs text-gym-gray-light">IP</p>
                      <p className="text-gym-white font-mono text-sm">{selectedRegistro.ip}</p>
                    </div>
                  )}
                </div>

                {/* Datos anteriores y nuevos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRegistro.datosanteriores && (
                    <div className="bg-gym-dark rounded-lg p-3">
                      <p className="text-xs text-gym-gray-light font-semibold mb-2">Datos Anteriores</p>
                      <pre className="text-xs text-gym-white overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(selectedRegistro.datosanteriores, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedRegistro.datosnuevos && (
                    <div className="bg-gym-dark rounded-lg p-3">
                      <p className="text-xs text-gym-gray-light font-semibold mb-2">Datos Nuevos</p>
                      <pre className="text-xs text-gym-white overflow-x-auto whitespace-pre-wrap break-all">
                        {JSON.stringify(selectedRegistro.datosnuevos, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4 pt-4 border-t border-gym-gray/10">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gym-dark border border-gym-gray/20 text-gym-gray-light px-6 py-2 rounded-lg hover:bg-gym-card transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialCambios;