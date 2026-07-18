// src/pages/admin/Entrenados.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import entrenadosService from '../../services/entrenadosService';
import userService from '../../services/userService';
import authService from '../../services/authService';

const Entrenados = () => {
  const [relaciones, setRelaciones] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRelacion, setSelectedRelacion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filtroEntrenador, setFiltroEntrenador] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    idEntrenador: '',
    idEntrenado: '',
    horario: '',
    monto: '',
    fechaProximoPago: ''
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
      // 1. Traer relaciones
      console.log('===== CARGANDO RELACIONES =====');
      const relacionesData = await entrenadosService.getAll();
      console.log('Relaciones completas:', relacionesData);
      console.log('Cantidad de relaciones:', relacionesData?.length || 0);

      // 2. Traer usuarios
      console.log('===== CARGANDO USUARIOS =====');
      const usuariosData = await userService.getAll();
      console.log('Usuarios completos:', usuariosData);
      console.log('Cantidad de usuarios:', usuariosData?.length || 0);

      // 3. Ver cada usuario con su rol
      console.log('===== DETALLE DE USUARIOS =====');
      usuariosData.forEach(u => {
        console.log(`ID: ${u.idusuario}, Nombre: ${u.nombre} ${u.apellido}, idrol: ${u.idrol}, Tipo: ${typeof u.idrol}`);
      });

      // 4. Filtrar entrenadores (idrol = 4)
      const entrenadoresFiltrados = usuariosData.filter(u => {
        const rol = parseInt(u.idrol);
        console.log(`Usuario ${u.nombre}: idrol=${rol}, es entrenador? ${rol === 4}`);
        return rol === 4;
      });

      // 5. Filtrar alumnos (idrol = 3)
      const alumnosFiltrados = usuariosData.filter(u => {
        const rol = parseInt(u.idrol);
        console.log(`Usuario ${u.nombre}: idrol=${rol}, es alumno? ${rol === 3}`);
        return rol === 3;
      });

      console.log('===== RESULTADOS FILTRADOS =====');
      console.log('Entrenadores encontrados:', entrenadoresFiltrados.length);
      console.log('Alumnos encontrados:', alumnosFiltrados.length);

      if (entrenadoresFiltrados.length === 0) {
        console.warn('⚠️ No hay usuarios con idrol=4 (Entrenador)');
      }
      if (alumnosFiltrados.length === 0) {
        console.warn('⚠️ No hay usuarios con idrol=3 (Cliente)');
      }

      setRelaciones(relacionesData || []);
      setEntrenadores(entrenadoresFiltrados);
      setAlumnos(alumnosFiltrados);

    } catch (err) {
      console.error('❌ ERROR EN loadData:', err);
      setError('Error al cargar los datos: ' + (err.message || ''));
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
      idEntrenador: '',
      idEntrenado: '',
      horario: '',
      monto: '',
      fechaProximoPago: ''
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (relacion) => {
    setIsEditing(true);
    setFormData({
      idEntrenador: relacion.identrenador || '',
      idEntrenado: relacion.identrenado || '',
      horario: relacion.horario || '',
      monto: relacion.monto || '',
      fechaProximoPago: relacion.fechaproximopago ? relacion.fechaproximopago.split('T')[0] : ''
    });
    setSelectedRelacion(relacion);
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (relacion) => {
    setSelectedRelacion(relacion);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const dataToSend = {
        idEntrenador: parseInt(formData.idEntrenador),
        idEntrenado: parseInt(formData.idEntrenado),
        horario: formData.horario || null,
        monto: formData.monto ? parseFloat(formData.monto) : null,
        fechaProximoPago: formData.fechaProximoPago || null
      };

      console.log('Enviando datos:', dataToSend);

      if (isEditing) {
        await entrenadosService.update(selectedRelacion.identrenados, dataToSend);
        setSuccess('Relación actualizada correctamente');
      } else {
        await entrenadosService.create(dataToSend);
        setSuccess('Relación creada correctamente');
      }

      setShowModal(false);
      loadData();
    } catch (err) {
      console.error('Error al guardar:', err);
      setError(err.response?.data?.error || 'Error al guardar la relación');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await entrenadosService.delete(selectedRelacion.identrenados);
      setSuccess('Relación eliminada correctamente');
      setShowDeleteModal(false);
      loadData();
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError(err.response?.data?.error || 'Error al eliminar la relación');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar relaciones
  const filteredRelaciones = relaciones.filter(item => {
    const search = searchTerm.toLowerCase();
    const entrenadorMatch = item.entrenador_nombre?.toLowerCase().includes(search) ||
                            item.entrenador_apellido?.toLowerCase().includes(search);
    const alumnoMatch = item.entrenado_nombre?.toLowerCase().includes(search) ||
                        item.entrenado_apellido?.toLowerCase().includes(search);
    
    const filtroEntrenadorMatch = filtroEntrenador ? item.identrenador === parseInt(filtroEntrenador) : true;
    
    return (entrenadorMatch || alumnoMatch) && filtroEntrenadorMatch;
  });

  // Paginacion
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRelaciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRelaciones.length / itemsPerPage);

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

  // Formatear monto
  const formatMonto = (monto) => {
    if (!monto) return '-';
    return `$${parseFloat(monto).toFixed(2)}`;
  };

  // Obtener nombre completo
  const getNombreCompleto = (nombre, apellido) => {
    return `${nombre || ''} ${apellido || ''}`.trim() || '-';
  };

  if (loading && relaciones.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gym-neon">Cargando relaciones...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gym-white tracking-tight">
            Entrenados
          </h1>
          <p className="text-gym-gray text-sm mt-0.5">
            Gestión de relaciones entrenador-alumno
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Asignar Entrenador
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

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por entrenador o alumno..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full input-gym"
          />
        </div>
        <select
          value={filtroEntrenador}
          onChange={(e) => {
            setFiltroEntrenador(e.target.value);
            setCurrentPage(1);
          }}
          className="input-gym w-full sm:w-48"
        >
          <option value="">Todos los entrenadores</option>
          {entrenadores.map((ent) => (
            <option key={ent.idusuario} value={ent.idusuario}>
              {ent.nombre} {ent.apellido}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gym-gray/10">
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider">Entrenador</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Alumno</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider hidden md:table-cell">Horario</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Monto</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Próximo Pago</th>
                <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gym-gray text-sm">
                    No hay relaciones entrenador-alumno registradas
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.identrenados} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-white text-sm font-medium whitespace-nowrap">
                      {getNombreCompleto(item.entrenador_nombre, item.entrenador_apellido)}
                    </td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-white text-sm whitespace-nowrap hidden sm:table-cell">
                      {getNombreCompleto(item.entrenado_nombre, item.entrenado_apellido)}
                    </td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-gray text-sm whitespace-nowrap hidden md:table-cell">
                      {item.horario || '-'}
                    </td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-gray text-sm whitespace-nowrap hidden lg:table-cell">
                      {formatMonto(item.monto)}
                    </td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-gray text-sm whitespace-nowrap hidden lg:table-cell">
                      {formatDate(item.fechaproximopago)}
                    </td>
                    <td className="py-2.5 md:py-3 px-3 md:px-4">
                      <div className="flex items-center gap-2 md:gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-gym-gray hover:text-gym-white transition-colors p-1"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteModal(item)}
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
            Mostrando {filteredRelaciones.length > 0 ? indexOfFirstItem + 1 : 0}-
            {Math.min(indexOfLastItem, filteredRelaciones.length)} de {filteredRelaciones.length} relaciones
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
                  {isEditing ? 'Editar Relación' : 'Asignar Entrenador'}
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
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Entrenador *</label>
                    <select
                      name="idEntrenador"
                      value={formData.idEntrenador}
                      onChange={handleInputChange}
                      className="input-gym"
                      required
                    >
                      <option value="">Seleccionar entrenador</option>
                      {entrenadores.map((ent) => (
                        <option key={ent.idusuario} value={ent.idusuario}>
                          {ent.nombre} {ent.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Alumno *</label>
                    <select
                      name="idEntrenado"
                      value={formData.idEntrenado}
                      onChange={handleInputChange}
                      className="input-gym"
                      required
                    >
                      <option value="">Seleccionar alumno</option>
                      {alumnos.map((alum) => (
                        <option key={alum.idusuario} value={alum.idusuario}>
                          {alum.nombre} {alum.apellido}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Horario</label>
                    <input
                      name="horario"
                      value={formData.horario}
                      onChange={handleInputChange}
                      className="input-gym"
                      placeholder="Ej: Lunes y Miércoles 10:00 AM"
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Monto ($)</label>
                    <input
                      name="monto"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monto}
                      onChange={handleInputChange}
                      className="input-gym"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Fecha Próximo Pago</label>
                    <input
                      name="fechaProximoPago"
                      type="date"
                      value={formData.fechaProximoPago}
                      onChange={handleInputChange}
                      className="input-gym"
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
                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Asignar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedRelacion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-sm w-full border border-gym-gray/10 mx-4">
            <div className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gym-white mb-3 md:mb-4">
                Eliminar Relación
              </h2>
              <p className="text-gym-gray-light text-sm md:text-base mb-4 md:mb-6">
                ¿Estas seguro de que deseas eliminar esta relación?
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

export default Entrenados;