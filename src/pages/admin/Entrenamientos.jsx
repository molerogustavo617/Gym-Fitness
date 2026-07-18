// src/pages/admin/Entrenamientos.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Calendar,
  Clock,
  Dumbbell,
  Eye,
  Save,
  User,
  Weight,
  Repeat,
  FileText,
  Users,
  Activity
} from 'lucide-react';
import entrenamientoService from '../../services/entrenamientoService';
import ejercicioService from '../../services/ejercicioService';
import rutinaService from '../../services/rutinaService';
import userService from '../../services/userService';
import authService from '../../services/authService';

const Entrenamientos = () => {
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEntrenamiento, setSelectedEntrenamiento] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterCompletado, setFilterCompletado] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    idUsuario: '',
    idEjercicio: '',
    idAsignacion: '',
    idEntrenador: '',
    repeticiones: '',
    peso: '',
    fecha: new Date().toISOString().split('T')[0],
    completado: true,
    notas: ''
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 1) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [entrenamientosData, usuariosData, ejerciciosData, asignacionesData] = await Promise.all([
        entrenamientoService.getAll(),
        userService.getAll(),
        ejercicioService.getAll(),
        rutinaService.getAsignaciones()
      ]);
      setEntrenamientos(Array.isArray(entrenamientosData) ? entrenamientosData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setEjercicios(Array.isArray(ejerciciosData) ? ejerciciosData : []);
      setAsignaciones(Array.isArray(asignacionesData) ? asignacionesData : []);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('❌ Error loadData:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadEntrenamientos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await entrenamientoService.getAll();
      setEntrenamientos(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar los entrenamientos');
      console.error('❌ Error loadEntrenamientos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      idUsuario: '',
      idEjercicio: '',
      idAsignacion: '',
      idEntrenador: '',
      repeticiones: '',
      peso: '',
      fecha: new Date().toISOString().split('T')[0],
      completado: true,
      notas: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (entrenamiento) => {
    setIsEditing(true);
    setSelectedEntrenamiento(entrenamiento);
    setFormData({
      idUsuario: entrenamiento.idusuario || '',
      idEjercicio: entrenamiento.idejercicio || '',
      idAsignacion: entrenamiento.idasignacion || '',
      idEntrenador: entrenamiento.identrenador || '',
      repeticiones: entrenamiento.repeticiones || '',
      peso: entrenamiento.peso || '',
      fecha: entrenamiento.fecha ? entrenamiento.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
      completado: entrenamiento.completado !== undefined ? entrenamiento.completado : true,
      notas: entrenamiento.notas || ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (entrenamiento) => {
    setSelectedEntrenamiento(entrenamiento);
    setShowDeleteModal(true);
  };

  // ============================================================
  // ✅ HANDLE SUBMIT CORREGIDO - Campos en camelCase
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const currentUser = authService.getCurrentUser();

      // ✅ Validar campos obligatorios
      if (!formData.idUsuario) {
        setError('Debes seleccionar un cliente');
        setLoading(false);
        return;
      }
      if (!formData.idEjercicio) {
        setError('Debes seleccionar un ejercicio');
        setLoading(false);
        return;
      }
      if (!formData.repeticiones || parseInt(formData.repeticiones) <= 0) {
        setError('Las repeticiones son obligatorias y deben ser mayores a 0');
        setLoading(false);
        return;
      }

      // ✅ CORREGIDO: Campos en camelCase como espera el backend
      const dataToSend = {
        idUsuario: parseInt(formData.idUsuario),
        idEjercicio: parseInt(formData.idEjercicio),
        idAsignacion: formData.idAsignacion ? parseInt(formData.idAsignacion) : null,
        idEntrenador: formData.idEntrenador ? parseInt(formData.idEntrenador) : (currentUser?.idusuario || null),
        repeticiones: parseInt(formData.repeticiones),
        peso: formData.peso ? parseFloat(formData.peso) : null,
        fecha: formData.fecha || new Date().toISOString().split('T')[0],
        completado: formData.completado !== undefined ? formData.completado : true,
        notas: formData.notas || null
      };

      console.log('📤 Datos a enviar:', JSON.stringify(dataToSend, null, 2));

      if (isEditing) {
        await entrenamientoService.update(selectedEntrenamiento.identrenamiento, dataToSend);
        setSuccess('Entrenamiento actualizado correctamente');
      } else {
        await entrenamientoService.create(dataToSend);
        setSuccess('Entrenamiento registrado correctamente');
      }

      setShowModal(false);
      loadEntrenamientos();
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      console.error('❌ Respuesta del servidor:', err.response?.data);
      setError(err.response?.data?.error || 'Error al guardar el entrenamiento');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await entrenamientoService.delete(selectedEntrenamiento.identrenamiento);
      setSuccess('Entrenamiento eliminado correctamente');
      setShowDeleteModal(false);
      loadEntrenamientos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el entrenamiento');
    } finally {
      setLoading(false);
    }
  };

  const getUsuarioNombre = (id) => {
    const user = usuarios.find(u => u.idusuario === id);
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido';
  };

  const getEjercicioNombre = (id) => {
    const ejercicio = ejercicios.find(e => e.idejercicio === id);
    return ejercicio ? ejercicio.nombre : 'Ejercicio desconocido';
  };

  const getEntrenadorNombre = (id) => {
    const user = usuarios.find(u => u.idusuario === id);
    return user ? `${user.nombre} ${user.apellido}` : 'Sin entrenador';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredEntrenamientos = Array.isArray(entrenamientos) ? entrenamientos.filter(entrenamiento => {
    const search = searchTerm.toLowerCase();
    const matchUsuario = getUsuarioNombre(entrenamiento.idusuario).toLowerCase().includes(search);
    const matchEjercicio = getEjercicioNombre(entrenamiento.idejercicio).toLowerCase().includes(search);
    const matchNotas = entrenamiento.notas?.toLowerCase().includes(search) || false;
    
    let matchFilterUsuario = true;
    let matchFilterCompletado = true;
    
    if (filterUsuario) {
      matchFilterUsuario = entrenamiento.idusuario === parseInt(filterUsuario);
    }
    if (filterCompletado !== '') {
      matchFilterCompletado = entrenamiento.completado === (filterCompletado === 'true');
    }
    
    return (matchUsuario || matchEjercicio || matchNotas) && matchFilterUsuario && matchFilterCompletado;
  }) : [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEntrenamientos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEntrenamientos.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading && entrenamientos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando entrenamientos...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gym-white tracking-tight">Entrenamientos</h1>
            <p className="text-gym-gray text-xs md:text-sm hidden sm:block">Gestiona el historial de entrenamientos</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Registrar Entrenamiento
        </button>
      </div>

      {/* MENSAJES */}
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

      {/* FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gym-gray-light" />
          <input
            type="text"
            placeholder="Buscar por cliente, ejercicio o notas..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-gym-dark-secondary rounded-lg border border-gym-gray/20 text-gym-white text-sm placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors"
          />
        </div>
        <select
          value={filterUsuario}
          onChange={(e) => {
            setFilterUsuario(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2.5 bg-gym-dark-secondary rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
        >
          <option value="">Todos los clientes</option>
          {usuarios.filter(u => u.idrol === 3).map((user) => (
            <option key={user.idusuario} value={user.idusuario}>
              {user.nombre} {user.apellido}
            </option>
          ))}
        </select>
        <select
          value={filterCompletado}
          onChange={(e) => {
            setFilterCompletado(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2.5 bg-gym-dark-secondary rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
        >
          <option value="">Todos los estados</option>
          <option value="true">Completados</option>
          <option value="false">Pendientes</option>
        </select>
      </div>

      {/* TABLA */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-gym-gray/10 bg-gym-card/20">
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Fecha</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Cliente</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Ejercicio</th>
                <th className="text-center py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Reps</th>
                <th className="text-center py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Peso</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Entrenador</th>
                <th className="text-center py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Estado</th>
                <th className="text-center py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gym-gray text-sm">
                    No hay entrenamientos registrados
                  </td>
                </tr>
              ) : (
                currentItems.map((entrenamiento) => (
                  <tr key={entrenamiento.identrenamiento} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="text-gym-white text-sm whitespace-nowrap">
                        {formatFecha(entrenamiento.fecha)}
                      </p>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="text-gym-white font-medium whitespace-nowrap">
                        {getUsuarioNombre(entrenamiento.idusuario)}
                      </p>
                    </td>
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      <p className="text-gym-gray-light truncate max-w-[120px]">
                        {getEjercicioNombre(entrenamiento.idejercicio)}
                      </p>
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell text-center">
                      <span className="text-gym-gray-light font-mono">
                        {entrenamiento.repeticiones || '--'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell text-center">
                      <span className="text-gym-gray-light font-mono">
                        {entrenamiento.peso ? `${entrenamiento.peso} kg` : '--'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 hidden lg:table-cell">
                      <span className="text-gym-gray-light text-xs">
                        {entrenamiento.identrenador ? getEntrenadorNombre(entrenamiento.identrenador) : '--'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 hidden sm:table-cell text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        entrenamiento.completado
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {entrenamiento.completado ? 'Completado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(entrenamiento)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gym-gray-light hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(entrenamiento)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-gym-gray-light hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {filteredEntrenamientos.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gym-gray/10">
            <span className="text-gym-gray text-xs">
              {filteredEntrenamientos.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, filteredEntrenamientos.length)} de {filteredEntrenamientos.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded-lg text-xs ${
                  currentPage === 1 
                    ? 'text-gym-gray/30 cursor-not-allowed' 
                    : 'text-gym-gray-light hover:bg-gym-card'
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
                        ? 'bg-gym-neon/20 text-gym-neon'
                        : 'text-gym-gray-light hover:bg-gym-card'
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
                    ? 'text-gym-gray/30 cursor-not-allowed' 
                    : 'text-gym-gray-light hover:bg-gym-card'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL CREAR/EDITAR */}
      {/* ============================================================ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gym-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gym-neon" />
                  {isEditing ? 'Editar Entrenamiento' : 'Registrar Entrenamiento'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gym-gray hover:text-gym-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                  <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1.5 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Cliente *
                    </label>
                    <select
                      name="idUsuario"
                      value={formData.idUsuario}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    >
                      <option value="">Seleccionar cliente</option>
                      {usuarios.filter(u => u.idrol === 3).map((user) => (
                        <option key={user.idusuario} value={user.idusuario}>
                          {user.nombre} {user.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1.5 flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5" /> Ejercicio *
                    </label>
                    <select
                      name="idEjercicio"
                      value={formData.idEjercicio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    >
                      <option value="">Seleccionar ejercicio</option>
                      {ejercicios.map((ej) => (
                        <option key={ej.idejercicio} value={ej.idejercicio}>
                          {ej.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Fecha *
                    </label>
                    <input
                      name="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1.5 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Entrenador
                    </label>
                    <select
                      name="idEntrenador"
                      value={formData.idEntrenador}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                    >
                      <option value="">Sin entrenador</option>
                      {usuarios.filter(u => u.idrol === 4).map((user) => (
                        <option key={user.idusuario} value={user.idusuario}>
                          {user.nombre} {user.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1.5 flex items-center gap-1">
                      <Repeat className="w-3.5 h-3.5" /> Repeticiones *
                    </label>
                    <input
                      name="repeticiones"
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Ej: 12"
                      value={formData.repeticiones}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1.5 flex items-center gap-1">
                      <Weight className="w-3.5 h-3.5" /> Peso (kg)
                    </label>
                    <input
                      name="peso"
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="Ej: 45.5"
                      value={formData.peso}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1.5 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Rutina Asignada
                    </label>
                    <select
                      name="idAsignacion"
                      value={formData.idAsignacion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                    >
                      <option value="">Sin rutina</option>
                      {asignaciones.map((asig) => (
                        <option key={asig.idasignacion} value={asig.idasignacion}>
                          ID: {asig.idasignacion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gym-gray-light text-xs font-medium block mb-1.5 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Notas
                  </label>
                  <textarea
                    name="notas"
                    placeholder="Observaciones sobre el entrenamiento..."
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    name="completado"
                    type="checkbox"
                    checked={formData.completado}
                    onChange={handleInputChange}
                    className="w-4 h-4 bg-gym-dark border-gym-gray/20 rounded text-gym-neon focus:ring-gym-neon/50"
                  />
                  <label className="text-gym-gray-light text-sm font-medium">Entrenamiento completado</label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gym-gray/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors w-full sm:w-auto"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gym-neon text-gym-dark px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-gym-dark border-t-transparent rounded-full animate-spin"></span>
                        Guardando...
                      </>
                    ) : (
                      isEditing ? 'Actualizar' : 'Registrar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL ELIMINAR */}
      {/* ============================================================ */}
      {showDeleteModal && selectedEntrenamiento && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-sm w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <h2 className="text-xl font-bold text-gym-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Eliminar Entrenamiento
              </h2>
              <p className="text-gym-gray-light text-sm mt-2 mb-4">
                ¿Estás seguro de que deseas eliminar este entrenamiento?
              </p>
              <p className="text-yellow-400 text-sm mb-5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Eliminando...
                    </>
                  ) : (
                    'Eliminar'
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

export default Entrenamientos;