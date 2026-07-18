// src/pages/admin/QR.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';  // ← Cambio aquí
import qrService from '../../services/qrService';
import userService from '../../services/userService';
import authService from '../../services/authService';

const QR = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [qrData, setQrData] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.idrol !== 1) {
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
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedUser) {
      setError('Selecciona un usuario');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setQrData(null);

    try {
      const response = await qrService.generate(parseInt(selectedUser));
      setQrData(response.data);
      setSuccess('QR generado exitosamente');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al generar QR');
    } finally {
      setLoading(false);
    }
  };

  const handleGetQR = async () => {
    if (!selectedUser) {
      setError('Selecciona un usuario');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setQrData(null);

    try {
      const response = await qrService.getByUser(parseInt(selectedUser));
      setQrData(response);
      setSuccess('QR encontrado');
    } catch (err) {
      setError(err.response?.data?.error || 'El usuario no tiene QR');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateQR = async () => {
    if (!selectedUser) {
      setError('Selecciona un usuario');
      return;
    }

    if (!window.confirm('¿Estas seguro de que deseas desactivar el QR de este usuario?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setQrData(null);

    try {
      await qrService.deactivate(parseInt(selectedUser));
      setSuccess('QR desactivado exitosamente');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al desactivar QR');
    } finally {
      setLoading(false);
    }
  };

  const handleValidateQR = async (codigo) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await qrService.validate(codigo);
      setSuccess(`QR válido - Usuario: ${response.usuario.nombre}`);
    } catch (err) {
      setError(err.response?.data?.error || 'QR inválido');
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

  const getUserName = (id) => {
    const user = usuarios.find(u => u.idusuario === parseInt(id));
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario no encontrado';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gym-white tracking-tight">
            Códigos QR
          </h1>
          <p className="text-gym-gray text-sm mt-0.5">
            Genera y gestiona códigos QR para los usuarios
          </p>
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

      {/* Selección de usuario */}
      <div className="card mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gym-gray-light text-sm block mb-1">Buscar usuario</label>
            <input
              type="text"
              placeholder="Nombre, apellido, cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-gym"
            />
          </div>
          <div>
            <label className="text-gym-gray-light text-sm block mb-1">Seleccionar usuario</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="input-gym"
            >
              <option value="">Seleccionar usuario</option>
              {filteredUsuarios.map((user) => (
                <option key={user.idusuario} value={user.idusuario}>
                  {user.nombre} {user.apellido} - {user.usuario}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleGenerateQR}
            disabled={loading || !selectedUser}
            className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Generar QR'}
          </button>
          <button
            onClick={handleGetQR}
            disabled={loading || !selectedUser}
            className="btn-secondary text-sm disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Ver QR'}
          </button>
          <button
            onClick={handleDeactivateQR}
            disabled={loading || !selectedUser}
            className="bg-gym-danger/10 text-gym-danger border border-gym-danger/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gym-danger/20 transition-colors disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Desactivar QR'}
          </button>
        </div>
      </div>

      {/* Mostrar QR */}
      {qrData && (
        <div className="card border-gym-neon/20">
          <h3 className="text-gym-white font-medium mb-2">
            QR de {getUserName(selectedUser)}
          </h3>
          <p className="text-gym-gray text-sm mb-4">
            Código: <span className="text-gym-neon font-mono text-xs break-all">{qrData.qr || qrData.codigo}</span>
          </p>
          <div className="bg-gym-dark p-6 rounded-lg flex flex-col items-center">
            {/* QR Code con react-qr-code */}
            <QRCode 
              value={qrData.qr || qrData.codigo || ''} 
              size={200}
              bgColor="#121212"
              fgColor="#CCFF00"
            />
            <p className="text-gym-gray text-sm mt-4">
              Escanea este código QR para identificar al usuario
            </p>
            <p className="text-gym-gray text-xs mt-2">
              Estado: <span className={qrData.activo !== false ? 'text-gym-success' : 'text-gym-danger'}>
                {qrData.activo !== undefined ? (qrData.activo ? 'Activo' : 'Inactivo') : 'Activo'}
              </span>
            </p>
            <button
              onClick={() => {
                if (qrData.qr || qrData.codigo) {
                  handleValidateQR(qrData.qr || qrData.codigo);
                }
              }}
              className="mt-3 text-gym-neon hover:opacity-80 transition-colors text-sm"
            >
              Validar este QR
            </button>
          </div>
        </div>
      )}

      {/* Lista de usuarios */}
      <div className="card mt-4">
        <h3 className="text-gym-white font-medium mb-3">Usuarios con QR activos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gym-gray/10">
                <th className="text-left py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Usuario</th>
                <th className="text-left py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Nombre</th>
                <th className="text-left py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.filter(u => u.idusuario === parseInt(selectedUser) && selectedUser).length > 0 ? (
                <tr>
                  <td className="py-2 px-3 text-gym-white">
                    {usuarios.find(u => u.idusuario === parseInt(selectedUser))?.usuario}
                  </td>
                  <td className="py-2 px-3 text-gym-white">
                    {usuarios.find(u => u.idusuario === parseInt(selectedUser))?.nombre}
                  </td>
                  <td className="py-2 px-3">
                    <span className={qrData?.activo !== false ? 'text-gym-success' : 'text-gym-danger'}>
                      {qrData?.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gym-gray text-sm">
                    Selecciona un usuario para ver su información QR
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QR;