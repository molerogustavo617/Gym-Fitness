// src/pages/admin/Usuarios.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import authService from '../../services/authService';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descargandoExcel, setDescargandoExcel] = useState(false); // Estado para el botón de Excel
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    usuario: '',
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    correo: '',
    clave: '',
    idRol: 1
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 1) {
      navigate('/dashboard');
      return;
    }
    loadUsuarios();
  }, [navigate]);

  const loadUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAll();
      setUsuarios(data);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- BOTÓN EXCEL (NUEVA LÓGICA DE HANDRY INTEGRADA CON BLOB) ---
  const handleExportExcel = async () => {
    setDescargandoExcel(true);
    setError('');
    try {
      const blob = await userService.downloadExcelReport();
      
      // Creamos la descarga forzada nativa y segura
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Usuarios.xlsx');
      document.body.appendChild(link);
      link.click();
      
      // Limpieza de buffer en el navegador
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al descargar el reporte Excel');
      console.error(err);
    } finally {
      setDescargandoExcel(false);
    }
  };

  // --- BOTÓN PDF (DISFUNCIONAL / PRÓXIMAMENTE) ---
  const handleExportPDFDisfuncional = () => {
    alert(" Módulo de Reportes PDF en desarrollo. Estará disponible en la próxima actualización.");
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
      usuario: '',
      nombre: '',
      apellido: '',
      cedula: '',
      telefono: '',
      correo: '',
      clave: '',
      idRol: 1
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (user) => {
    setIsEditing(true);
    setFormData({
      usuario: user.usuario || '',
      nombre: user.nombre || '',
      apellido: user.apellido || '',
      cedula: user.cedula || '',
      telefono: user.telefono || '',
      correo: user.correo || '',
      clave: '',
      idRol: user.idrol || 1
    });
    setSelectedUser(user);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openStatusModal = (user) => {
    setSelectedUser(user);
    setShowStatusModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isEditing) {
        const dataToSend = {
          usuario: formData.usuario,
          nombre: formData.nombre,
          apellido: formData.apellido,
          cedula: formData.cedula,
          telefono: formData.telefono,
          correo: formData.correo,
          idRol: parseInt(formData.idRol)
        };
        await userService.update(selectedUser.idusuario, dataToSend);
        setSuccess('Usuario actualizado correctamente');
      } else {
        const dataToSend = {
          usuario: formData.usuario,
          nombre: formData.nombre,
          apellido: formData.apellido,
          cedula: formData.cedula,
          telefono: formData.telefono,
          correo: formData.correo,
          clave: formData.clave,
          idRol: parseInt(formData.idRol)
        };
        await userService.create(dataToSend);
        setSuccess('Usuario creado correctamente');
      }

      setShowModal(false);
      loadUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const newStatus = !selectedUser.activo;
      await userService.toggleStatus(selectedUser.idusuario, newStatus);
      setSuccess(`Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`);
      setShowStatusModal(false);
      loadUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar el estado');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsuarios = usuarios.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.nombre?.toLowerCase().includes(search) ||
      user.apellido?.toLowerCase().includes(search) ||
      user.usuario?.toLowerCase().includes(search) ||
      user.cedula?.includes(search) ||
      user.correo?.toLowerCase().includes(search)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsuarios.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const getStatusStyle = (activo) => ({
    color: activo ? '#10B981' : '#EF4444',
    fontWeight: '500'
  });

  const getRolStyle = (rol) => {
    const colors = {
      'Administrador': '#CCFF00',
      'Recepcionista': '#10B981',
      'Cliente': '#6B7280',
      'Entrenador': '#3B82F6'
    };
    return {
      color: colors[rol] || '#6B7280',
      fontWeight: '500'
    };
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gym-neon">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gym-white tracking-tight">
            Gestiona los usuarios del sistema 
          </h1>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center shrink-0"
        >
          Nuevo Usuario
        </button>
      </div>

      {/* BARRA DE ACCIONES: EXPORTAR REPORTES */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gym-card/10 border border-gym-gray/10 rounded-xl backdrop-blur-sm">
        <p className="text-gym-gray text-xs font-mono uppercase tracking-wider">
           Reportes de Nómina Electrónica
        </p>
        <div className="flex gap-2 w-full sm:w-auto">
          {/* Botón PDF (Disfuncional) */}
          <button
            onClick={handleExportPDFDisfuncional}
            className="flex-1 sm:flex-none bg-transparent text-gym-danger/50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-gym-danger/20 hover:bg-gym-danger/10 hover:text-gym-danger transition-all duration-300 flex items-center gap-1.5 justify-center font-mono cursor-not-allowed"
            title="Módulo en desarrollo"
          >
            <svg className="w-3.5 h-3.5 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Exportar PDF
          </button>

          {/* Botón Excel Dinámico con los estados de Handry */}
          <button
            onClick={handleExportExcel}
            disabled={descargandoExcel}
            className="flex-1 sm:flex-none bg-transparent text-gym-success px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gym-success/10 border border-gym-success/30 transition-all duration-300 flex items-center gap-1.5 justify-center font-mono disabled:opacity-40"
          >
            {descargandoExcel ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-gym-success border-t-transparent rounded-full"></span>
                PROCESANDO...
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                </svg>
                Exportar Excel
              </>
            )}
          </button>
        </div>
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
          placeholder="Buscar usuario..."
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
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider whitespace-nowrap">Usuario</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider whitespace-nowrap">Nombre</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Cedula</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Correo</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Rol</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Estado</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gym-gray text-sm">
                    No hay usuarios registrados
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => (
                  <tr key={user.idusuario} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-white text-sm font-medium whitespace-nowrap">{user.usuario}</td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-white text-sm whitespace-nowrap">
                      {user.nombre} {user.apellido}
                    </td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-gray text-sm whitespace-nowrap hidden sm:table-cell">{user.cedula}</td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-gray text-sm whitespace-nowrap hidden lg:table-cell">{user.correo}</td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-sm whitespace-nowrap hidden md:table-cell" style={getRolStyle(user.rol)}>
                      {user.rol || 'Sin rol'}
                    </td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-sm whitespace-nowrap hidden md:table-cell" style={getStatusStyle(user.activo)}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <button
                          onClick={() => openEditModal(user)}
                          className="text-gym-gray hover:text-gym-white transition-colors p-1"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openStatusModal(user)}
                          className={`text-sm transition-colors ${
                            user.activo 
                              ? 'text-gym-danger hover:text-gym-danger/80' 
                              : 'text-gym-success hover:text-gym-success/80'
                          }`}
                          title={user.activo ? 'Desactivar' : 'Activar'}
                        >
                          {user.activo ? 'Desactivar' : 'Activar'}
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
            Mostrando {filteredUsuarios.length > 0 ? indexOfFirstItem + 1 : 0}-
            {Math.min(indexOfLastItem, filteredUsuarios.length)} de {filteredUsuarios.length} usuarios
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
          <div className="bg-gym-dark-secondary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gym-white">
                  {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
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

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Usuario *</label>
                    <input
                      name="usuario"
                      value={formData.usuario}
                      onChange={handleInputChange}
                      className="input-gym"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Rol *</label>
                    <select
                      name="idRol"
                      value={formData.idRol}
                      onChange={handleInputChange}
                      className="input-gym"
                      required
                    >
                      <option value={1}>Administrador</option>
                      <option value={2}>Recepcionista</option>
                      <option value={3}>Cliente</option>
                      <option value={4}>Entrenador</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Nombre *</label>
                    <input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="input-gym"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Apellido *</label>
                    <input
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="input-gym"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Cedula *</label>
                    <input
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleInputChange}
                      className="input-gym"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Telefono</label>
                    <input
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="input-gym"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Correo *</label>
                    <input
                      name="correo"
                      type="email"
                      value={formData.correo}
                      onChange={handleInputChange}
                      className="input-gym"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">
                      {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                    </label>
                    <input
                      name="clave"
                      type="password"
                      value={formData.clave}
                      onChange={handleInputChange}
                      className="input-gym"
                      required={!isEditing}
                      placeholder={isEditing ? 'Dejar vacio para no cambiar' : ''}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 md:pt-4 border-t border-gym-gray/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full sm:w-auto order-1 sm:order-2 disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Activar/Desactivar */}
      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-sm w-full border border-gym-gray/10 mx-4">
            <div className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gym-white mb-3 md:mb-4">
                {selectedUser.activo ? 'Desactivar' : 'Activar'} Usuario
              </h2>
              <p className="text-gym-gray-light text-sm md:text-base mb-4 md:mb-6">
                ¿Estas seguro de que deseas {selectedUser.activo ? 'desactivar' : 'activar'} al usuario 
                <span className="text-gym-white font-medium"> {selectedUser.nombre} {selectedUser.apellido}</span>?
                {selectedUser.activo && <span className="block text-gym-warning text-xs md:text-sm mt-2">El usuario no podra iniciar sesion hasta que sea reactivado.</span>}
                {!selectedUser.activo && <span className="block text-gym-success text-xs md:text-sm mt-2">El usuario podra iniciar sesion nuevamente.</span>}
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className={`${
                    selectedUser.activo ? 'bg-gym-danger' : 'bg-gym-success'
                  } text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto`}
                >
                  {loading ? 'Procesando...' : (selectedUser.activo ? 'Desactivar' : 'Activar')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;