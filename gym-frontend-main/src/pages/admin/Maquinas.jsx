// src/pages/admin/Maquinas.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import maquinaService from '../../services/maquinaService';
import authService from '../../services/authService';

const Maquinas = () => {
  const [maquinas, setMaquinas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaquina, setSelectedMaquina] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    modelo: '',
    serial: '',
    estado: '',
    fechaAdquisicion: ''
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 1) {
      navigate('/dashboard');
      return;
    }
    loadMaquinas();
  }, [navigate]);

  const loadMaquinas = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await maquinaService.getAll();
      setMaquinas(data);
    } catch (err) {
      setError('Error al cargar las máquinas');
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
      nombre: '',
      modelo: '',
      serial: '',
      estado: '',
      fechaAdquisicion: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (maquina) => {
    setIsEditing(true);
    setFormData({
      nombre: maquina.nombre || '',
      modelo: maquina.modelo || '',
      serial: maquina.serial || '',
      estado: maquina.estado || '',
      fechaAdquisicion: maquina.fechaadquisicion ? maquina.fechaadquisicion.split('T')[0] : ''
    });
    setSelectedMaquina(maquina);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (maquina) => {
    setSelectedMaquina(maquina);
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
        modelo: formData.modelo || null,
        serial: formData.serial || null,
        estado: formData.estado || null,
        fechaAdquisicion: formData.fechaAdquisicion || null
      };

      if (isEditing) {
        await maquinaService.update(selectedMaquina.idmaquina, dataToSend);
        setSuccess('Máquina actualizada correctamente');
      } else {
        await maquinaService.create(dataToSend);
        setSuccess('Máquina creada correctamente');
      }

      setShowModal(false);
      loadMaquinas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la máquina');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await maquinaService.delete(selectedMaquina.idmaquina);
      setSuccess('Máquina eliminada correctamente');
      setShowDeleteModal(false);
      loadMaquinas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar la máquina');
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  const filteredMaquinas = maquinas.filter(maquina => {
    const search = searchTerm.toLowerCase();
    return (
      maquina.nombre?.toLowerCase().includes(search) ||
      maquina.modelo?.toLowerCase().includes(search) ||
      maquina.serial?.toLowerCase().includes(search) ||
      maquina.estado?.toLowerCase().includes(search)
    );
  });

  // Paginacion
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMaquinas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMaquinas.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Renderizador dinámico de insignias para los estados
  const renderEstadoBadge = (estado) => {
    switch (estado) {
      case 'Activa':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gym-success/10 text-gym-success border border-gym-success/20 shadow-[0_0_10px_rgba(34,197,94,0.05)]">
            ● Activa
          </span>
        );
      case 'Mantenimiento':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gym-warning/10 text-gym-warning border border-gym-warning/20 shadow-[0_0_10px_rgba(245,158,11,0.05)]">
            ▲ Mantenimiento
          </span>
        );
      case 'Inactiva':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gym-danger/10 text-gym-danger border border-gym-danger/20 shadow-[0_0_10px_rgba(239,68,68,0.05)]">
            ■ Inactiva
          </span>
        );
      case 'En reparación':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.05)]">
            ⚙ En reparación
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gym-gray/10 text-gym-gray-light border border-gym-gray/20">
            Sin estado
          </span>
        );
    }
  };

  if (loading && maquinas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando catálogo de máquinas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🏁 Header Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gym-dark-secondary p-6 rounded-2xl border border-gym-gray/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gym-white tracking-tight flex items-center gap-2">
            Inventario de <span className="text-gym-neon">Máquinas</span>
          </h1>
          <p className="text-gym-gray-light text-xs md:text-sm mt-1">
            Supervisa, añade y modifica el estado operativo de los equipos del gimnasio.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark font-bold px-5 py-3 rounded-xl text-sm hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(33,241,168,0.15)] hover:shadow-[0_0_25px_rgba(33,241,168,0.3)] transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Máquina
        </button>
      </div>

      {/* ⚠️ Alertas / Mensajes */}
      {error && (
        <div className="bg-gym-danger/10 border border-gym-danger/20 text-gym-danger px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <span>❌</span> {error}
        </div>
      )}
      {success && (
        <div className="bg-gym-success/10 border border-gym-success/20 text-gym-success px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <span>⚡</span> {success}
        </div>
      )}

      {/* 🔍 Buscador Estilizado */}
      <div className="relative max-w-md w-full">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gym-gray-light">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Buscar equipo por nombre, modelo o serial..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-10 pr-4 py-3 bg-gym-dark-secondary border border-gym-gray/10 rounded-xl text-gym-white text-sm placeholder-gym-gray focus:outline-none focus:border-gym-neon/50 focus:ring-1 focus:ring-gym-neon/30 transition-all"
        />
      </div>

      {/* 📊 Tabla de Equipos */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gym-gray/10 bg-gym-card/20">
                <th className="py-4 px-5 text-gym-gray-light font-bold text-xs uppercase tracking-wider whitespace-nowrap">Nombre de Máquina</th>
                <th className="py-4 px-5 text-gym-gray-light font-bold text-xs uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Modelo</th>
                <th className="py-4 px-5 text-gym-gray-light font-bold text-xs uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Código Serial</th>
                <th className="py-4 px-5 text-gym-gray-light font-bold text-xs uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Estado Operativo</th>
                <th className="py-4 px-5 text-gym-gray-light font-bold text-xs uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Adquisición</th>
                <th className="py-4 px-5 text-gym-gray-light font-bold text-xs uppercase tracking-wider whitespace-nowrap text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gym-gray/5">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gym-gray text-sm font-medium">
                    Ninguna máquina coincide con el criterio de búsqueda.
                  </td>
                </tr>
              ) : (
                currentItems.map((maquina) => (
                  <tr key={maquina.idmaquina} className="hover:bg-gym-card/10 transition-colors group">
                    <td className="py-4 px-5 text-gym-white text-sm font-bold tracking-wide whitespace-nowrap">
                      {maquina.nombre}
                    </td>
                    <td className="py-4 px-5 text-gym-gray-light text-sm whitespace-nowrap hidden sm:table-cell">
                      {maquina.modelo || <span className="text-gym-gray/40">--</span>}
                    </td>
                    <td className="py-4 px-5 text-gym-gray-light font-mono text-xs whitespace-nowrap hidden lg:table-cell">
                      {maquina.serial || <span className="text-gym-gray/40">--</span>}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap hidden md:table-cell">
                      {renderEstadoBadge(maquina.estado)}
                    </td>
                    <td className="py-4 px-5 text-gym-gray-light text-sm whitespace-nowrap hidden lg:table-cell">
                      {maquina.fechaadquisicion ? new Date(maquina.fechaadquisicion).toLocaleDateString('es-ES') : <span className="text-gym-gray/40">--</span>}
                    </td>
                    <td className="py-4 px-5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(maquina)}
                          className="text-gym-gray-light hover:text-gym-neon hover:bg-gym-neon/10 p-2 rounded-lg transition-all"
                          title="Editar parámetros"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(maquina)}
                          className="text-gym-gray-light hover:text-gym-danger hover:bg-gym-danger/10 p-2 rounded-lg transition-all"
                          title="Eliminar de inventario"
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

        {/* 🧮 Paginación Limpia */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gym-gray/10 bg-gym-card/5">
          <span className="text-gym-gray-light text-xs md:text-sm">
            Mostrando <span className="text-gym-white font-semibold">{filteredMaquinas.length > 0 ? indexOfFirstItem + 1 : 0}</span> al{' '}
            <span className="text-gym-white font-semibold">{Math.min(indexOfLastItem, filteredMaquinas.length)}</span> de{' '}
            <span className="text-gym-white font-semibold">{filteredMaquinas.length}</span> equipos
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                currentPage === 1 
                  ? 'text-gym-gray/30 cursor-not-allowed' 
                  : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
              }`}
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => paginate(pageNum)}
                className={`w-8 h-8 rounded-xl text-xs md:text-sm font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-gym-neon/10 text-gym-neon border border-gym-neon/30'
                    : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition-all ${
                currentPage === totalPages || totalPages === 0
                  ? 'text-gym-gray/30 cursor-not-allowed' 
                  : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* 📦 Modal Formulario (Crear/Editar) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-lg w-full border border-gym-gray/10 shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gym-white tracking-tight">
                  {isEditing ? '🛠️ Modificar Parámetros' : '➕ Registrar Nueva Máquina'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gym-gray hover:text-gym-white p-1 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gym-gray-light text-xs font-bold uppercase tracking-wider block mb-1.5">Nombre de la Máquina *</label>
                  <input
                    name="nombre"
                    type="text"
                    placeholder="Ej. Prensa de Piernas Piernas 45°"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-gym-dark border border-gym-gray/10 rounded-xl text-gym-white text-sm focus:outline-none focus:border-gym-neon/40 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gym-gray-light text-xs font-bold uppercase tracking-wider block mb-1.5">Modelo</label>
                    <input
                      name="modelo"
                      type="text"
                      placeholder="Ej. Pro Series v2"
                      value={formData.modelo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark border border-gym-gray/10 rounded-xl text-gym-white text-sm focus:outline-none focus:border-gym-neon/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-bold uppercase tracking-wider block mb-1.5">Código Serial</label>
                    <input
                      name="serial"
                      type="text"
                      placeholder="Ej. SER-9812A"
                      value={formData.serial}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark border border-gym-gray/10 rounded-xl text-gym-white text-sm font-mono focus:outline-none focus:border-gym-neon/40 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gym-gray-light text-xs font-bold uppercase tracking-wider block mb-1.5">Estado Operativo</label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark border border-gym-gray/10 rounded-xl text-gym-white text-sm focus:outline-none focus:border-gym-neon/40 transition-all"
                    >
                      <option value="">Seleccionar estado</option>
                      <option value="Activa">Activa</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                      <option value="Inactiva">Inactiva</option>
                      <option value="En reparación">En reparación</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs font-bold uppercase tracking-wider block mb-1.5">Adquisición</label>
                    <input
                      name="fechaAdquisicion"
                      type="date"
                      value={formData.fechaAdquisicion}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 bg-gym-dark border border-gym-gray/10 rounded-xl text-gym-white text-sm focus:outline-none focus:border-gym-neon/40 transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-4 border-t border-gym-gray/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-gym-card hover:bg-gym-card/80 text-gym-white text-sm font-bold rounded-xl transition-all w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-gym-neon text-gym-dark text-sm font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-all w-full sm:w-auto order-1 sm:order-2"
                  >
                    {loading ? 'Procesando...' : (isEditing ? 'Guardar Cambios' : 'Registrar Equipo')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 🚨 Modal Confirmación de Eliminación */}
      {showDeleteModal && selectedMaquina && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-gray/10 shadow-2xl overflow-hidden animate-scaleIn">
            <div className="p-6">
              <h2 className="text-xl font-black text-gym-danger flex items-center gap-2 mb-3">
                ⚠️ Eliminar de Inventario
              </h2>
              <p className="text-gym-gray-light text-sm leading-relaxed mb-5">
                ¿Estás completamente seguro de dar de baja la máquina 
                <span className="text-gym-white font-bold"> {selectedMaquina.nombre}</span>?
                <span className="block text-gym-warning text-xs mt-2 font-semibold">
                  Esta acción purgará el registro del sistema de manera permanente y no se podrá deshacer.
                </span>
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2.5">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 bg-gym-card hover:bg-gym-card/80 text-gym-white text-sm font-bold rounded-xl transition-all w-full sm:w-auto"
                >
                  Cancelar Petición
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gym-danger text-white text-sm font-bold rounded-xl hover:bg-gym-danger/80 shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all w-full sm:w-auto"
                >
                  {loading ? 'Eliminando...' : 'Confirmar Baja'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maquinas;