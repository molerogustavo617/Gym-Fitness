// src/pages/admin/Rutinas.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,
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
  Save
} from 'lucide-react';
import rutinaService from '../../services/rutinaService';
import ejercicioService from '../../services/ejercicioService';
import authService from '../../services/authService';

const Rutinas = () => {
  const [rutinas, setRutinas] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [dias, setDias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEjercicioModal, setShowEjercicioModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRutina, setSelectedRutina] = useState(null);
  const [selectedRutinaEjercicio, setSelectedRutinaEjercicio] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [rutinaEjercicios, setRutinaEjercicios] = useState([]);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    duracionSemanas: 4,
    activo: true
  });

  const [ejercicioForm, setEjercicioForm] = useState({
    idDia: '',
    idEjercicio: '',
    series: 3,
    repeticiones: '12',
    peso_sugerido: 0,
    descansoSegundos: 60,
    orden: 1
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
      const [rutinasData, ejerciciosData, diasData] = await Promise.all([
        rutinaService.getAll(),
        ejercicioService.getAll(),
        rutinaService.getDias()
      ]);
      setRutinas(Array.isArray(rutinasData) ? rutinasData : []);
      setEjercicios(Array.isArray(ejerciciosData) ? ejerciciosData : []);
      setDias(Array.isArray(diasData) ? diasData : []);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('❌ Error loadData:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRutinas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await rutinaService.getAll();
      setRutinas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar las rutinas');
      console.error('❌ Error loadRutinas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRutinaEjercicios = async (idRutina) => {
    try {
      const data = await rutinaService.getEjerciciosByRutina(idRutina);
      setRutinaEjercicios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar ejercicios de la rutina:', err);
      setRutinaEjercicios([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEjercicioChange = (e) => {
    const { name, value } = e.target;
    setEjercicioForm({
      ...ejercicioForm,
      [name]: value
    });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      nombre: '',
      descripcion: '',
      duracionSemanas: 4,
      activo: true
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (rutina) => {
    setIsEditing(true);
    setSelectedRutina(rutina);
    setFormData({
      nombre: rutina.nombre || '',
      descripcion: rutina.descripcion || '',
      duracionSemanas: rutina.duracionsemanas || 4,
      activo: rutina.activo !== undefined ? rutina.activo : true
    });
    loadRutinaEjercicios(rutina.idrutina);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (rutina) => {
    setSelectedRutina(rutina);
    setShowDeleteModal(true);
  };

  const openEjercicioModal = (rutina) => {
    setSelectedRutina(rutina);
    setEjercicioForm({
      idDia: '',
      idEjercicio: '',
      series: 3,
      repeticiones: '12',
      peso_sugerido: 0,
      descansoSegundos: 60,
      orden: rutinaEjercicios.length + 1
    });
    setShowEjercicioModal(true);
    loadRutinaEjercicios(rutina.idrutina);
  };

  // ============================================================
  // ✅ HANDLE SUBMIT CORREGIDO - CON idUsuario (camelCase)
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const currentUser = authService.getCurrentUser();
      
      // ✅ Verificar que el usuario esté autenticado
      if (!currentUser) {
        setError('No hay usuario autenticado');
        setLoading(false);
        return;
      }

      // ✅ Validar campos obligatorios
      if (!formData.nombre.trim()) {
        setError('El nombre de la rutina es obligatorio');
        setLoading(false);
        return;
      }

      // ✅ CORREGIDO: idUsuario (camelCase) como espera el backend
      const dataToSend = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion || '',
        duracionSemanas: parseInt(formData.duracionSemanas) || 4,
        activo: formData.activo !== undefined ? formData.activo : true,
        idUsuario: currentUser.idusuario  // 🔥 ¡CAMBIADO a idUsuario!
      };

      console.log('📤 Datos a enviar:', JSON.stringify(dataToSend, null, 2));

      if (isEditing) {
        await rutinaService.update(selectedRutina.idrutina, dataToSend);
        setSuccess('Rutina actualizada correctamente');
        setShowModal(false);
        loadRutinas();
      } else {
        const response = await rutinaService.create(dataToSend);
        setSuccess('Rutina creada correctamente');
        const rutinaCreada = response.data || response;
        setSelectedRutina(rutinaCreada);
        setTimeout(() => {
          setShowModal(false);
          openEjercicioModal(rutinaCreada);
        }, 500);
        return;
      }
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      console.error('❌ Respuesta del servidor:', err.response?.data);
      console.error('❌ Status:', err.response?.status);
      
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.message || 
                       err.response?.data?.detail ||
                       'Error al guardar la rutina';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ HANDLE ADD EJERCICIO CORREGIDO
  // ============================================================
  const handleAddEjercicio = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // ✅ Validar campos obligatorios
      if (!ejercicioForm.idDia) {
        setError('Selecciona un día');
        setLoading(false);
        return;
      }
      if (!ejercicioForm.idEjercicio) {
        setError('Selecciona un ejercicio');
        setLoading(false);
        return;
      }

      const dataToSend = {
        idRutina: selectedRutina.idrutina,
        idDia: parseInt(ejercicioForm.idDia),
        idEjercicio: parseInt(ejercicioForm.idEjercicio),
        series: parseInt(ejercicioForm.series) || 0,
        repeticiones: ejercicioForm.repeticiones || '0',
        peso_sugerido: parseFloat(ejercicioForm.peso_sugerido) || 0,
        descansoSegundos: parseInt(ejercicioForm.descansoSegundos) || 0,
        orden: parseInt(ejercicioForm.orden) || 0
      };

      console.log('📤 Ejercicio a agregar:', JSON.stringify(dataToSend, null, 2));

      await rutinaService.addEjercicio(dataToSend);
      setSuccess('Ejercicio agregado a la rutina');
      loadRutinaEjercicios(selectedRutina.idrutina);
      
      setEjercicioForm({
        ...ejercicioForm,
        idDia: '',
        idEjercicio: '',
        orden: rutinaEjercicios.length + 1
      });
    } catch (err) {
      console.error('❌ Error al agregar ejercicio:', err);
      console.error('❌ Respuesta del servidor:', err.response?.data);
      setError(err.response?.data?.error || 'Error al agregar el ejercicio');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveEjercicio = async (idRutinaEjercicio) => {
    if (!window.confirm('¿Eliminar este ejercicio de la rutina?')) return;
    
    try {
      await rutinaService.removeEjercicio(idRutinaEjercicio);
      setSuccess('Ejercicio eliminado de la rutina');
      loadRutinaEjercicios(selectedRutina.idrutina);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el ejercicio');
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await rutinaService.delete(selectedRutina.idrutina);
      setSuccess('Rutina eliminada correctamente');
      setShowDeleteModal(false);
      loadRutinas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const getDiaNombre = (idDia) => {
    const dia = dias.find(d => d.iddia === idDia);
    return dia ? dia.nombre : 'Sin día';
  };

  const getEjercicioNombre = (idEjercicio) => {
    const ejercicio = ejercicios.find(e => e.idejercicio === idEjercicio);
    return ejercicio ? ejercicio.nombre : 'Sin ejercicio';
  };

  const getEstadoColor = (activo) => {
    return activo ? 'text-green-400' : 'text-red-400';
  };

  const filteredRutinas = rutinas.filter(rutina => {
    const search = searchTerm.toLowerCase();
    return (
      rutina.nombre?.toLowerCase().includes(search) ||
      rutina.descripcion?.toLowerCase().includes(search)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRutinas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRutinas.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading && rutinas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando rutinas...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-5 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gym-white tracking-tight">Rutinas</h1>
            <p className="text-gym-gray text-sm hidden sm:block">Gestiona las rutinas de entrenamiento</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nueva Rutina
        </button>
      </div>

      {/* Mensajes */}
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

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gym-gray-light" />
        <input
          type="text"
          placeholder="Buscar rutina por nombre o descripción..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-9 pr-4 py-2.5 bg-gym-dark-secondary rounded-lg border border-gym-gray/20 text-gym-white text-sm placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors"
        />
      </div>

      {/* Tabla */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead>
              <tr className="border-b border-gym-gray/10 bg-gym-card/20">
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Nombre</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Descripción</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Duración</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Estado</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-center">Ejercicios</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gym-gray text-sm">
                    No hay rutinas que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                currentItems.map((rutina) => (
                  <tr key={rutina.idrutina} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="text-gym-white font-medium whitespace-nowrap">
                        {rutina.nombre}
                      </p>
                    </td>
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <p className="text-gym-gray-light truncate">
                        {rutina.descripcion || '-'}
                      </p>
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="text-gym-gray-light whitespace-nowrap">
                        {rutina.duracionsemanas || 4} sem.
                      </p>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-medium ${getEstadoColor(rutina.activo)}`}>
                        {rutina.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => openEjercicioModal(rutina)}
                        className="text-gym-neon hover:text-gym-neon/80 transition-colors text-sm flex items-center gap-1 mx-auto"
                      >
                        <Eye className="w-4 h-4" /> Ver
                      </button>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(rutina)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gym-gray-light hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEjercicioModal(rutina)}
                          className="p-1.5 rounded-lg hover:bg-gym-neon/10 text-gym-gray-light hover:text-gym-neon transition-colors"
                          title="Agregar ejercicios"
                        >
                          <Dumbbell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(rutina)}
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

        {/* Paginación */}
        {filteredRutinas.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gym-gray/10">
            <span className="text-gym-gray text-sm">
              {filteredRutinas.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, filteredRutinas.length)} de {filteredRutinas.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-lg text-sm ${
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
                    className={`w-8 h-8 rounded-lg text-sm font-medium ${
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
                className={`px-3 py-1 rounded-lg text-sm ${
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
      {/* MODAL CREAR/EDITAR RUTINA */}
      {/* ============================================================ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gym-gray/10">
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gym-white flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-gym-neon" />
                  {isEditing ? 'Editar Rutina' : 'Nueva Rutina'}
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
                <div>
                  <label className="text-gym-gray-light text-sm font-medium block mb-1.5">Nombre *</label>
                  <input
                    name="nombre"
                    type="text"
                    placeholder="Ej. Rutina Fuerza Principiante"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm font-medium block mb-1.5">Descripción</label>
                  <textarea
                    name="descripcion"
                    placeholder="Describe los objetivos y características de la rutina..."
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm font-medium block mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1" /> Duración (semanas)
                  </label>
                  <input
                    name="duracionSemanas"
                    type="number"
                    min="1"
                    max="52"
                    value={formData.duracionSemanas}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    name="activo"
                    type="checkbox"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="w-4 h-4 bg-gym-dark border-gym-gray/20 rounded text-gym-neon focus:ring-gym-neon/50"
                  />
                  <label className="text-gym-gray-light text-sm font-medium">Rutina activa</label>
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
                      isEditing ? 'Actualizar' : 'Crear'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL AGREGAR EJERCICIOS */}
      {/* ============================================================ */}
      {showEjercicioModal && selectedRutina && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gym-gray/10">
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-xl font-bold text-gym-white flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-gym-neon" />
                    Ejercicios: <span className="text-gym-neon">{selectedRutina.nombre}</span>
                  </h2>
                  <p className="text-gym-gray text-sm">Agrega ejercicios con días, series y repeticiones</p>
                </div>
                <button
                  onClick={() => {
                    setShowEjercicioModal(false);
                    loadRutinas();
                  }}
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

              {/* Formulario para agregar ejercicios */}
              <form onSubmit={handleAddEjercicio} className="bg-gym-dark/50 rounded-xl p-4 mb-5 border border-gym-gray/10">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1">Día</label>
                    <select
                      name="idDia"
                      value={ejercicioForm.idDia}
                      onChange={handleEjercicioChange}
                      className="w-full px-3 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    >
                      <option value="">Seleccionar</option>
                      {dias.map((dia) => (
                        <option key={dia.iddia} value={dia.iddia}>
                          {dia.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1">Ejercicio</label>
                    <select
                      name="idEjercicio"
                      value={ejercicioForm.idEjercicio}
                      onChange={handleEjercicioChange}
                      className="w-full px-3 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    >
                      <option value="">Seleccionar</option>
                      {ejercicios.map((ej) => (
                        <option key={ej.idejercicio} value={ej.idejercicio}>
                          {ej.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1">Series</label>
                    <input
                      name="series"
                      type="number"
                      min="1"
                      max="10"
                      value={ejercicioForm.series}
                      onChange={handleEjercicioChange}
                      className="w-full px-3 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1">Repeticiones</label>
                    <input
                      name="repeticiones"
                      type="text"
                      placeholder="Ej. 12"
                      value={ejercicioForm.repeticiones}
                      onChange={handleEjercicioChange}
                      className="w-full px-3 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1">Peso (kg)</label>
                    <input
                      name="peso_sugerido"
                      type="number"
                      step="0.5"
                      min="0"
                      value={ejercicioForm.peso_sugerido}
                      onChange={handleEjercicioChange}
                      className="w-full px-3 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-medium block mb-1">
                      <Clock className="w-3.5 h-3.5 inline mr-1" /> Descanso (s)
                    </label>
                    <input
                      name="descansoSegundos"
                      type="number"
                      min="0"
                      max="300"
                      value={ejercicioForm.descansoSegundos}
                      onChange={handleEjercicioChange}
                      className="w-full px-3 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gym-neon text-gym-dark px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-gym-dark border-t-transparent rounded-full animate-spin"></span>
                        Agregando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" /> Agregar Ejercicio
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Lista de ejercicios agregados */}
              <div>
                <h3 className="text-gym-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-gym-neon" />
                  Ejercicios en esta rutina ({rutinaEjercicios.length})
                </h3>
                {rutinaEjercicios.length === 0 ? (
                  <p className="text-gym-gray text-center py-6">No hay ejercicios agregados aún.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gym-gray/10">
                          <th className="text-left py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">#</th>
                          <th className="text-left py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Día</th>
                          <th className="text-left py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Ejercicio</th>
                          <th className="text-center py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Series</th>
                          <th className="text-center py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Reps</th>
                          <th className="text-center py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Peso</th>
                          <th className="text-center py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Descanso</th>
                          <th className="text-center py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rutinaEjercicios.map((item, index) => (
                          <tr key={item.idrutinaejercicio} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                            <td className="py-2 px-3 text-gym-gray-light">{index + 1}</td>
                            <td className="py-2 px-3 text-gym-white">{getDiaNombre(item.iddia)}</td>
                            <td className="py-2 px-3 text-gym-white">{getEjercicioNombre(item.idejercicio)}</td>
                            <td className="py-2 px-3 text-gym-gray-light text-center">{item.series}</td>
                            <td className="py-2 px-3 text-gym-gray-light text-center">{item.repeticiones}</td>
                            <td className="py-2 px-3 text-gym-gray-light text-center">{item.pesosugerido || 0} kg</td>
                            <td className="py-2 px-3 text-gym-gray-light text-center">{item.descansosegundos || 0}s</td>
                            <td className="py-2 px-3 text-center">
                              <button
                                onClick={() => handleRemoveEjercicio(item.idrutinaejercicio)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-400/10"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL ELIMINAR */}
      {/* ============================================================ */}
      {showDeleteModal && selectedRutina && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-sm w-full border border-gym-gray/10">
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-bold text-gym-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Eliminar Rutina
              </h2>
              <p className="text-gym-gray-light text-sm mt-2 mb-4">
                ¿Estás seguro de que deseas eliminar la rutina 
                <span className="text-gym-white font-medium"> {selectedRutina.nombre}</span>?
              </p>
              <p className="text-yellow-400 text-sm mb-5 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Esta acción eliminará todos los ejercicios asociados.
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

export default Rutinas;