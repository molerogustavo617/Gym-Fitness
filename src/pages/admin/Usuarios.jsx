// src/pages/admin/Usuarios.jsx
import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Edit,
  Eye,
  UserCheck,
  UserX,
  Shield,
  QrCode,
  Download,
  X,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  FileText,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import userService from '../../services/userService';
import authService from '../../services/authService';
import qrService from '../../services/qrService';
import membresiaService from '../../services/membresiaService';
import membresiaUsuarioService from '../../services/membresiaUsuarioService';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descargandoExcel, setDescargandoExcel] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  
  // Estados para Asignar Membresía
  const [showMembresiaModal, setShowMembresiaModal] = useState(false);
  const [membresias, setMembresias] = useState([]);
  const [membresiaForm, setMembresiaForm] = useState({
    idMembresia: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: '',
    estado: 'activo'  // ✅ Cambiado de 'activa' a 'activo'
  });
  const [loadingMembresia, setLoadingMembresia] = useState(false);

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
    if (!currentUser || (currentUser.idrol !== 1 && currentUser.idrol !== 2)) {
      window.location.href = '/dashboard';
      return;
    }
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await userService.getAll();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los usuarios');
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMembresias = async () => {
    try {
      const data = await membresiaService.getAll();
      setMembresias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar membresías:', err);
      setError('Error al cargar tipos de membresía');
    }
  };

  const handleExportExcel = async () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.idrol !== 1) {
      setError('No tienes permiso para exportar reportes');
      return;
    }
    
    setDescargandoExcel(true);
    setError('');
    try {
      const blob = await userService.downloadExcelReport();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess('Reporte descargado correctamente');
    } catch (err) {
      console.error('Error al descargar Excel:', err);
      setError('Error al descargar el reporte Excel');
    } finally {
      setDescargandoExcel(false);
    }
  };

  const handleExportPDF = () => {
    alert('Módulo de Reportes PDF en desarrollo. Estará disponible en la próxima actualización.');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const openCreateModal = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.idrol !== 1) {
      setError('No tienes permiso para crear usuarios');
      return;
    }
    
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
    const currentUser = authService.getCurrentUser();
    if (currentUser?.idrol !== 1) {
      setError('No tienes permiso para editar usuarios');
      return;
    }
    
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
    const currentUser = authService.getCurrentUser();
    if (currentUser?.idrol !== 1) {
      setError('No tienes permiso para cambiar el estado de usuarios');
      return;
    }
    
    setSelectedUser(user);
    setShowStatusModal(true);
    setError('');
    setSuccess('');
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const openQRModal = async (user) => {
    setSelectedUser(user);
    setQrLoading(true);
    setShowQRModal(true);
    setQrData(null);
    setError('');
    
    try {
      const response = await qrService.getByUser(user.idusuario);
      if (response && (response.qrImage || response.qrCode)) {
        setQrData(response.qrImage || response.qrCode);
      } else if (response && response.qr) {
        setQrData(response.qr);
      } else {
        setQrData(null);
        setError('No se encontró un QR para este usuario');
      }
    } catch (err) {
      console.error('Error al obtener QR:', err);
      setQrData(null);
      setError('Error al obtener el código QR');
    } finally {
      setQrLoading(false);
    }
  };

  // ============================================================
  // FUNCIONES PARA ASIGNAR MEMBRESÍA
  // ============================================================
  const openMembresiaModal = async (user) => {
    setSelectedUser(user);
    setMembresiaForm({
      idMembresia: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      estado: 'activo'  // ✅ Cambiado de 'activa' a 'activo'
    });
    setError('');
    setSuccess('');
    await loadMembresias();
    setShowMembresiaModal(true);
  };

  const handleMembresiaChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'idMembresia') {
      const idMembresia = parseInt(value);
      const membresia = membresias.find(m => m.idmembresia === idMembresia);
      
      setMembresiaForm({
        ...membresiaForm,
        idMembresia: idMembresia,
        fechaFin: membresia?.duraciondias 
          ? new Date(Date.now() + membresia.duraciondias * 24 * 60 * 60 * 1000)
              .toISOString().split('T')[0]
          : ''
      });
    } else {
      setMembresiaForm({
        ...membresiaForm,
        [name]: value
      });
    }
  };

  const handleAsignarMembresia = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoadingMembresia(true);

    try {
      if (!membresiaForm.idMembresia) {
        setError('Selecciona un tipo de membresía');
        setLoadingMembresia(false);
        return;
      }

      const dataToSend = {
        idUsuario: selectedUser.idusuario,
        idMembresia: parseInt(membresiaForm.idMembresia),
        fechaInicio: membresiaForm.fechaInicio,
        fechaFin: membresiaForm.fechaFin || null,
        estado: membresiaForm.estado  // ✅ Ahora envía 'activo', 'vencido', etc.
      };

      console.log('📤 Asignando membresía:', dataToSend);

      await membresiaUsuarioService.create(dataToSend);
      setSuccess('Membresía asignada correctamente');
      
      setTimeout(() => {
        setShowMembresiaModal(false);
        loadUsuarios();
        setLoadingMembresia(false);
      }, 1500);
    } catch (err) {
      console.error('❌ Error al asignar membresía:', err);
      console.error('❌ Respuesta del servidor:', err.response?.data);
      setError(err.response?.data?.error || 'Error al asignar membresía');
      setLoadingMembresia(false);
    }
  };

  // ============================================================
  // FIN FUNCIONES MEMBRESÍA
  // ============================================================

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
      console.error('Error al guardar:', err);
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
      console.error('Error al cambiar estado:', err);
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

  const getRolColor = (rol) => {
    const colors = {
      'Administrador': 'text-purple-400',
      'Recepcionista': 'text-blue-400',
      'Cliente': 'text-green-400',
      'Entrenador': 'text-orange-400'
    };
    return colors[rol] || 'text-gym-gray';
  };

  const getStatusColor = (activo) => {
    return activo ? 'text-green-400' : 'text-red-400';
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-gym-neon border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gym-gray-light">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gym-dark-secondary p-3 md:p-4 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-gym-neon" />
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gym-white tracking-tight">Usuarios</h1>
            <p className="text-gym-gray text-xs hidden sm:block">Gestiona los usuarios del sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="bg-gym-neon text-gym-dark px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90 transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5" /> Nuevo
          </button>
        </div>
      </div>

      {/* Reportes y Buscador */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={descargandoExcel}
            className="bg-transparent text-green-400 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-400/10 border border-green-400/30 transition-colors flex items-center gap-1.5 disabled:opacity-40"
          >
            {descargandoExcel ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-green-400 border-t-transparent rounded-full"></span>
                Cargando...
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Excel
              </>
            )}
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-transparent text-red-400/50 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-400/20 hover:bg-red-400/10 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-not-allowed"
            disabled
          >
            <FileText className="w-3.5 h-3.5" />
            PDF
          </button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gym-gray-light" />
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 bg-gym-dark-secondary rounded-lg border border-gym-gray/20 text-gym-white text-sm placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors"
          />
        </div>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs min-w-[950px]">
            <thead>
              <tr className="border-b border-gym-gray/10 bg-gym-card/20">
                <th className="text-left py-2 px-2 text-gym-gray font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">Foto</th>
                <th className="text-left py-2 px-2 text-gym-gray font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">Usuario</th>
                <th className="text-left py-2 px-2 text-gym-gray font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">Nombre</th>
                <th className="text-left py-2 px-2 text-gym-gray font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">Cédula</th>
                <th className="text-left py-2 px-2 text-gym-gray font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">Correo</th>
                <th className="text-left py-2 px-2 text-gym-gray font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">Teléfono</th>
                <th className="text-left py-2 px-2 text-gym-gray font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">Rol</th>
                <th className="text-left py-2 px-2 text-gym-gray font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">Estado</th>
                <th className="text-left py-2 px-2 text-gym-gray font-medium text-[10px] uppercase tracking-wider whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-6 text-gym-gray text-sm">
                    No hay usuarios que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => (
                  <tr key={user.idusuario} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-1.5 px-2">
                      {user.fotoPerfil ? (
                        <img
                          src={user.fotoPerfil}
                          alt={user.nombre}
                          className="w-9 h-9 rounded-full object-cover border border-gym-gray/20"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gym-neon/10 flex items-center justify-center">
                          <span className="text-gym-neon font-semibold text-sm">
                            {(user.nombre?.charAt(0) || 'U').toUpperCase()}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-1.5 px-2">
                      <p className="text-gym-white text-xs font-medium whitespace-nowrap">
                        {user.usuario}
                      </p>
                    </td>
                    <td className="py-1.5 px-2">
                      <p className="text-gym-white text-xs whitespace-nowrap">
                        {user.nombre} {user.apellido}
                      </p>
                    </td>
                    <td className="py-1.5 px-2">
                      <p className="text-gym-gray text-xs whitespace-nowrap">
                        {user.cedula}
                      </p>
                    </td>
                    <td className="py-1.5 px-2">
                      <p className="text-gym-gray text-xs whitespace-nowrap">
                        {user.correo}
                      </p>
                    </td>
                    <td className="py-1.5 px-2">
                      <p className="text-gym-gray text-xs whitespace-nowrap">
                        {user.telefono || '-'}
                      </p>
                    </td>
                    <td className="py-1.5 px-2">
                      <span className={`font-medium text-xs whitespace-nowrap ${getRolColor(user.rol)}`}>
                        {user.rol || 'Sin rol'}
                      </span>
                    </td>
                    <td className="py-1.5 px-2">
                      <span className={`font-medium text-xs whitespace-nowrap ${getStatusColor(user.activo)}`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-1.5 px-2">
                      <div className="flex items-center gap-0.5 whitespace-nowrap flex-wrap">
                        <button
                          onClick={() => openDetailModal(user)}
                          className="p-1 rounded hover:bg-gym-neon/10 text-gym-gray-light hover:text-gym-neon transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openQRModal(user)}
                          className="p-1 rounded hover:bg-gym-neon/10 text-gym-gray-light hover:text-gym-neon transition-colors"
                          title="Ver QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1 rounded hover:bg-blue-500/10 text-gym-gray-light hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {/* ✅ BOTÓN ASIGNAR MEMBRESÍA (solo para clientes) */}
                        {user.idrol === 3 && (
                          <button
                            onClick={() => openMembresiaModal(user)}
                            className="p-1 rounded hover:bg-green-500/10 text-gym-gray-light hover:text-green-400 transition-colors"
                            title="Asignar membresía"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => openStatusModal(user)}
                          className={`p-1 rounded transition-colors ${
                            user.activo 
                              ? 'hover:bg-red-500/10 text-gym-gray-light hover:text-red-400'
                              : 'hover:bg-green-500/10 text-gym-gray-light hover:text-green-400'
                          }`}
                          title={user.activo ? 'Desactivar' : 'Activar'}
                        >
                          {user.activo ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
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
        {filteredUsuarios.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1.5 px-3 py-2 border-t border-gym-gray/10">
            <span className="text-gym-gray text-[10px]">
              {filteredUsuarios.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, filteredUsuarios.length)} de {filteredUsuarios.length}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-0.5 rounded text-xs ${
                  currentPage === 1 
                    ? 'text-gym-gray/30 cursor-not-allowed' 
                    : 'text-gym-gray-light hover:bg-gym-card'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
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
                    className={`w-6 h-6 rounded text-xs font-medium ${
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
                className={`px-2 py-0.5 rounded text-xs ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-gym-gray/30 cursor-not-allowed' 
                    : 'text-gym-gray-light hover:bg-gym-card'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL ASIGNAR MEMBRESÍA */}
      {/* ============================================================ */}
      {showMembresiaModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gym-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gym-neon" />
                  Asignar Membresía
                </h2>
                <button
                  onClick={() => setShowMembresiaModal(false)}
                  className="text-gym-gray hover:text-gym-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-gym-gray-light text-sm mb-4">
                Cliente: <span className="text-gym-white font-medium">{selectedUser.nombre} {selectedUser.apellido}</span>
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error}
                  <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              {success && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {success}
                  <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleAsignarMembresia} className="space-y-4">
                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Tipo de Membresía *</label>
                  <select
                    name="idMembresia"
                    value={membresiaForm.idMembresia}
                    onChange={handleMembresiaChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    {membresias.map((m) => (
                      <option key={m.idmembresia} value={m.idmembresia}>
                        {m.nombre} - ${m.precio} ({m.duraciondias} días)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Fecha Inicio</label>
                    <input
                      name="fechaInicio"
                      type="date"
                      value={membresiaForm.fechaInicio}
                      onChange={handleMembresiaChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Fecha Fin</label>
                    <input
                      name="fechaFin"
                      type="date"
                      value={membresiaForm.fechaFin}
                      onChange={handleMembresiaChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Estado</label>
                  <select
                    name="estado"
                    value={membresiaForm.estado}
                    onChange={handleMembresiaChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                  >
                    <option value="activo">Activo</option>
                    <option value="vencido">Vencido</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gym-gray/10">
                  <button
                    type="button"
                    onClick={() => setShowMembresiaModal(false)}
                    className="px-4 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors w-full sm:w-auto"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loadingMembresia}
                    className="bg-gym-neon text-gym-dark px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {loadingMembresia ? (
                      <>
                        <span className="w-4 h-4 border-2 border-gym-dark border-t-transparent rounded-full animate-spin"></span>
                        Asignando...
                      </>
                    ) : (
                      'Asignar Membresía'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODALES EXISTENTES (sin cambios) */}
      {/* ============================================================ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gym-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-gym-neon" />
                  {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gym-gray hover:text-gym-white transition-colors"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
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
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Rol *</label>
                    <select
                      name="idRol"
                      value={formData.idRol}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
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
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Apellido *</label>
                    <input
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Cédula *</label>
                    <input
                      name="cedula"
                      value={formData.cedula}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Teléfono</label>
                    <input
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-gym-gray-light text-xs md:text-sm block mb-1">Correo *</label>
                    <input
                      name="correo"
                      type="email"
                      value={formData.correo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
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
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                      required={!isEditing}
                      placeholder={isEditing ? 'Dejar vacío para no cambiar' : ''}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 md:pt-4 border-t border-gym-gray/10">
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

      {showStatusModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-sm w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-full ${selectedUser.activo ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                  {selectedUser.activo ? <UserX className="w-6 h-6 text-red-400" /> : <UserCheck className="w-6 h-6 text-green-400" />}
                </div>
                <h2 className="text-lg md:text-xl font-bold text-gym-white">
                  {selectedUser.activo ? 'Desactivar' : 'Activar'} Usuario
                </h2>
              </div>
              <p className="text-gym-gray-light text-sm md:text-base mb-4 md:mb-6">
                ¿Estás seguro de que deseas {selectedUser.activo ? 'desactivar' : 'activar'} al usuario 
                <span className="text-gym-white font-medium"> {selectedUser.nombre} {selectedUser.apellido}</span>?
              </p>
              {selectedUser.activo && (
                <p className="text-yellow-400 text-xs md:text-sm mb-4 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  El usuario no podrá iniciar sesión hasta que sea reactivado.
                </p>
              )}
              {!selectedUser.activo && (
                <p className="text-green-400 text-xs md:text-sm mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  El usuario podrá iniciar sesión nuevamente.
                </p>
              )}
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleToggleStatus}
                  disabled={loading}
                  className={`${
                    selectedUser.activo ? 'bg-red-500' : 'bg-green-500'
                  } text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Procesando...
                    </>
                  ) : (
                    selectedUser.activo ? 'Desactivar' : 'Activar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-gym-dark-secondary rounded-2xl max-w-lg w-full p-6 border border-gym-gray/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gym-neon" />
                Detalles del Usuario
              </h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gym-gray-light hover:text-gym-neon transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-gym-gray/10">
                {selectedUser.fotoPerfil ? (
                  <img
                    src={selectedUser.fotoPerfil}
                    alt={selectedUser.nombre}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gym-neon/30"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gym-neon/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gym-neon">
                      {(selectedUser.nombre?.charAt(0) || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-xl font-bold text-white">{selectedUser.nombre} {selectedUser.apellido}</p>
                  <p className="text-gym-gray-light">@{selectedUser.usuario}</p>
                  <span className={`font-medium ${getRolColor(selectedUser.rol)}`}>
                    {selectedUser.rol || 'Sin rol'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gym-gray-light">Cédula</p>
                  <p className="text-gym-white font-medium">{selectedUser.cedula || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gym-gray-light">Email</p>
                  <p className="text-gym-white font-medium">{selectedUser.correo || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gym-gray-light">Teléfono</p>
                  <p className="text-gym-white font-medium">{selectedUser.telefono || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gym-gray-light">Estado</p>
                  <span className={`font-medium ${getStatusColor(selectedUser.activo)}`}>
                    {selectedUser.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gym-gray-light">Rol</p>
                  <span className={`font-medium ${getRolColor(selectedUser.rol)}`}>
                    {selectedUser.rol || 'Sin rol'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full mt-6 px-4 py-2 bg-gym-neon/10 text-gym-neon rounded-lg hover:bg-gym-neon/20 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showQRModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowQRModal(false)}>
          <div className="bg-gym-dark-secondary rounded-2xl max-w-sm w-full p-6 border border-gym-gray/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-gym-neon" />
                QR de {selectedUser.nombre}
              </h3>
              <button onClick={() => setShowQRModal(false)} className="text-gym-gray-light hover:text-gym-neon transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col items-center">
              {qrLoading ? (
                <div className="w-48 h-48 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-gym-neon border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : qrData && typeof qrData === 'string' && qrData.startsWith('data:image') ? (
                <img src={qrData} alt="QR Code" className="w-48 h-48 object-contain bg-white p-2 rounded-lg" />
              ) : qrData && typeof qrData === 'string' ? (
                <div className="w-48 h-48 flex flex-col items-center justify-center bg-gym-dark rounded-lg border-2 border-gym-neon/20">
                  <QrCode className="w-16 h-16 text-gym-neon" />
                  <p className="text-xs text-gym-gray-light mt-2 text-center px-4 break-all">{qrData}</p>
                </div>
              ) : (
                <div className="w-48 h-48 flex flex-col items-center justify-center bg-gym-dark rounded-lg border-2 border-dashed border-gym-gray/30">
                  <QrCode className="w-16 h-16 text-gym-gray/30" />
                  <p className="text-sm text-gym-gray-light mt-2">Sin QR disponible</p>
                </div>
              )}
              <p className="text-sm text-gym-gray-light mt-4 text-center">
                {selectedUser.nombre} {selectedUser.apellido}
              </p>
            </div>
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full mt-6 px-4 py-2 bg-gym-neon/10 text-gym-neon rounded-lg hover:bg-gym-neon/20 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;