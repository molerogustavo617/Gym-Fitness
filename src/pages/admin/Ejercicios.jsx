// src/pages/admin/Ejercicios.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardList,  // ✅ Este existe en lucide-react
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
  Video,
  Image as ImageIcon,
  Save
} from 'lucide-react';
import ejercicioService from '../../services/ejercicioService';
import authService from '../../services/authService';
import maquinaService from '../../services/maquinaService';
import ImageUpload from '../../components/ImageUpload';

const Ejercicios = () => {
  const [ejercicios, setEjercicios] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEjercicio, setSelectedEjercicio] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    musculo: '',
    descripcion: '',
    repeticionesRecomendadas: '',
    idMaquina: '',
    imagenBase64: null,
    imagenUrl: '',
    videoUrl: ''
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
      const [ejerciciosData, maquinasData] = await Promise.all([
        ejercicioService.getAll(),
        maquinaService.getAll()
      ]);
      setEjercicios(ejerciciosData);
      setMaquinas(maquinasData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadEjercicios = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ejercicioService.getAll();
      setEjercicios(data);
    } catch (err) {
      setError('Error al cargar los ejercicios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (base64) => {
    setFormData({
      ...formData,
      imagenBase64: base64
    });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      nombre: '',
      musculo: '',
      descripcion: '',
      repeticionesRecomendadas: '',
      idMaquina: '',
      imagenBase64: null,
      imagenUrl: '',
      videoUrl: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (ejercicio) => {
    setIsEditing(true);
    setFormData({
      nombre: ejercicio.nombre || '',
      musculo: ejercicio.musculo || '',
      descripcion: ejercicio.descripcion || '',
      repeticionesRecomendadas: ejercicio.repeticionesrecomendadas || '',
      idMaquina: ejercicio.idmaquina || '',
      imagenBase64: null,
      imagenUrl: ejercicio.imagenurl || '',
      videoUrl: ejercicio.videourl || ''
    });
    setSelectedEjercicio(ejercicio);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (ejercicio) => {
    setSelectedEjercicio(ejercicio);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const dataToSend = {
        nombre: formData.nombre,
        musculo: formData.musculo || null,
        descripcion: formData.descripcion || null,
        repeticionesRecomendadas: formData.repeticionesRecomendadas || null,
        idMaquina: formData.idMaquina || null,
        imagenBase64: formData.imagenBase64 || null,
        videoUrl: formData.videoUrl || null
      };

      if (isEditing) {
        await ejercicioService.update(selectedEjercicio.idejercicio, dataToSend);
        setSuccess('Ejercicio actualizado correctamente');
      } else {
        await ejercicioService.create(dataToSend);
        setSuccess('Ejercicio creado correctamente');
      }

      setShowModal(false);
      loadEjercicios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el ejercicio');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await ejercicioService.delete(selectedEjercicio.idejercicio);
      setSuccess('Ejercicio eliminado correctamente');
      setShowDeleteModal(false);
      loadEjercicios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el ejercicio');
    } finally {
      setLoading(false);
    }
  };

  const filteredEjercicios = ejercicios.filter(ejercicio => {
    const search = searchTerm.toLowerCase();
    return (
      ejercicio.nombre?.toLowerCase().includes(search) ||
      ejercicio.musculo?.toLowerCase().includes(search) ||
      ejercicio.descripcion?.toLowerCase().includes(search)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEjercicios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEjercicios.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const getMaquinaNombre = (idMaquina) => {
    const maquina = maquinas.find(m => m.idmaquina === idMaquina);
    return maquina ? maquina.nombre : 'Sin máquina';
  };

  if (loading && ejercicios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando ejercicios...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-5 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gym-white tracking-tight">Ejercicios</h1>
            <p className="text-gym-gray text-sm hidden sm:block">Gestiona los ejercicios disponibles</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nuevo Ejercicio
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
          placeholder="Buscar ejercicio por nombre, músculo o descripción..."
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
          <table className="w-full text-sm min-w-[1000px]">
            <thead>
              <tr className="border-b border-gym-gray/10 bg-gym-card/20">
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Imagen</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Nombre</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Músculo</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Descripción</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Reps</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Máquina</th>
                <th className="text-left py-3 px-3 text-gym-gray font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gym-gray text-sm">
                    No hay ejercicios que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                currentItems.map((ejercicio) => (
                  <tr key={ejercicio.idejercicio} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    {/* Imagen */}
                    <td className="py-2.5 px-3">
                      {ejercicio.imagenurl ? (
                        <img
                          src={ejercicio.imagenurl}
                          alt={ejercicio.nombre}
                          className="w-11 h-11 rounded-lg object-cover border border-gym-gray/20"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-lg bg-gym-card border border-gym-gray/10 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gym-gray/40" />
                        </div>
                      )}
                    </td>
                    {/* Nombre */}
                    <td className="py-2.5 px-3">
                      <p className="text-gym-white font-medium whitespace-nowrap">
                        {ejercicio.nombre}
                      </p>
                    </td>
                    {/* Músculo */}
                    <td className="py-2.5 px-3">
                      <p className="text-gym-gray-light whitespace-nowrap">
                        {ejercicio.musculo || '-'}
                      </p>
                    </td>
                    {/* Descripción */}
                    <td className="py-2.5 px-3 max-w-[200px]">
                      <p className="text-gym-gray-light truncate">
                        {ejercicio.descripcion || '-'}
                      </p>
                    </td>
                    {/* Reps */}
                    <td className="py-2.5 px-3">
                      <p className="text-gym-gray-light whitespace-nowrap">
                        {ejercicio.repeticionesrecomendadas || '-'}
                      </p>
                    </td>
                    {/* Máquina */}
                    <td className="py-2.5 px-3">
                      <p className="text-gym-gray-light whitespace-nowrap">
                        {ejercicio.idmaquina ? getMaquinaNombre(ejercicio.idmaquina) : '-'}
                      </p>
                    </td>
                    {/* Acciones */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(ejercicio)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gym-gray-light hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(ejercicio)}
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
        {filteredEjercicios.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gym-gray/10">
            <span className="text-gym-gray text-sm">
              {filteredEjercicios.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, filteredEjercicios.length)} de {filteredEjercicios.length}
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

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gym-gray/10">
            <div className="p-5 md:p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gym-white flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-gym-neon" />
                  {isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gym-gray hover:text-gym-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gym-gray-light text-sm font-medium block mb-1.5">Nombre *</label>
                  <input
                    name="nombre"
                    type="text"
                    placeholder="Ej. Press de Banca"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm font-medium block mb-1.5">Músculo</label>
                  <select
                    name="musculo"
                    value={formData.musculo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                  >
                    <option value="">Seleccionar músculo</option>
                    <option value="Pecho">Pecho</option>
                    <option value="Espalda">Espalda</option>
                    <option value="Hombros">Hombros</option>
                    <option value="Bíceps">Bíceps</option>
                    <option value="Tríceps">Tríceps</option>
                    <option value="Piernas">Piernas</option>
                    <option value="Glúteos">Glúteos</option>
                    <option value="Abdomen">Abdomen</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Full Body">Full Body</option>
                  </select>
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm font-medium block mb-1.5">Descripción</label>
                  <textarea
                    name="descripcion"
                    placeholder="Describe el ejercicio, técnica y beneficios..."
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gym-gray-light text-sm font-medium block mb-1.5">Repeticiones</label>
                    <input
                      name="repeticionesRecomendadas"
                      type="text"
                      placeholder="Ej. 3x12, 4x8-10"
                      value={formData.repeticionesRecomendadas}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-sm font-medium block mb-1.5">Máquina Asociada</label>
                    <select
                      name="idMaquina"
                      value={formData.idMaquina}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                    >
                      <option value="">Sin máquina</option>
                      {maquinas.map((maquina) => (
                        <option key={maquina.idmaquina} value={maquina.idmaquina}>
                          {maquina.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm font-medium block mb-1.5">
                    <Video className="w-4 h-4 inline mr-1" /> URL de Video (opcional)
                  </label>
                  <input
                    name="videoUrl"
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                  />
                </div>

                <div>
                  <ImageUpload
                    label="Imagen del ejercicio"
                    value={formData.imagenBase64 || formData.imagenUrl}
                    onChange={handleImageChange}
                  />
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

      {/* Modal Eliminar */}
      {showDeleteModal && selectedEjercicio && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-sm w-full border border-gym-gray/10">
            <div className="p-5 md:p-6">
              <h2 className="text-xl font-bold text-gym-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Eliminar Ejercicio
              </h2>
              <p className="text-gym-gray-light text-sm mt-2 mb-4">
                ¿Estás seguro de que deseas eliminar el ejercicio 
                <span className="text-gym-white font-medium"> {selectedEjercicio.nombre}</span>?
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

export default Ejercicios;