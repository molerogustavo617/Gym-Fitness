// src/pages/entrenador/EjerciciosEntrenador.jsx
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
  Filter,
  Save,
  AlertCircle,
  Image as ImageIcon,
  Video,
  Tag,
  Hash,
  Calendar
} from 'lucide-react';
import authService from '../../services/authService';
import ejercicioService from '../../services/ejercicioService';
import maquinaService from '../../services/maquinaService';

const EjerciciosEntrenador = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // Estados principales
  const [ejercicios, setEjercicios] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMusculo, setFilterMusculo] = useState('');
  const [filterMaquina, setFilterMaquina] = useState('');
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    musculo: '',
    idmaquina: '',
    repeticionesrecomendadas: '',
    videourl: '',
    imagenurl: ''
  });

  // Validación de campos
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 4) {
      navigate('/dashboard');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Cargar ejercicios
      const ejerciciosData = await ejercicioService.getAll();
      setEjercicios(Array.isArray(ejerciciosData) ? ejerciciosData : []);
      
      // Cargar máquinas para el select
      const maquinasData = await maquinaService.getAll();
      setMaquinas(Array.isArray(maquinasData) ? maquinasData : []);
      
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los ejercicios');
    } finally {
      setLoading(false);
    }
  };

  // Obtener músculos únicos para filtros
  const musculos = [...new Set(ejercicios.map(e => e.musculo).filter(Boolean))];

  // Filtrar ejercicios
  const filteredEjercicios = ejercicios.filter(ej => {
    const search = searchTerm.toLowerCase().trim();
    const matchSearch = !search || 
      ej.nombre?.toLowerCase().includes(search) ||
      ej.descripcion?.toLowerCase().includes(search) ||
      ej.musculo?.toLowerCase().includes(search);
    
    const matchMusculo = !filterMusculo || ej.musculo === filterMusculo;
    const matchMaquina = !filterMaquina || ej.idmaquina === parseInt(filterMaquina);
    
    return matchSearch && matchMusculo && matchMaquina;
  });

  // Paginación
  const totalPages = Math.ceil(filteredEjercicios.length / itemsPerPage);
  const currentItems = filteredEjercicios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Manejar creación/edición
  const handleOpenModal = (ejercicio = null) => {
    if (ejercicio) {
      setEditando(ejercicio);
      setFormData({
        nombre: ejercicio.nombre || '',
        descripcion: ejercicio.descripcion || '',
        musculo: ejercicio.musculo || '',
        idmaquina: ejercicio.idmaquina || '',
        repeticionesrecomendadas: ejercicio.repeticionesrecomendadas || '',
        videourl: ejercicio.videourl || '',
        imagenurl: ejercicio.imagenurl || ''
      });
    } else {
      setEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        musculo: '',
        idmaquina: '',
        repeticionesrecomendadas: '',
        videourl: '',
        imagenurl: ''
      });
    }
    setFormErrors({});
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoadingSubmit(true);
    setError('');
    setSuccess('');

    try {
      const dataToSend = {
        ...formData,
        idmaquina: formData.idmaquina ? parseInt(formData.idmaquina) : null
      };

      if (editando) {
        await ejercicioService.update(editando.idejercicio, dataToSend);
        setSuccess('Ejercicio actualizado correctamente');
      } else {
        await ejercicioService.create(dataToSend);
        setSuccess('Ejercicio creado correctamente');
      }
      
      setTimeout(() => {
        setShowModal(false);
        loadData();
        setLoadingSubmit(false);
      }, 1500);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el ejercicio');
      setLoadingSubmit(false);
    }
  };

  const getMaquinaNombre = (idMaquina) => {
    const maquina = maquinas.find(m => m.idmaquina === idMaquina);
    return maquina ? maquina.nombre : 'Sin máquina';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        <div className="text-orange-500 font-semibold text-sm tracking-wide">Cargando ejercicios...</div>
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
              <Dumbbell className="w-6 h-6 text-orange-400" />
              Ejercicios
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">Gestiona el catálogo de ejercicios</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#9A9AA0] font-mono">
            {ejercicios.length} ejercicios
          </span>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl text-xs font-bold hover:bg-orange-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,107,53,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Nuevo Ejercicio
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

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9A9AA0]" />
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o músculo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#0A0A0B]/50 border border-orange-500/10 rounded-xl text-white text-sm placeholder-[#9A9AA0] focus:outline-none focus:border-orange-500/40 transition-colors"
          />
        </div>
        <select
          value={filterMusculo}
          onChange={(e) => {
            setFilterMusculo(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-[#0A0A0B]/50 border border-orange-500/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/40 transition-colors"
        >
          <option value="">Todos los músculos</option>
          {musculos.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <select
          value={filterMaquina}
          onChange={(e) => {
            setFilterMaquina(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-[#0A0A0B]/50 border border-orange-500/10 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/40 transition-colors"
        >
          <option value="">Todas las máquinas</option>
          {maquinas.map(m => (
            <option key={m.idmaquina} value={m.idmaquina}>
              {m.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* GRID DE EJERCICIOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Dumbbell className="w-12 h-12 text-[#9A9AA0]/20 mx-auto mb-3" />
            <p className="text-[#9A9AA0] text-sm font-mono">
              {searchTerm || filterMusculo || filterMaquina 
                ? 'No hay ejercicios que coincidan con los filtros' 
                : 'No hay ejercicios creados aún'}
            </p>
            {!searchTerm && !filterMusculo && !filterMaquina && (
              <button
                onClick={() => handleOpenModal()}
                className="mt-3 px-4 py-2 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl text-sm hover:bg-orange-500/20 transition-colors"
              >
                Crear el primer ejercicio
              </button>
            )}
          </div>
        ) : (
          currentItems.map((ej) => {
            const maquina = maquinas.find(m => m.idmaquina === ej.idmaquina);
            return (
              <div
                key={ej.idejercicio}
                className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all group"
              >
                {/* Imagen */}
                <div className="w-full h-40 bg-[#0A0A0B]/50 overflow-hidden flex items-center justify-center relative">
                  {ej.imagenurl ? (
                    <img
                      src={ej.imagenurl}
                      alt={ej.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="flex flex-col items-center text-[#9A9AA0]/20">
                            <Dumbbell class="w-12 h-12" />
                            <span class="text-xs mt-1">Sin imagen</span>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center text-[#9A9AA0]/20">
                      <Dumbbell className="w-12 h-12" />
                      <span className="text-xs mt-1">Sin imagen</span>
                    </div>
                  )}
                  
                  {/* Badge de músculo */}
                  {ej.musculo && (
                    <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-orange-400 text-[10px] font-mono px-2 py-0.5 rounded-full border border-orange-500/20">
                      {ej.musculo}
                    </span>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-sm truncate" title={ej.nombre}>
                    {ej.nombre}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1 mt-1">
                    {maquina && (
                      <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Tag className="w-2.5 h-2.5" />
                        {maquina.nombre}
                      </span>
                    )}
                    {ej.repeticionesrecomendadas && (
                      <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Hash className="w-2.5 h-2.5" />
                        {ej.repeticionesrecomendadas}
                      </span>
                    )}
                  </div>

                  {ej.descripcion && (
                    <p className="text-[#9A9AA0] text-[10px] font-mono mt-1.5 line-clamp-2">
                      {ej.descripcion}
                    </p>
                  )}

                  {/* Acciones */}
                  <div className="flex gap-1 mt-3 pt-3 border-t border-orange-500/5">
                    <button
                      onClick={() => handleOpenModal(ej)}
                      className="flex-1 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Editar
                    </button>
                    {/* ❌ NO HAY BOTÓN DE ELIMINAR - Solo Admin */}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINACIÓN */}
      {filteredEjercicios.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-orange-500/10">
          <span className="text-[#9A9AA0] text-[10px]">
            {((currentPage - 1) * itemsPerPage) + 1}-
            {Math.min(currentPage * itemsPerPage, filteredEjercicios.length)} de {filteredEjercicios.length}
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
      {/* MODAL CREAR/EDITAR EJERCICIO */}
      {/* ============================================================ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-orange-500/20 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                {editando ? (
                  <>
                    <Edit className="w-5 h-5 text-orange-400" />
                    Editar Ejercicio
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-orange-400" />
                    Crear Nuevo Ejercicio
                  </>
                )}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes en el modal */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 mb-4">
                <XCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 mb-4">
                <CheckCircle className="w-4 h-4" />
                {success}
              </div>
            )}

            {/* Formulario */}
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {/* Nombre */}
              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">
                  Nombre del Ejercicio *
                </label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Ej: Press Banca, Sentadilla, Curl de Bíceps..."
                  className={`w-full px-4 py-2.5 bg-[#0A0A0B] border ${
                    formErrors.nombre ? 'border-red-500/50' : 'border-orange-500/20'
                  } rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors`}
                />
                {formErrors.nombre && (
                  <p className="text-red-400 text-[10px] font-mono mt-1">{formErrors.nombre}</p>
                )}
              </div>

              {/* Músculo */}
              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">
                  Músculo Principal
                </label>
                <input
                  name="musculo"
                  value={formData.musculo}
                  onChange={handleInputChange}
                  placeholder="Ej: Pecho, Espalda, Piernas, Bíceps..."
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              {/* Máquina */}
              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">
                  Máquina
                </label>
                <select
                  name="idmaquina"
                  value={formData.idmaquina}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                >
                  <option value="">Sin máquina</option>
                  {maquinas.map(m => (
                    <option key={m.idmaquina} value={m.idmaquina}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Repeticiones Recomendadas */}
              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">
                  Repeticiones Recomendadas
                </label>
                <input
                  name="repeticionesrecomendadas"
                  value={formData.repeticionesrecomendadas}
                  onChange={handleInputChange}
                  placeholder="Ej: 10-12, 8-10, 15"
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción detallada del ejercicio, técnica, consejos..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                />
              </div>

              {/* URL de Imagen */}
              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  URL de Imagen
                </label>
                <input
                  name="imagenurl"
                  value={formData.imagenurl}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/imagen-ejercicio.jpg"
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              {/* URL de Video */}
              <div>
                <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5 flex items-center gap-1">
                  <Video className="w-3.5 h-3.5" />
                  URL de Video Tutorial
                </label>
                <input
                  name="videourl"
                  value={formData.videourl}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-orange-500/20 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-2 pt-4 border-t border-orange-500/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-[#0A0A0B] border border-orange-500/10 text-[#9A9AA0] rounded-xl hover:bg-orange-500/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loadingSubmit}
                  className="flex-1 px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl font-medium hover:bg-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loadingSubmit ? (
                    <>
                      <span className="w-4 h-4 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editando ? 'Actualizar' : 'Crear'}
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

export default EjerciciosEntrenador;