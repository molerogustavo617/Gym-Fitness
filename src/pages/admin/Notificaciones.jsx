// src/pages/admin/Notificaciones.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Check,
  Send,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  AlertTriangle,
  AlertCircle,
  Clock,
  User,
  Users as UsersIcon,
  DollarSign,
  Calendar,
  FileText,
  Filter
} from 'lucide-react';
import notificacionService from '../../services/notificacionService';
import userService from '../../services/userService';
import authService from '../../services/authService';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterLeido, setFilterLeido] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNotificacion, setSelectedNotificacion] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    destino: 'usuario',
    idUsuario: '',
    rol: '',
    titulo: '',
    mensaje: '',
    tipo: 'sistema'
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (user.idrol !== 1 && user.idrol !== 2)) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [notificacionesData, usuariosData] = await Promise.all([
        notificacionService.getAll(),
        userService.getAll()
      ]);
      setNotificaciones(notificacionesData);
      setUsuarios(usuariosData);
    } catch (err) {
      setError('Error al cargar las notificaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotificaciones = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await notificacionService.getAll();
      setNotificaciones(data);
    } catch (err) {
      setError('Error al cargar las notificaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDestinoChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      destino: value,
      idUsuario: '',
      rol: ''
    });
  };

  const openCreateModal = () => {
    setFormData({
      destino: 'usuario',
      idUsuario: '',
      rol: '',
      titulo: '',
      mensaje: '',
      tipo: 'sistema'
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (notificacion) => {
    setSelectedNotificacion(notificacion);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setEnviando(true);

    try {
      let usuariosDestino = [];

      if (formData.destino === 'usuario') {
        if (!formData.idUsuario) {
          setError('Selecciona un usuario');
          setEnviando(false);
          return;
        }
        usuariosDestino = [parseInt(formData.idUsuario)];
      } else if (formData.destino === 'todos') {
        usuariosDestino = usuarios.map(u => u.idusuario);
      } else if (formData.destino === 'rol') {
        if (!formData.rol) {
          setError('Selecciona un rol');
          setEnviando(false);
          return;
        }
        usuariosDestino = usuarios
          .filter(u => u.idrol === parseInt(formData.rol))
          .map(u => u.idusuario);
      }

      if (usuariosDestino.length === 0) {
        setError('No hay usuarios para enviar la notificación');
        setEnviando(false);
        return;
      }

      const promises = usuariosDestino.map(idUsuario => {
        const dataToSend = {
          idUsuario,
          titulo: formData.titulo,
          mensaje: formData.mensaje,
          tipo: formData.tipo
        };
        return notificacionService.create(dataToSend);
      });

      await Promise.all(promises);

      const mensajeDestino = formData.destino === 'usuario' 
        ? `usuario ${usuarios.find(u => u.idusuario === parseInt(formData.idUsuario))?.nombre || ''}`
        : formData.destino === 'todos' 
          ? 'todos los usuarios'
          : `todos los ${getRolNombre(formData.rol)}`;

      setSuccess(`Notificación enviada a ${mensajeDestino} (${usuariosDestino.length} usuarios)`);
      setShowModal(false);
      loadNotificaciones();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar la notificación');
    } finally {
      setEnviando(false);
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await notificacionService.marcarLeida(id);
      loadNotificaciones();
    } catch (err) {
      setError('Error al marcar como leída');
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await notificacionService.delete(selectedNotificacion.idnotificacion);
      setSuccess('Notificación eliminada correctamente');
      setShowDeleteModal(false);
      loadNotificaciones();
    } catch (err) {
      setError('Error al eliminar la notificación');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (id) => {
    const user = usuarios.find(u => u.idusuario === id);
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido';
  };

  const getRolNombre = (idRol) => {
    const roles = {
      1: 'Administradores',
      2: 'Recepcionistas',
      3: 'Clientes',
      4: 'Entrenadores'
    };
    return roles[idRol] || 'Usuarios';
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTipoColor = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'pago': return 'text-green-400 bg-green-400/10 border border-green-400/20';
      case 'rutina': return 'text-blue-400 bg-blue-400/10 border border-blue-400/20';
      case 'recordatorio': return 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20';
      case 'sistema': return 'text-purple-400 bg-purple-400/10 border border-purple-400/20';
      default: return 'text-gym-gray bg-gym-gray/10 border border-gym-gray/20';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'pago': return <DollarSign className="w-4 h-4" />;
      case 'rutina': return <FileText className="w-4 h-4" />;
      case 'recordatorio': return <Clock className="w-4 h-4" />;
      case 'sistema': return <Bell className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const filteredNotificaciones = notificaciones.filter(notif => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      notif.titulo?.toLowerCase().includes(search) ||
      notif.mensaje?.toLowerCase().includes(search) ||
      getUserName(notif.idusuario).toLowerCase().includes(search);
    const matchUsuario = filterUsuario ? notif.idusuario === parseInt(filterUsuario) : true;
    const matchLeido = filterLeido !== '' ? notif.leido === (filterLeido === 'true') : true;
    const matchTipo = filterTipo ? notif.tipo === filterTipo : true;
    return matchSearch && matchUsuario && matchLeido && matchTipo;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNotificaciones.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotificaciones.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando notificaciones...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <Bell className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-2xl font-bold text-gym-white tracking-tight">Notificaciones</h1>
            <p className="text-gym-gray text-sm hidden sm:block">Gestiona las notificaciones del sistema</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Send className="w-4 h-4" /> Nueva Notificación
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gym-gray-light" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>
          <select
            value={filterUsuario}
            onChange={(e) => {
              setFilterUsuario(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todos los usuarios</option>
            {usuarios.map((user) => (
              <option key={user.idusuario} value={user.idusuario}>
                {user.nombre} {user.apellido}
              </option>
            ))}
          </select>
          <select
            value={filterTipo}
            onChange={(e) => {
              setFilterTipo(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todos los tipos</option>
            <option value="pago">Pago</option>
            <option value="rutina">Rutina</option>
            <option value="recordatorio">Recordatorio</option>
            <option value="sistema">Sistema</option>
          </select>
          <select
            value={filterLeido}
            onChange={(e) => {
              setFilterLeido(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="true">Leído</option>
            <option value="false">No leído</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gym-gray/10">
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Título</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden sm:table-cell">Usuario</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden md:table-cell">Tipo</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((notif) => (
                  <tr key={notif.idnotificacion} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {!notif.leido && <span className="w-2 h-2 bg-gym-neon rounded-full animate-pulse"></span>}
                        <span className="text-gym-white font-medium">{notif.titulo}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden sm:table-cell">{getUserName(notif.idusuario)}</td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <span className={`px-2 py-0.5 rounded-md text-xs flex items-center gap-1 ${getTipoColor(notif.tipo)}`}>
                        {getTipoIcon(notif.tipo)}
                        <span className="capitalize">{notif.tipo || 'sistema'}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gym-gray-light text-xs hidden lg:table-cell">{formatFecha(notif.fechacreacion)}</td>
                    <td className="py-2.5 px-3">
                      <span className={notif.leido ? 'text-gym-gray-light' : 'text-gym-neon font-medium'}>
                        {notif.leido ? 'Leído' : 'No leído'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        {!notif.leido && (
                          <button
                            onClick={() => handleMarcarLeida(notif.idnotificacion)}
                            className="text-gym-neon hover:text-gym-neon/80 transition-colors p-1 rounded hover:bg-gym-neon/10"
                            title="Marcar como leída"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(notif)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-400/10"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gym-gray">
                    No hay notificaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredNotificaciones.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gym-gray/10">
            <span className="text-gym-gray-light text-xs">
              Mostrando {indexOfFirstItem + 1} al {Math.min(indexOfLastItem, filteredNotificaciones.length)} de {filteredNotificaciones.length} notificaciones
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

      {/* Modal Crear */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-gray/10 max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gym-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-gym-neon" />
                  Nueva Notificación
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
                  <XCircle className="w-4 h-4" />
                  {error}
                  <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Destino *</label>
                  <select
                    name="destino"
                    value={formData.destino}
                    onChange={handleDestinoChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                  >
                    <option value="usuario">Usuario específico</option>
                    <option value="rol">Por rol</option>
                    <option value="todos">Todos los usuarios</option>
                  </select>
                </div>

                {formData.destino === 'usuario' && (
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Seleccionar usuario *</label>
                    <select
                      name="idUsuario"
                      value={formData.idUsuario}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    >
                      <option value="">Seleccionar usuario</option>
                      {usuarios.map((user) => (
                        <option key={user.idusuario} value={user.idusuario}>
                          {user.nombre} {user.apellido} (@{user.usuario})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.destino === 'rol' && (
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Seleccionar rol *</label>
                    <select
                      name="rol"
                      value={formData.rol}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      <option value="1">Administradores</option>
                      <option value="2">Recepcionistas</option>
                      <option value="3">Clientes</option>
                      <option value="4">Entrenadores</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Título *</label>
                  <input
                    name="titulo"
                    type="text"
                    placeholder="Título de la notificación"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Mensaje *</label>
                  <textarea
                    name="mensaje"
                    placeholder="Contenido de la notificación"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Tipo</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                  >
                    <option value="sistema">Sistema</option>
                    <option value="pago">Pago</option>
                    <option value="rutina">Rutina</option>
                    <option value="recordatorio">Recordatorio</option>
                  </select>
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
                    disabled={enviando}
                    className="bg-gym-neon text-gym-dark px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {enviando ? (
                      <>
                        <span className="w-4 h-4 border-2 border-gym-dark border-t-transparent rounded-full animate-spin"></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Enviar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedNotificacion && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gym-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Eliminar Notificación
              </h2>
              <p className="text-gym-gray-light text-sm mt-2">
                ¿Estás seguro de que deseas eliminar la notificación 
                <span className="text-gym-white font-medium"> "{selectedNotificacion.titulo}"</span>?
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

export default Notificaciones;