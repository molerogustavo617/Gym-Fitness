// src/pages/admin/Accesos.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DoorOpen,
  DoorClosed,
  Users,
  Clock,
  Search,
  User,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle,
  X,
  UserCheck,
  Calendar
} from 'lucide-react';
import accesoService from '../../services/accesoService';
import userService from '../../services/userService';
import authService from '../../services/authService';

const Accesos = () => {
  const [accesosActivos, setAccesosActivos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterFecha, setFilterFecha] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [estadisticas, setEstadisticas] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (user.idrol !== 1 && user.idrol !== 2)) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [activos, historialData, usuariosData] = await Promise.all([
        accesoService.getActivos(),
        accesoService.getAll(),
        userService.getAll()
      ]);
      setAccesosActivos(activos);
      setHistorial(historialData);
      setUsuarios(usuariosData);
      
      // Calcular estadísticas manualmente
      const dentroAhora = activos.length;
      const hoy = new Date().toISOString().split('T')[0];
      const accesosHoy = historialData.filter(item => 
        item.fechaentrada?.split('T')[0] === hoy
      ).length;
      
      setEstadisticas({
        dentroAhora,
        accesosHoy,
        totalAccesos: historialData.length
      });
    } catch (err) {
      setError('Error al cargar los datos de accesos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (id) => {
    const user = usuarios.find(u => u.idusuario === id);
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatHora = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const calcularDuracion = (entrada, salida) => {
    if (!entrada || !salida) return '--';
    const diff = new Date(salida) - new Date(entrada);
    const horas = Math.floor(diff / 3600000);
    const minutos = Math.floor((diff % 3600000) / 60000);
    if (horas > 0) return `${horas}h ${minutos}m`;
    return `${minutos}m`;
  };

  const filteredHistorial = historial.filter(item => {
    const search = searchTerm.toLowerCase();
    const nombreUsuario = getUserName(item.idusuario).toLowerCase();
    const matchSearch = nombreUsuario.includes(search);
    const matchUsuario = filterUsuario ? item.idusuario === parseInt(filterUsuario) : true;
    const matchFecha = filterFecha ? item.fechaentrada?.split('T')[0] === filterFecha : true;
    return matchSearch && matchUsuario && matchFecha;
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
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando accesos...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <DoorOpen className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-2xl font-bold text-gym-white tracking-tight">Control de Accesos</h1>
            <p className="text-gym-gray text-sm hidden sm:block">Monitorea entradas y salidas del gimnasio</p>
          </div>
        </div>
      </div>

      {/* Error/Success */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Estadísticas rápidas */}
      {estadisticas && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4">
            <div className="flex items-center gap-2 text-gym-gray-light text-xs">Dentro ahora</div>
            <div className="text-2xl font-bold text-green-400">{estadisticas.dentroAhora}</div>
          </div>
          <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4">
            <div className="flex items-center gap-2 text-gym-gray-light text-xs">Accesos hoy</div>
            <div className="text-2xl font-bold text-gym-white">{estadisticas.accesosHoy}</div>
          </div>
          <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4">
            <div className="flex items-center gap-2 text-gym-gray-light text-xs">Total accesos</div>
            <div className="text-2xl font-bold text-gym-white">{estadisticas.totalAccesos}</div>
          </div>
        </div>
      )}

      {/* Clientes dentro */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-gym-white">Clientes dentro</h3>
          <span className="px-2 py-0.5 bg-green-400/10 text-green-400 rounded-md text-xs font-bold">
            {accesosActivos.length}
          </span>
        </div>

        {accesosActivos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gym-gray/10">
                  <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden sm:table-cell">Entrada</th>
                  <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden md:table-cell">Duración</th>
                  <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden lg:table-cell">Registrado por</th>
                </tr>
              </thead>
              <tbody>
                {accesosActivos.map((acceso) => (
                  <tr key={acceso.idacceso} className="border-b border-gym-gray/5">
                    <td className="py-2.5 px-3 text-gym-white font-medium">{getUserName(acceso.idusuario)}</td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden sm:table-cell">{formatHora(acceso.fechaentrada)}</td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden md:table-cell">
                      {calcularDuracion(acceso.fechaentrada, new Date())}
                    </td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden lg:table-cell">
                      {acceso.idusuarioregistro ? getUserName(acceso.idusuarioregistro) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gym-gray-light">
            <DoorClosed className="w-12 h-12 text-gym-gray/30 mx-auto mb-3" />
            <p>No hay clientes dentro del gimnasio</p>
          </div>
        )}
      </div>

      {/* Historial */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-gym-neon" />
          <h3 className="text-lg font-semibold text-gym-white">Historial</h3>
          <span className="px-2 py-0.5 bg-gym-neon/10 text-gym-neon rounded-md text-xs font-bold">
            {historial.length}
          </span>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gym-gray-light" />
            <input
              type="text"
              placeholder="Buscar cliente..."
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
            onChange={(e) => {
              setFilterUsuario(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todos los usuarios</option>
            {usuarios.map((user) => (
              <option key={user.idusuario} value={user.idusuario}>
                {user.nombre} {user.apellido}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filterFecha}
            onChange={(e) => {
              setFilterFecha(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gym-gray/10">
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Fecha</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Cliente</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden sm:table-cell">Entrada</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden sm:table-cell">Salida</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden md:table-cell">Duración</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item) => {
                  const activo = !item.fechasalida;
                  return (
                    <tr key={item.idacceso} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                      <td className="py-2.5 px-3 text-gym-gray-light whitespace-nowrap">{formatFecha(item.fechaentrada)}</td>
                      <td className="py-2.5 px-3 text-gym-white font-medium">{getUserName(item.idusuario)}</td>
                      <td className="py-2.5 px-3 text-gym-gray-light hidden sm:table-cell">{formatHora(item.fechaentrada)}</td>
                      <td className="py-2.5 px-3 text-gym-gray-light hidden sm:table-cell">{formatHora(item.fechasalida)}</td>
                      <td className="py-2.5 px-3 text-gym-gray-light hidden md:table-cell">
                        {calcularDuracion(item.fechaentrada, item.fechasalida)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={activo ? 'text-green-400' : 'text-gym-gray-light'}>
                          {activo ? 'Dentro' : 'Completado'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gym-gray">
                    No hay registros de accesos
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
    </div>
  );
};

export default Accesos;