// src/pages/recepcionista/UsuariosRecepcionista.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Eye,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Shield,
  BadgeCheck,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  X
} from 'lucide-react';
import authService from '../../services/authService';
import userService from '../../services/userService';

const UsuariosRecepcionista = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 2) {
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
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar los usuarios');
      setUsuarios([]);
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
    return colors[rol] || 'text-[#9A9AA0]';
  };

  const getRolBadge = (rol) => {
    const colors = {
      'Administrador': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Recepcionista': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Cliente': 'bg-green-500/10 text-green-400 border-green-500/20',
      'Entrenador': 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    };
    return colors[rol] || 'bg-[#0A0A0B] text-[#9A9AA0] border-[#5C5C60]/20';
  };

  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && usuarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-[#00F2FE]/20 border-t-[#00F2FE] rounded-full animate-spin"></div>
        <div className="text-[#00F2FE] font-semibold text-sm tracking-wide">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-20">
      
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#00F2FE]/10 via-[#111625]/50 to-[#111625] border border-[#00F2FE]/20">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#00F2FE]/5 blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#00F2FE]/5 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Users className="w-7 h-7 text-[#00F2FE]" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Usuarios</h1>
              <p className="text-[#9A9AA0] text-xs font-mono">Visualiza la lista de usuarios del sistema</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#9A9AA0] font-mono">
              {usuarios.length} usuarios
            </span>
            <span className="text-[10px] font-mono bg-[#00F2FE]/10 text-[#00F2FE] px-3 py-1 rounded-full border border-[#00F2FE]/20">
              Solo lectura
            </span>
          </div>
        </div>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* BUSCADOR */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9A9AA0]" />
        <input
          type="text"
          placeholder="Buscar por nombre, usuario, cédula o correo..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full pl-9 pr-4 py-2.5 bg-[#0A0A0B]/50 border border-[#00F2FE]/10 rounded-xl text-white text-sm placeholder-[#9A9AA0] focus:outline-none focus:border-[#00F2FE]/40 transition-colors"
        />
      </div>

      {/* TABLA */}
      <div className="bg-[#111625]/30 border border-[#00F2FE]/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-[#00F2FE]/10 bg-[#0A0A0B]/30">
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">Usuario</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">Nombre</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Correo</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Teléfono</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">Rol</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap hidden lg:table-cell">Registro</th>
                <th className="text-left py-3 px-3 text-[#9A9AA0] font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-[#9A9AA0] text-sm">
                    No hay usuarios que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => (
                  <tr key={user.idusuario} className="border-b border-[#00F2FE]/5 hover:bg-[#00F2FE]/5 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/20 flex items-center justify-center text-[#00F2FE] font-bold text-xs overflow-hidden flex-shrink-0">
                          {user.fotoPerfil ? (
                            <img src={user.fotoPerfil} alt={user.nombre} className="w-full h-full object-cover" />
                          ) : (
                            (user.nombre?.charAt(0) || 'U').toUpperCase()
                          )}
                        </div>
                        <span className="text-white font-medium text-xs">
                          {user.usuario}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-white text-xs whitespace-nowrap">
                        {user.nombre} {user.apellido}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      <span className="text-[#9A9AA0] text-xs truncate max-w-[150px] block">
                        {user.correo}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <span className="text-[#9A9AA0] text-xs">
                        {user.telefono || '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getRolBadge(user.rol)}`}>
                        {user.rol || 'Sin rol'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 hidden lg:table-cell">
                      <span className="text-[#9A9AA0] text-xs">
                        {formatearFecha(user.fecharegistro)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => openDetailModal(user)}
                        className="p-1.5 rounded-lg hover:bg-[#00F2FE]/10 text-[#9A9AA0] hover:text-[#00F2FE] transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {filteredUsuarios.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-[#00F2FE]/10">
            <span className="text-[#9A9AA0] text-[10px]">
              {filteredUsuarios.length > 0 ? indexOfFirstItem + 1 : 0}-
              {Math.min(indexOfLastItem, filteredUsuarios.length)} de {filteredUsuarios.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-2 py-1 rounded-lg text-xs ${
                  currentPage === 1 
                    ? 'text-[#9A9AA0]/30 cursor-not-allowed' 
                    : 'text-[#9A9AA0] hover:bg-[#00F2FE]/10'
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
                    className={`w-7 h-7 rounded-lg text-xs font-medium ${
                      currentPage === pageNum
                        ? 'bg-[#00F2FE]/20 text-[#00F2FE]'
                        : 'text-[#9A9AA0] hover:bg-[#00F2FE]/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-2 py-1 rounded-lg text-xs ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-[#9A9AA0]/30 cursor-not-allowed' 
                    : 'text-[#9A9AA0] hover:bg-[#00F2FE]/10'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* MODAL DETALLE USUARIO */}
      {/* ============================================================ */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-[#00F2FE]/20 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-[#00F2FE]" />
                Detalles del Usuario
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Foto y nombre */}
              <div className="flex items-center gap-4 pb-4 border-b border-[#00F2FE]/10">
                <div className="w-16 h-16 rounded-full bg-[#00F2FE]/10 border-2 border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] font-bold text-2xl overflow-hidden">
                  {selectedUser.fotoPerfil ? (
                    <img src={selectedUser.fotoPerfil} alt={selectedUser.nombre} className="w-full h-full object-cover" />
                  ) : (
                    (selectedUser.nombre?.charAt(0) || 'U').toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">{selectedUser.nombre} {selectedUser.apellido}</p>
                  <p className="text-[#9A9AA0] text-xs font-mono">@{selectedUser.usuario}</p>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getRolBadge(selectedUser.rol)}`}>
                    {selectedUser.rol || 'Sin rol'}
                  </span>
                </div>
              </div>

              {/* Información */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                    <UserIcon className="w-3 h-3" /> Cédula
                  </p>
                  <p className="text-white font-medium">{selectedUser.cedula || '-'}</p>
                </div>
                <div>
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="text-white font-medium">{selectedUser.correo || '-'}</p>
                </div>
                <div>
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Teléfono
                  </p>
                  <p className="text-white font-medium">{selectedUser.telefono || '-'}</p>
                </div>
                <div>
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Registro
                  </p>
                  <p className="text-white font-medium">{formatearFecha(selectedUser.fecharegistro)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Estado
                  </p>
                  <span className={`text-sm font-medium ${selectedUser.activo ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedUser.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full mt-6 px-4 py-2 bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/20 rounded-xl font-medium hover:bg-[#00F2FE]/20 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosRecepcionista;