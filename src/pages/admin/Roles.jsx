// src/pages/admin/Roles.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import rolService from '../../services/rolService';
import authService from '../../services/authService';

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRol, setSelectedRol] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    descripcion: ''
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 1) {
      navigate('/dashboard');
      return;
    }
    loadRoles();
  }, [navigate]);

  const loadRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await rolService.getAll();
      setRoles(data);
    } catch (err) {
      setError('Error al cargar los roles');
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
    setFormData({ descripcion: '' });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (rol) => {
    setIsEditing(true);
    setFormData({ descripcion: rol.descripcion || '' });
    setSelectedRol(rol);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (rol) => {
    setSelectedRol(rol);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isEditing) {
        await rolService.update(selectedRol.idrol, formData.descripcion);
        setSuccess('Rol actualizado correctamente');
      } else {
        await rolService.create(formData.descripcion);
        setSuccess('Rol creado correctamente');
      }

      setShowModal(false);
      loadRoles();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el rol');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await rolService.delete(selectedRol.idrol);
      setSuccess('Rol eliminado correctamente');
      setShowDeleteModal(false);
      loadRoles();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el rol');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoles = roles.filter(rol => {
    const search = searchTerm.toLowerCase();
    return rol.descripcion?.toLowerCase().includes(search);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading && roles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gym-neon">Cargando roles...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gym-white tracking-tight">
            Roles
          </h1>
          <p className="text-gym-gray text-sm mt-0.5">
            Gestiona los roles del sistema
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Rol
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-gym-danger/10 border border-gym-danger/30 text-gym-danger px-4 py-2.5 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-gym-success/10 border border-gym-success/30 text-gym-success px-4 py-2.5 rounded-lg mb-3 text-sm">
          {success}
        </div>
      )}

      {/* Buscador */}
      <div className="mb-3 md:mb-4">
        <input
          type="text"
          placeholder="Buscar rol..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full md:max-w-md input-gym"
        />
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gym-gray/10">
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider">ID</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider">Descripción</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-8 text-gym-gray text-sm">
                    No hay roles registrados
                  </td>
                </tr>
              ) : (
                currentItems.map((rol) => (
                  <tr key={rol.idrol} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-gray text-sm">
                      {rol.idrol}
                    </td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-white text-sm font-medium">
                      {rol.descripcion}
                    </td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <button
                          onClick={() => openEditModal(rol)}
                          className="text-gym-gray hover:text-gym-white transition-colors p-1"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(rol)}
                          className="text-gym-danger hover:text-gym-danger/80 transition-colors p-1"
                          title="Eliminar"
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

        {/* Footer paginacion */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 md:px-4 py-3 border-t border-gym-gray/10">
          <span className="text-gym-gray text-xs md:text-sm">
            Mostrando {filteredRoles.length > 0 ? indexOfFirstItem + 1 : 0}-
            {Math.min(indexOfLastItem, filteredRoles.length)} de {filteredRoles.length} roles
          </span>
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm ${
                currentPage === 1 
                  ? 'text-gym-gray cursor-not-allowed' 
                  : 'text-gym-white hover:bg-gym-card'
              }`}
            >
              Anterior
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
                  className={`px-2.5 md:px-3 py-1 rounded text-xs md:text-sm ${
                    currentPage === pageNum
                      ? 'bg-gym-neon/20 text-gym-neon'
                      : 'text-gym-white hover:bg-gym-card'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm ${
                currentPage === totalPages || totalPages === 0
                  ? 'text-gym-gray cursor-not-allowed' 
                  : 'text-gym-white hover:bg-gym-card'
              }`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gym-white">
                  {isEditing ? 'Editar Rol' : 'Nuevo Rol'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gym-gray hover:text-gym-white transition-colors"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Descripción *</label>
                  <input
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    className="input-gym"
                    placeholder="Ej: Recepcionista"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-gym-gray/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary w-full sm:w-auto"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full sm:w-auto disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedRol && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-sm w-full border border-gym-gray/10 mx-4">
            <div className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gym-white mb-3 md:mb-4">
                Eliminar Rol
              </h2>
              <p className="text-gym-gray-light text-sm md:text-base mb-4 md:mb-6">
                ¿Estas seguro de que deseas eliminar el rol 
                <span className="text-gym-white font-medium"> {selectedRol.descripcion}</span>?
                <span className="block text-gym-warning text-xs md:text-sm mt-2">
                  Esta acción no se puede deshacer.
                </span>
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-gym-danger text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gym-danger/80 transition-colors disabled:opacity-50 w-full sm:w-auto"
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;