// src/pages/entrenador/RutinasEntrenador.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Search,
  Plus,
  Edit,
  Eye,
  ArrowLeft,
  X,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Users,
  FileText,
  Tag,
  Trash2,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import authService from '../../services/authService';
import rutinaService from '../../services/rutinaService';
import userService from '../../services/userService';
import ejercicioService from '../../services/ejercicioService';
import entrenadosService from '../../services/entrenadosService';

const RutinasEntrenador = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [rutinas, setRutinas] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // ✅ Agregar estado de usuarios
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [showAsignarModal, setShowAsignarModal] = useState(false);
  const [rutinaSeleccionada, setRutinaSeleccionada] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState('');
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0]);
  const [loadingAsignar, setLoadingAsignar] = useState(false);
  const [asignaciones, setAsignaciones] = useState([]);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 4) {
      navigate('/dashboard');
      return;
    }
    setUser(currentUser);
    loadData(currentUser.idusuario);
  }, [navigate]);

  const loadData = async (userId) => {
    setLoading(true);
    setError('');
    try {
      // 1. Obtener todas las rutinas
      const rutinasData = await rutinaService.getAll();
      const rutinasArray = Array.isArray(rutinasData) ? rutinasData : [];
      setRutinas(rutinasArray);

      // 2. Obtener ejercicios
      const ejerciciosData = await ejercicioService.getAll();
      setEjercicios(Array.isArray(ejerciciosData) ? ejerciciosData : []);

      // 3. Obtener clientes asignados
      const clientesData = await entrenadosService.getByEntrenador(userId);
      let clientesArray = [];
      if (clientesData) {
        if (clientesData.alumnos && Array.isArray(clientesData.alumnos)) {
          clientesArray = clientesData.alumnos;
        } else if (Array.isArray(clientesData)) {
          clientesArray = clientesData;
        }
      }
      setClientes(clientesArray);

      // 4. Obtener todos los usuarios para nombres
      const usuariosData = await userService.getAll();
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);

      // 5. Obtener asignaciones
      const asignacionesData = await rutinaService.getAsignaciones();
      setAsignaciones(Array.isArray(asignacionesData) ? asignacionesData : []);

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar las rutinas');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNCIÓN PARA OBTENER NOMBRE DEL CLIENTE
  const getNombreCliente = (id) => {
    const user = usuarios.find(u => u.idusuario === id);
    return user ? `${user.nombre} ${user.apellido}` : 'Cliente desconocido';
  };

  const contarClientesConRutina = (idRutina) => {
    return asignaciones.filter(a => a.idrutina === idRutina && a.activo === true).length;
  };

  const filteredRutinas = rutinas.filter(r => {
    const search = searchTerm.toLowerCase().trim();
    const matchSearch = !search || 
      r.nombre?.toLowerCase().includes(search) ||
      r.descripcion?.toLowerCase().includes(search);
    
    const matchActivo = filterActivo !== '' ? 
      (filterActivo === 'activo' ? r.activo === true : r.activo === false) : 
      true;
    
    return matchSearch && matchActivo;
  });

  const totalPages = Math.ceil(filteredRutinas.length / itemsPerPage);
  const currentItems = filteredRutinas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAsignar = (rutina) => {
    setRutinaSeleccionada(rutina);
    setClienteSeleccionado('');
    setFechaInicio(new Date().toISOString().split('T')[0]);
    setShowAsignarModal(true);
    setError('');
    setSuccess('');
  };

    const handleAsignar = async () => {
    if (!clienteSeleccionado) {
        setError('Selecciona un cliente');
        return;
    }

    setLoadingAsignar(true);
    setError('');
    setSuccess('');

    try {
        // ✅ CORREGIDO: camelCase como espera el backend
        const data = {
        idUsuario: parseInt(clienteSeleccionado),
        idRutina: rutinaSeleccionada.idrutina,
        idEntrenador: user.idusuario,
        fechaAsignacion: new Date().toISOString().split('T')[0],
        fechaInicio: fechaInicio,
        fechaFin: null,
        activo: true
        };

        console.log('📤 Asignando rutina:', JSON.stringify(data, null, 2));

        await rutinaService.asignarRutina(data);
        setSuccess('Rutina asignada correctamente');
        
        setTimeout(() => {
        setShowAsignarModal(false);
        loadData(user.idusuario);
        setLoadingAsignar(false);
        }, 1500);
        
    } catch (err) {
        console.error('❌ Error al asignar rutina:', err);
        console.error('❌ Respuesta del servidor:', err.response?.data);
        setError(err.response?.data?.error || 'Error al asignar rutina');
        setLoadingAsignar(false);
    }
    };

  const handleEliminar = async (idRutina) => {
    if (!window.confirm('¿Estás seguro de eliminar esta rutina?')) return;
    
    const tieneAsignaciones = asignaciones.some(a => a.idrutina === idRutina && a.activo === true);
    if (tieneAsignaciones) {
      setError('No se puede eliminar una rutina que está asignada a clientes');
      return;
    }

    try {
      await rutinaService.delete(idRutina);
      setSuccess('Rutina eliminada correctamente');
      loadData(user.idusuario);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar rutina');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando rutinas...</div>
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
              <FileText className="w-6 h-6 text-orange-400" />
              Mis Rutinas
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">Crea y gestiona tus rutinas de entrenamiento</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#9A9AA0] font-mono">
            {rutinas.length} rutinas
          </span>
          <button
            onClick={() => navigate('/entrenador/rutinas/crear')}
            className="px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl text-xs font-bold hover:bg-orange-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,107,53,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Nueva Rutina
          </button>
        </div>
      </div>

      {/* MENSAJES */}
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

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9A9AA0]" />
          <input
            type="text"
            placeholder="Buscar rutina por nombre o descripción..."
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
          <option value="activo">Activas</option>
          <option value="inactivo">Inactivas</option>
        </select>
      </div>

      {/* GRID DE RUTINAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Dumbbell className="w-12 h-12 text-[#9A9AA0]/20 mx-auto mb-3" />
            <p className="text-[#9A9AA0] text-sm font-mono">
              {searchTerm || filterActivo 
                ? 'No hay rutinas que coincidan con los filtros' 
                : 'No has creado rutinas aún'}
            </p>
            {!searchTerm && !filterActivo && (
              <button
                onClick={() => navigate('/entrenador/rutinas/crear')}
                className="mt-3 px-4 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl text-sm hover:bg-orange-500/20 transition-colors"
              >
                Crear tu primera rutina
              </button>
            )}
          </div>
        ) : (
          currentItems.map((rutina) => {
            const clientesAsignados = contarClientesConRutina(rutina.idrutina);
            const tieneAsignaciones = clientesAsignados > 0;
            
            return (
              <div
                key={rutina.idrutina}
                className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all group"
              >
                <div className="p-4 border-b border-orange-500/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-bold text-sm truncate" title={rutina.nombre}>
                        {rutina.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          rutina.activo 
                            ? 'bg-green-500/10 text-green-400' 
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {rutina.activo ? 'Activa' : 'Inactiva'}
                        </span>
                        {rutina.duracionsemanas > 0 && (
                          <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {rutina.duracionsemanas} semanas
                          </span>
                        )}
                        {tieneAsignaciones && (
                          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Users className="w-2.5 h-2.5" />
                            {clientesAsignados}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-[#9A9AA0] text-[10px] font-mono">
                        {rutina.fechacreacion || 'Sin fecha'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {rutina.descripcion && (
                    <p className="text-[#9A9AA0] text-xs font-mono line-clamp-2">
                      {rutina.descripcion}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-orange-500/5">
                    <button
                      onClick={() => navigate(`/entrenador/rutinas/${rutina.idrutina}`)}
                      className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver
                    </button>
                    <button
                      onClick={() => navigate(`/entrenador/rutinas/editar/${rutina.idrutina}`)}
                      className="px-3 py-1.5 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-medium hover:bg-orange-500/20 transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleOpenAsignar(rutina)}
                      className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/20 transition-colors flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Asignar
                    </button>
                    {!tieneAsignaciones && (
                      <button
                        onClick={() => handleEliminar(rutina.idrutina)}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINACIÓN */}
      {filteredRutinas.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-orange-500/10">
          <span className="text-[#9A9AA0] text-[10px]">
            {((currentPage - 1) * itemsPerPage) + 1}-
            {Math.min(currentPage * itemsPerPage, filteredRutinas.length)} de {filteredRutinas.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
                  onClick={() => setCurrentPage(pageNum)}
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded-lg text-xs ${
                currentPage === totalPages
                  ? 'text-[#9A9AA0]/30 cursor-not-allowed' 
                  : 'text-[#9A9AA0] hover:bg-orange-500/10'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL ASIGNAR RUTINA */}
      {/* ============================================================ */}
      {showAsignarModal && rutinaSeleccionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-orange-400" />
                Asignar Rutina
              </h2>
              <button
                onClick={() => setShowAsignarModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-3">
                <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Rutina a asignar</p>
                <p className="text-white font-bold">{rutinaSeleccionada.nombre}</p>
              </div>

              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">
                  Cliente *
                </label>
                <select
                  value={clienteSeleccionado}
                  onChange={(e) => setClienteSeleccionado(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes
                    .filter(c => c.activo === true)
                    .map(c => {
                      const yaAsignada = asignaciones.some(a => 
                        a.idusuario === c.identrenado && 
                        a.idrutina === rutinaSeleccionada.idrutina &&
                        a.activo === true
                      );
                      return (
                        <option 
                          key={c.identrenados} 
                          value={c.identrenado}
                          disabled={yaAsignada}
                        >
                          {getNombreCliente(c.identrenado)} {yaAsignada ? '(Ya asignada)' : ''}
                        </option>
                      );
                    })}
                </select>
              </div>

              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-orange-500/10">
                <button
                  onClick={() => setShowAsignarModal(false)}
                  className="flex-1 px-4 py-2 bg-[#0A0A0B] border border-orange-500/10 text-[#9A9AA0] rounded-xl hover:bg-orange-500/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAsignar}
                  disabled={loadingAsignar || !clienteSeleccionado}
                  className="flex-1 px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl font-medium hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingAsignar ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin"></span>
                      Asignando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Asignar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RutinasEntrenador;