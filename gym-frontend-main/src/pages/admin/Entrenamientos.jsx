// src/pages/admin/Entrenamientos.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import entrenamientoService from '../../services/entrenamientoService';
import userService from '../../services/userService';
import maquinaService from '../../services/maquinaService';
import authService from '../../services/authService';

const Entrenamientos = () => {
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEntrenamiento, setSelectedEntrenamiento] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [filtroMaquina, setFiltroMaquina] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    idUsuario: '',
    idMaquina: '',
    repeticiones: '',
    peso: '',
    fecha: ''
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
      const [entrenamientosData, usuariosData, maquinasData] = await Promise.all([
        entrenamientoService.getAll(),
        userService.getAll(),
        maquinaService.getAll()
      ]);
      setEntrenamientos(entrenamientosData || []);
      setUsuarios(usuariosData || []);
      setMaquinas(maquinasData || []);
    } catch (err) {
      setError('Error al cargar la bitácora de datos');
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

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      idUsuario: '',
      idMaquina: '',
      repeticiones: '',
      peso: '',
      fecha: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (entrenamiento) => {
    setIsEditing(true);
    setFormData({
      idUsuario: entrenamiento.idusuario || '',
      idMaquina: entrenamiento.idmaquina || '',
      repeticiones: entrenamiento.repeticiones || '',
      peso: entrenamiento.peso || '',
      fecha: entrenamiento.fecha ? entrenamiento.fecha.split('T')[0] : ''
    });
    setSelectedEntrenamiento(entrenamiento);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (entrenamiento) => {
    setSelectedEntrenamiento(entrenamiento);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const dataToSend = {
        idUsuario: parseInt(formData.idUsuario),
        idMaquina: parseInt(formData.idMaquina),
        repeticiones: parseInt(formData.repeticiones),
        peso: parseFloat(formData.peso),
        fecha: formData.fecha || null
      };

      if (isEditing) {
        await entrenamientoService.update(selectedEntrenamiento.identrenamiento, dataToSend);
        setSuccess('Entrenamiento actualizado correctamente');
      } else {
        await entrenamientoService.create(dataToSend);
        setSuccess('Entrenamiento registrado en el historial');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
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
      setSuccess('Registro eliminado correctamente');
      setShowDeleteModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el registro');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  const filteredEntrenamientos = entrenamientos.filter(item => {
    const search = searchTerm.toLowerCase();
    const usuarioMatch = item.usuario_nombre?.toLowerCase().includes(search) ||
                         item.usuario_apellido?.toLowerCase().includes(search);
    const maquinaMatch = item.maquina_nombre?.toLowerCase().includes(search);
    
    const usuarioFiltro = filtroUsuario ? item.idusuario === parseInt(filtroUsuario) : true;
    const maquinaFiltro = filtroMaquina ? item.idmaquina === parseInt(filtroMaquina) : true;

    return (usuarioMatch || maquinaMatch) && usuarioFiltro && maquinaFiltro;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredEntrenamientos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredEntrenamientos.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading && entrenamientos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gym-neon animate-pulse font-mono tracking-widest text-lg">
          CARGANDO LOGS DE ENTRENAMIENTO...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gym-card/20 border border-gym-gray/10 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gym-white tracking-tight uppercase font-mono">
            Historial de <span className="text-gym-neon shadow-neon">Entrenamientos</span>
          </h1>
          <p className="text-gym-gray text-xs md:text-sm mt-0.5 font-medium">
            Métricas, marcas personales y registro de cargas de la comunidad.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-transparent hover:text-gym-neon border border-gym-neon shadow-md shadow-gym-neon/20 transition-all duration-300 flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Log
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-gym-danger/10 border border-gym-danger/40 text-gym-danger px-4 py-3 rounded-xl text-sm font-mono tracking-wide animate-fade-in">
           [ERROR]: {error}
        </div>
      )}
      {success && (
        <div className="bg-gym-success/10 border border-gym-success/40 text-gym-success px-4 py-3 rounded-xl text-sm font-mono tracking-wide animate-fade-in">
          ✓ [SUCCESS]: {success}
        </div>
      )}

      {/* Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por atleta o máquina..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full input-gym pr-10"
          />
          <span className="absolute right-3 top-3.5 text-gym-gray/40">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
        </div>
        
        <select
          value={filtroUsuario}
          onChange={(e) => {
            setFiltroUsuario(e.target.value);
            setCurrentPage(1);
          }}
          className="input-gym cursor-pointer"
        >
          <option value="">Filtrar por Atleta</option>
          {usuarios.map((user) => (
            <option key={user.idusuario} value={user.idusuario}>
              {user.nombre} {user.apellido}
            </option>
          ))}
        </select>

        <select
          value={filtroMaquina}
          onChange={(e) => {
            setFiltroMaquina(e.target.value);
            setCurrentPage(1);
          }}
          className="input-gym cursor-pointer"
        >
          <option value="">Filtrar por Máquina</option>
          {maquinas.map((maquina) => (
            <option key={maquina.idmaquina} value={maquina.idmaquina}>
              {maquina.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="card-gym rounded-2xl overflow-hidden border border-gym-gray/10 bg-gym-dark-secondary/40 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gym-gray/10 bg-gym-card/10 font-mono text-xs uppercase tracking-wider text-gym-gray">
                <th className="py-3.5 px-4 font-semibold">Atleta / Usuario</th>
                <th className="py-3.5 px-4 font-semibold hidden sm:table-cell">Máquina</th>
                <th className="py-3.5 px-4 font-semibold hidden md:table-cell text-center">Repeticiones</th>
                <th className="py-3.5 px-4 font-semibold hidden md:table-cell text-center">Carga (kg)</th>
                <th className="py-3.5 px-4 font-semibold hidden lg:table-cell">Fecha Log</th>
                <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-gray/5">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gym-gray font-mono text-sm">
                    ⚡ No hay logs de entrenamiento que coincidan.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.identrenamiento} className="hover:bg-gym-neon/5 transition-all duration-200 group">
                    <td className="py-3.5 px-4 text-gym-white font-medium whitespace-nowrap">
                      <div className="font-semibold text-gym-white group-hover:text-gym-neon transition-colors">
                        {item.usuario_nombre} {item.usuario_apellido}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gym-gray-light whitespace-nowrap hidden sm:table-cell">
                      <span className="bg-gym-card/40 px-2.5 py-1 rounded-md text-xs border border-gym-gray/5 font-mono">
                        {item.maquina_nombre || '-'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gym-white font-mono text-center hidden md:table-cell text-base font-bold">
                      {item.repeticiones}
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-center">
                      <span className="text-gym-neon font-mono text-base font-extrabold">
                        {item.peso || '0'}
                      </span>
                      <span className="text-gym-gray text-xs ml-0.5">kg</span>
                    </td>
                    <td className="py-3.5 px-4 text-gym-gray text-sm whitespace-nowrap hidden lg:table-cell font-mono">
                      {formatDate(item.fecha)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg border border-gym-gray/10 bg-gym-card/30 text-gym-gray hover:text-gym-neon hover:border-gym-neon/30 transition-all"
                          title="Editar Registro"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
                          className="p-1.5 rounded-lg border border-gym-gray/10 bg-gym-card/30 text-gym-danger/70 hover:text-gym-danger hover:border-gym-danger/40 transition-all"
                          title="Eliminar Registro"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gym-gray/10 bg-gym-card/5 font-mono text-xs text-gym-gray">
          <span>
            Mostrando {filteredEntrenamientos.length > 0 ? indexOfFirstItem + 1 : 0}-
            {Math.min(indexOfLastItem, filteredEntrenamientos.length)} de {filteredEntrenamientos.length} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg border border-gym-gray/10 transition-colors ${
                currentPage === 1 
                  ? 'text-gym-gray/30 bg-transparent cursor-not-allowed border-none' 
                  : 'text-gym-white hover:bg-gym-card bg-gym-dark/40'
              }`}
            >
              « Ant
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => paginate(pageNum)}
                className={`w-8 h-8 rounded-lg text-xs font-bold font-mono transition-all ${
                  currentPage === pageNum
                    ? 'bg-gym-neon/15 text-gym-neon border border-gym-neon/30 shadow-sm shadow-gym-neon/10'
                    : 'text-gym-gray hover:text-gym-white hover:bg-gym-card'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1.5 rounded-lg border border-gym-gray/10 transition-colors ${
                currentPage === totalPages || totalPages === 0
                  ? 'text-gym-gray/30 bg-transparent cursor-not-allowed border-none' 
                  : 'text-gym-white hover:bg-gym-card bg-gym-dark/40'
              }`}
            >
              Sig »
            </button>
          </div>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gym-gray/20 shadow-xl shadow-black/50">
            <div className="p-5 md:p-7">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gym-gray/10">
                <h2 className="text-xl font-bold font-mono uppercase tracking-wide text-gym-white">
                  {isEditing ? ' Modificar Registro' : '➕ Cargar Entrenamiento'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gym-gray hover:text-gym-white transition-colors bg-gym-card/40 p-1.5 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gym-gray-light font-mono text-xs uppercase block mb-1.5">Atleta / Miembro *</label>
                    <select
                      name="idUsuario"
                      value={formData.idUsuario}
                      onChange={handleInputChange}
                      className="input-gym cursor-pointer w-full bg-gym-dark"
                      required
                    >
                      <option value="">Seleccionar atleta</option>
                      {usuarios.map((user) => (
                        <option key={user.idusuario} value={user.idusuario}>
                          {user.nombre} {user.apellido} (@{user.usuario})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gym-gray-light font-mono text-xs uppercase block mb-1.5">Estación / Máquina *</label>
                    <select
                      name="idMaquina"
                      value={formData.idMaquina}
                      onChange={handleInputChange}
                      className="input-gym cursor-pointer w-full bg-gym-dark"
                      required
                    >
                      <option value="">Seleccionar máquina</option>
                      {maquinas.map((maquina) => (
                        <option key={maquina.idmaquina} value={maquina.idmaquina}>
                          {maquina.nombre} {maquina.modelo ? `— [${maquina.modelo}]` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gym-gray-light font-mono text-xs uppercase block mb-1.5">Volumen (Repeticiones) *</label>
                    <input
                      name="repeticiones"
                      type="number"
                      min="1"
                      placeholder="Ej. 12"
                      value={formData.repeticiones}
                      onChange={handleInputChange}
                      className="input-gym font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light font-mono text-xs uppercase block mb-1.5">Intensidad (Peso en kg) *</label>
                    <input
                      name="peso"
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="Ej. 65"
                      value={formData.peso}
                      onChange={handleInputChange}
                      className="input-gym font-mono"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gym-gray-light font-mono text-xs uppercase block mb-1.5">Fecha del Registro</label>
                    <input
                      name="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      className="input-gym font-mono cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 mt-6 border-t border-gym-gray/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono text-gym-gray bg-gym-card/40 hover:bg-gym-card/80 border border-gym-gray/10 transition-all order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider font-mono bg-gym-neon text-gym-dark shadow-md shadow-gym-neon/10 hover:opacity-90 disabled:opacity-50 transition-all order-1 sm:order-2"
                  >
                    {loading ? 'Procesando...' : (isEditing ? 'Actualizar Log' : 'Guardar Log')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedEntrenamiento && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-danger/30 shadow-2xl shadow-black/80">
            <div className="p-6">
              <div className="flex items-center gap-3 text-gym-danger mb-4">
                <svg className="w-6 h-6 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-lg md:text-xl font-bold font-mono uppercase tracking-wide">
                  Eliminar Log de Registro
                </h2>
              </div>
              
              <p className="text-gym-gray-light text-sm mb-6 font-medium">
                ¿Estás completamente seguro de que deseas purgar este registro de entrenamiento? Esta acción alterará las métricas históricas del atleta.
                <span className="block text-gym-danger font-mono text-xs font-bold mt-2 uppercase tracking-wider">
                  Error crítico: Esta acción no se puede deshacer.
                </span>
              </p>
              
              <div className="flex flex-col sm:flex-row justify-end gap-2 font-mono text-xs uppercase tracking-wider">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-gym-gray bg-gym-card/40 hover:bg-gym-card/80 border border-gym-gray/10 transition-all"
                >
                  Abortar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full sm:w-auto bg-gym-danger text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gym-danger/80 shadow-md shadow-gym-danger/10 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Eliminando...' : 'Confirmar Purga'}
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