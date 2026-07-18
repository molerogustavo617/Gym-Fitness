// src/pages/admin/QR.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import {
  QrCode,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Users,
  Shield,
  Clock,
  X,
  ChevronRight,
  ChevronLeft,
  Power
} from 'lucide-react';
import qrService from '../../services/qrService';
import userService from '../../services/userService';
import authService from '../../services/authService';

const QR = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validateCode, setValidateCode] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (user.idrol !== 1 && user.idrol !== 2)) {
      navigate('/dashboard');
      return;
    }
    setCurrentUser(user);
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
    } finally {
      setLoading(false);
    }
  };

  const handleGetQR = async (userId) => {
    if (!userId) {
      setError('Selecciona un usuario');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setQrData(null);

    try {
      const response = await qrService.getByUser(parseInt(userId));
      setQrData(response);
      setSelectedUser(userId);
      setSuccess('QR encontrado');
    } catch (err) {
      setError(err.response?.data?.error || 'El usuario no tiene QR');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateQR = async (userId) => {
    if (!userId) return;
    if (currentUser?.idrol !== 1) {
      setError('No tienes permiso para activar QR');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await qrService.generate(parseInt(userId));
      setSuccess('QR activado exitosamente');
      loadUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al activar QR');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateQR = async (userId) => {
    if (!userId) return;
    if (currentUser?.idrol !== 1) {
      setError('No tienes permiso para desactivar QR');
      return;
    }

    if (!window.confirm('¿Estás seguro de que deseas desactivar el QR de este usuario?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setQrData(null);

    try {
      await qrService.deactivate(parseInt(userId));
      setSuccess('QR desactivado exitosamente');
      loadUsuarios();
      if (selectedUser === userId) {
        setSelectedUser(null);
        setQrData(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al desactivar QR');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateQR = async (codigo) => {
    if (!codigo) {
      setError('Ingresa un código QR para validar');
      return;
    }

    setLoading(true);
    setError('');
    setValidationResult(null);

    try {
      const response = await qrService.validate(codigo);
      setValidationResult(response);
      setSuccess('QR valido - Usuario: ' + (response.usuario?.nombre || 'Usuario'));
      setTimeout(() => {
        setShowValidateModal(false);
        setValidateCode('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'QR invalido');
      setValidationResult(null);
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
      user.cedula?.includes(search)
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

  const getUserName = (id) => {
    const user = usuarios.find(u => u.idusuario === parseInt(id));
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario no encontrado';
  };

  const handleOpenValidateModal = () => {
    setValidateCode('');
    setValidationResult(null);
    setShowValidateModal(true);
    setError('');
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <QrCode className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-2xl font-bold text-gym-white tracking-tight">Códigos QR</h1>
            <p className="text-gym-gray text-sm hidden sm:block">Los QR se generan automáticamente al crear usuarios</p>
          </div>
        </div>
        <button
          onClick={handleOpenValidateModal}
          className="bg-gym-neon/10 text-gym-neon px-4 py-2 rounded-lg text-sm font-medium hover:bg-gym-neon/20 transition-colors flex items-center gap-2 border border-gym-neon/20 w-full sm:w-auto justify-center"
        >
          <Shield className="w-4 h-4" /> Validar QR
        </button>
      </div>

      {/* Error/Success global */}
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

      {/* Buscador */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div>
          <label className="text-gym-gray-light text-sm block mb-1">Buscar usuario</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gym-gray-light" />
            <input
              type="text"
              placeholder="Nombre, apellido, cédula..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Visualización QR */}
      {qrData && selectedUser && (
        <div className="bg-gym-dark-secondary rounded-2xl border border-gym-neon/20 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gym-white">QR - {getUserName(selectedUser)}</h3>
            <span className={`text-sm font-medium ${qrData.activo !== false ? 'text-green-400' : 'text-red-400'}`}>
              {qrData.activo !== false ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {qrData.qr || qrData.codigo ? (
            <div className="flex flex-col items-center">
              <div className="bg-gym-dark p-6 rounded-lg">
                <QRCode 
                  value={qrData.qr || qrData.codigo || ''} 
                  size={200}
                  bgColor="#1A1A2E"
                  fgColor="#CCFF00"
                />
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-gym-gray-light">
                <Clock className="w-3 h-3" />
                <span className="font-mono text-gym-neon break-all">{qrData.qr || qrData.codigo}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => {
                    if (qrData.qr || qrData.codigo) {
                      handleValidateQR(qrData.qr || qrData.codigo);
                    }
                  }}
                  className="text-gym-neon hover:opacity-80 transition-colors text-sm flex items-center gap-1 border border-gym-neon/20 px-3 py-1.5 rounded-lg hover:bg-gym-neon/10"
                >
                  <Shield className="w-4 h-4" /> Validar este QR
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gym-dark rounded-lg p-8 text-center">
              <QrCode className="w-16 h-16 text-gym-gray/30 mx-auto mb-3" />
              <p className="text-gym-gray-light">No hay datos QR disponibles para este usuario</p>
            </div>
          )}
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-5 h-5 text-gym-neon" />
          <h3 className="text-lg font-semibold text-gym-white">Usuarios</h3>
          <span className="px-2 py-0.5 bg-gym-neon/10 text-gym-neon rounded-md text-xs font-bold">
            {usuarios.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gym-gray/10">
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Usuario</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden sm:table-cell">Nombre</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden md:table-cell">Cédula</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">QR</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((user) => (
                  <tr key={user.idusuario} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 px-3 text-gym-white font-medium">@{user.usuario}</td>
                    <td className="py-2.5 px-3 text-gym-white hidden sm:table-cell">{user.nombre} {user.apellido}</td>
                    <td className="py-2.5 px-3 text-gym-gray hidden md:table-cell">{user.cedula}</td>
                    <td className="py-2.5 px-3">
                      <span className={user.hasQR ? 'text-green-400' : 'text-yellow-400'}>
                        {user.hasQR ? 'Si' : 'No'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={user.activo ? 'text-green-400' : 'text-red-400'}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleGetQR(user.idusuario)}
                          className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-400/10"
                          title="Ver QR"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {currentUser?.idrol === 1 && (
                          <>
                            {user.hasQR ? (
                              <button
                                onClick={() => handleDeactivateQR(user.idusuario)}
                                className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-400/10"
                                title="Desactivar QR"
                              >
                                <Power className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateQR(user.idusuario)}
                                className="text-green-400 hover:text-green-300 transition-colors p-1 rounded hover:bg-green-400/10"
                                title="Activar QR"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gym-gray text-sm">
                    No hay usuarios que coincidan con la búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredUsuarios.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gym-gray/10">
            <span className="text-gym-gray-light text-xs">
              Mostrando {indexOfFirstItem + 1} al {Math.min(indexOfLastItem, filteredUsuarios.length)} de {filteredUsuarios.length} usuarios
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

      {/* Modal Validación QR */}
      {showValidateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gym-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gym-neon" />
                  Validar Código QR
                </h2>
                <button
                  onClick={() => {
                    setShowValidateModal(false);
                    setValidateCode('');
                    setValidationResult(null);
                    setError('');
                  }}
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

              <div className="mb-4">
                <label className="text-gym-gray-light text-sm block mb-1">Código QR</label>
                <input
                  type="text"
                  placeholder="Ingresa el código QR para validar..."
                  value={validateCode}
                  onChange={(e) => setValidateCode(e.target.value)}
                  className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors font-mono"
                />
              </div>

              {validationResult && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">QR Válido</span>
                  </div>
                  <p className="text-gym-white text-sm mt-1">
                    Usuario: {validationResult.usuario?.nombre || 'Usuario'}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={() => {
                    setShowValidateModal(false);
                    setValidateCode('');
                    setValidationResult(null);
                    setError('');
                  }}
                  className="px-4 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleValidateQR(validateCode)}
                  disabled={loading || !validateCode}
                  className="bg-gym-neon text-gym-dark px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-gym-dark border-t-transparent rounded-full animate-spin"></span>
                      Validando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" /> Validar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QR;