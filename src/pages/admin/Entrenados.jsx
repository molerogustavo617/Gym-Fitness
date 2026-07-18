// src/pages/admin/Entrenados.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  User,
  UserPlus,
  UserX,
  Calendar,
  Clock,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle,
  X,
  Trash2,
  Edit,
  Eye,
  Power,
  AlertCircle
} from 'lucide-react';
import entrenadosService from '../../services/entrenadosService';
import userService from '../../services/userService';
import authService from '../../services/authService';

const Entrenados = () => {
  const [relaciones, setRelaciones] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEntrenador, setFilterEntrenador] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRelacion, setSelectedRelacion] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identrenador: '',
    identrenado: '',
    fechainicio: new Date().toISOString().split('T')[0],
    fechaproximopago: '',
    monto: '',
    horario: '',
    activo: true
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (user.idrol !== 1 && user.idrol !== 4)) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [relacionesData, usuariosData] = await Promise.all([
        entrenadosService.getAll(),
        userService.getAll()
      ]);

      const entrenadoresList = usuariosData.filter(u => u.idrol === 4);
      const clientesList = usuariosData.filter(u => u.idrol === 3);

      setRelaciones(Array.isArray(relacionesData) ? relacionesData : []);
      setEntrenadores(Array.isArray(entrenadoresList) ? entrenadoresList : []);
      setClientes(Array.isArray(clientesList) ? clientesList : []);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('❌ Error loadData:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadRelaciones = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await entrenadosService.getAll();
      setRelaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Error al cargar las relaciones');
      console.error('❌ Error loadRelaciones:', err);
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
      identrenador: '',
      identrenado: '',
      fechainicio: new Date().toISOString().split('T')[0],
      fechaproximopago: '',
      monto: '',
      horario: '',
      activo: true
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (relacion) => {
    setIsEditing(true);
    setSelectedRelacion(relacion);
    setFormData({
      identrenador: relacion.identrenador || '',
      identrenado: relacion.identrenado || '',
      fechainicio: relacion.fechainicio ? relacion.fechainicio.split('T')[0] : '',
      fechaproximopago: relacion.fechaproximopago ? relacion.fechaproximopago.split('T')[0] : '',
      monto: relacion.monto || '',
      horario: relacion.horario || '',
      activo: relacion.activo !== undefined ? relacion.activo : true
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (relacion) => {
    setSelectedRelacion(relacion);
    setShowDeleteModal(true);
  };

  // ============================================================
  // ✅ HANDLE SUBMIT CORREGIDO - CamelCase para el backend
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.identrenador) {
        setError('Debes seleccionar un entrenador');
        setLoading(false);
        return;
      }
      if (!formData.identrenado) {
        setError('Debes seleccionar un cliente');
        setLoading(false);
        return;
      }

      // ✅ CORREGIDO: Nombres de campos en camelCase
      const dataToSend = {
        idEntrenador: parseInt(formData.identrenador),
        idEntrenado: parseInt(formData.identrenado),
        fechaInicio: formData.fechainicio || new Date().toISOString().split('T')[0],
        fechaProximoPago: formData.fechaproximopago || null,
        monto: formData.monto ? parseFloat(formData.monto) : null,
        horario: formData.horario || null,
        activo: formData.activo !== undefined ? formData.activo : true
      };

      console.log('📤 Datos a enviar:', JSON.stringify(dataToSend, null, 2));

      if (isEditing) {
        await entrenadosService.update(selectedRelacion.identrenados, dataToSend);
        setSuccess('Relación actualizada correctamente');
      } else {
        await entrenadosService.create(dataToSend);
        setSuccess('Relación creada correctamente');
      }

      setShowModal(false);
      loadRelaciones();
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      console.error('❌ Respuesta del servidor:', err.response?.data);
      console.error('❌ Status:', err.response?.status);
      
      const errorMsg = err.response?.data?.error || 
                       err.response?.data?.message || 
                       err.response?.data?.detail ||
                       'Error al guardar la relación';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await entrenadosService.deactivate(selectedRelacion.identrenados);
      setSuccess('Relación desactivada correctamente');
      setShowDeleteModal(false);
      loadRelaciones();
    } catch (err) {
      console.error('❌ Error al desactivar:', err);
      setError(err.response?.data?.error || 'Error al desactivar la relación');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (id) => {
    const user = [...entrenadores, ...clientes].find(u => u.idusuario === id);
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido';
  };

  const getUser = (id) => {
    return [...entrenadores, ...clientes].find(u => u.idusuario === id);
  };

  const filteredRelaciones = relaciones.filter(rel => {
    const search = searchTerm.toLowerCase();
    const nombreCliente = getUserName(rel.identrenado).toLowerCase();
    const nombreEntrenador = getUserName(rel.identrenador).toLowerCase();
    const matchSearch = nombreCliente.includes(search) || nombreEntrenador.includes(search);
    const matchEntrenador = filterEntrenador ? rel.identrenador === parseInt(filterEntrenador) : true;
    const matchActivo = filterActivo !== '' ? rel.activo === (filterActivo === 'true') : true;
    return matchSearch && matchEntrenador && matchActivo;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRelaciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRelaciones.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando relaciones...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-2xl font-bold text-gym-white tracking-tight">Relaciones Entrenador-Cliente</h1>
            <p className="text-gym-gray text-sm hidden sm:block">Gestiona la asignación de clientes a entrenadores</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <UserPlus className="w-4 h-4" /> Nueva Relación
        </button>
      </div>

      {/* Error/Success */}
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

      {/* Filtros */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gym-gray-light" />
            <input
              type="text"
              placeholder="Buscar cliente o entrenador..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>
          <select
            value={filterEntrenador}
            onChange={(e) => {
              setFilterEntrenador(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todos los entrenadores</option>
            {entrenadores.map((ent) => (
              <option key={ent.idusuario} value={ent.idusuario}>
                {ent.nombre} {ent.apellido}
              </option>
            ))}
          </select>
          <select
            value={filterActivo}
            onChange={(e) => {
              setFilterActivo(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gym-gray/10">
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Cliente</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Entrenador</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden sm:table-cell">Inicio</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden md:table-cell">Próximo pago</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden md:table-cell">Monto</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden lg:table-cell">Horario</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((rel) => (
                  <tr key={rel.identrenados} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 px-3 text-gym-white font-medium">{getUserName(rel.identrenado)}</td>
                    <td className="py-2.5 px-3 text-gym-gray-light">{getUserName(rel.identrenador)}</td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden sm:table-cell">{formatFecha(rel.fechainicio)}</td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden md:table-cell">{formatFecha(rel.fechaproximopago)}</td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden md:table-cell">{rel.monto ? `$${rel.monto}` : '-'}</td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden lg:table-cell">{rel.horario || '-'}</td>
                    <td className="py-2.5 px-3">
                      <span className={rel.activo ? 'text-green-400' : 'text-red-400'}>
                        {rel.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(rel)}
                          className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-400/10"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {rel.activo ? (
                          <button
                            onClick={() => openDeleteModal(rel)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-400/10"
                            title="Desactivar"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openEditModal({ ...rel, activo: true })}
                            className="text-green-400 hover:text-green-300 transition-colors p-1 rounded hover:bg-green-400/10"
                            title="Activar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gym-gray">
                    No hay relaciones entrenador-cliente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredRelaciones.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gym-gray/10">
            <span className="text-gym-gray-light text-xs">
              Mostrando {indexOfFirstItem + 1} al {Math.min(indexOfLastItem, filteredRelaciones.length)} de {filteredRelaciones.length} relaciones
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPage === 1 
                    ? 'text-gym-gray/30 cursor-not-allowed' 
                    : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
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
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-gym-neon/10 text-gym-neon border border-gym-neon/30'
                        : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-gym-gray/30 cursor-not-allowed' 
                    : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
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
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gym-white">
                  {isEditing ? 'Editar Relación' : 'Nueva Relación'}
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
                  <label className="text-gym-gray-light text-sm block mb-1">Cliente *</label>
                  <select
                    name="identrenado"
                    value={formData.identrenado}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {clientes.map((cli) => (
                      <option key={cli.idusuario} value={cli.idusuario}>
                        {cli.nombre} {cli.apellido}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Entrenador *</label>
                  <select
                    name="identrenador"
                    value={formData.identrenador}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Fecha inicio</label>
                    <input
                      name="fechainicio"
                      type="date"
                      value={formData.fechainicio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Próximo pago</label>
                    <input
                      name="fechaproximopago"
                      type="date"
                      value={formData.fechaproximopago}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Monto</label>
                    <input
                      name="monto"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.monto}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Horario</label>
                    <input
                      name="horario"
                      type="text"
                      placeholder="Lunes 10:00 AM"
                      value={formData.horario}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    name="activo"
                    type="checkbox"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="w-4 h-4 bg-gym-dark border-gym-gray/20 rounded text-gym-neon focus:ring-gym-neon/50"
                  />
                  <label className="text-gym-gray-light text-sm">Relación activa</label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gym-gray/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors w-full sm:w-auto"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gym-neon text-gym-dark px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto"
                  >
                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL DESACTIVAR */}
      {/* ============================================================ */}
      {showDeleteModal && selectedRelacion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gym-white flex items-center gap-2">
                <UserX className="w-5 h-5 text-red-400" />
                Desactivar Relación
              </h2>
              <p className="text-gym-gray-light text-sm mt-2">
                ¿Estás seguro de que deseas desactivar la relación entre 
                <span className="text-gym-white font-medium"> {getUserName(selectedRelacion.identrenado)}</span> y 
                <span className="text-gym-white font-medium"> {getUserName(selectedRelacion.identrenador)}</span>?
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 pt-4 border-t border-gym-gray/10">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 w-full sm:w-auto"
                >
                  {loading ? 'Desactivando...' : 'Desactivar'}
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