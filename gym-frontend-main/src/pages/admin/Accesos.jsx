// src/pages/admin/Accesos.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import accesoService from '../../services/accesoService';
import authService from '../../services/authService';
import userService from '../../services/userService';

const Accesos = () => {
  const [activos, setActivos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [showEntradaModal, setShowEntradaModal] = useState(false);
  const [showSalidaModal, setShowSalidaModal] = useState(false);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('activos');
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.idrol !== 1) {
      navigate('/dashboard');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [activosData, usuariosData] = await Promise.all([
        accesoService.getActivos(),
        userService.getAll()
      ]);
      setActivos(activosData.usuarios || []);
      setUsuarios(usuariosData || []);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEntrada = async () => {
    if (!selectedUserId) {
      setError('Selecciona un usuario');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await accesoService.registrarEntrada(parseInt(selectedUserId), currentUser.idusuario);
      setSuccess('Entrada registrada correctamente');
      setSelectedUserId('');
      setShowEntradaModal(false);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar entrada');
    } finally {
      setLoading(false);
    }
  };

  const handleSalida = async (idUsuario) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await accesoService.registrarSalida(idUsuario);
      setSuccess('Salida registrada correctamente');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar salida');
    } finally {
      setLoading(false);
    }
  };

  const handleVerHistorial = async (idUsuario) => {
    setLoading(true);
    setError('');
    try {
      const data = await accesoService.getHistorialByUsuario(idUsuario);
      setHistorial(data || []);
      setShowHistorialModal(true);
    } catch (err) {
      setError('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios para entrada
  const filteredUsuarios = usuarios.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.activo &&
      (user.nombre?.toLowerCase().includes(search) ||
       user.apellido?.toLowerCase().includes(search) ||
       user.usuario?.toLowerCase().includes(search) ||
       user.cedula?.includes(search))
    );
  });

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && activos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gym-neon">Cargando accesos...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gym-white tracking-tight">
            Accesos
          </h1>
          <p className="text-gym-gray text-sm mt-0.5">
            Control de entrada y salida del gimnasio
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowEntradaModal(true)}
            className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Entrada
          </button>
          <button
            onClick={() => setShowSalidaModal(true)}
            className="bg-gym-danger/10 text-gym-danger border border-gym-danger/30 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gym-danger/20 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Salida
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

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gym-dark-secondary rounded-lg p-1">
        <button
          onClick={() => setActiveTab('activos')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'activos'
              ? 'bg-gym-neon/20 text-gym-neon'
              : 'text-gym-gray hover:text-gym-white'
          }`}
        >
          Dentro del Gimnasio ({activos.length})
        </button>
        <button
          onClick={() => setActiveTab('historial')}
          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'historial'
              ? 'bg-gym-neon/20 text-gym-neon'
              : 'text-gym-gray hover:text-gym-white'
          }`}
        >
          Historial
        </button>
      </div>

      {/* Contenido según tab */}
      {activeTab === 'activos' ? (
        /* Usuarios activos (dentro) */
        <div className="card">
          {activos.length === 0 ? (
            <div className="text-center py-8 text-gym-gray">
              No hay usuarios dentro del gimnasio
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gym-gray/10">
                    <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider">Usuario</th>
                    <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider">Nombre</th>
                    <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Cédula</th>
                    <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider">Entrada</th>
                    <th className="text-left py-2.5 md:py-3 px-3 md:px-4 text-gym-gray font-medium text-xs uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {activos.map((acceso) => (
                    <tr key={acceso.idacceso} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                      <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-white text-sm font-medium">{acceso.usuario}</td>
                      <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-white text-sm">
                        {acceso.nombre} {acceso.apellido}
                      </td>
                      <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-gray text-sm hidden sm:table-cell">{acceso.cedula}</td>
                      <td className="py-2.5 md:py-3 px-3 md:px-4 text-gym-gray text-sm">
                        {formatDate(acceso.fechaentrada)}
                      </td>
                      <td className="py-2.5 md:py-3 px-3 md:px-4">
                        <button
                          onClick={() => handleSalida(acceso.idusuario)}
                          className="text-gym-danger hover:text-gym-danger/80 transition-colors text-sm font-medium"
                        >
                          Registrar Salida
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Historial - buscar por usuario */
        <div className="card">
          <div className="mb-4">
            <label className="text-gym-gray-light text-sm block mb-1">Buscar usuario por nombre o cédula</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Escribe el nombre o cédula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 input-gym"
              />
              <button
                onClick={() => {
                  const found = usuarios.find(u => 
                    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.cedula?.includes(searchTerm)
                  );
                  if (found) {
                    handleVerHistorial(found.idusuario);
                  } else {
                    setError('Usuario no encontrado');
                  }
                }}
                className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors"
              >
                Buscar
              </button>
            </div>
          </div>
          <div className="text-gym-gray text-sm">
            Ingresa el nombre o cédula de un usuario para ver su historial de accesos.
          </div>
        </div>
      )}

      {/* Modal Entrada */}
      {showEntradaModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gym-white">
                  Registrar Entrada
                </h2>
                <button
                  onClick={() => {
                    setShowEntradaModal(false);
                    setSelectedUserId('');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-gym-gray hover:text-gym-white transition-colors"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="bg-gym-danger/10 border border-gym-danger/30 text-gym-danger px-4 py-2.5 rounded-lg mb-3 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="text-gym-gray-light text-sm block mb-1">Buscar usuario</label>
                <input
                  type="text"
                  placeholder="Nombre, apellido, cédula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-gym"
                />
              </div>

              <div className="max-h-60 overflow-y-auto space-y-1 mb-4">
                {filteredUsuarios.length === 0 ? (
                  <div className="text-gym-gray text-sm text-center py-4">
                    No hay usuarios disponibles
                  </div>
                ) : (
                  filteredUsuarios.map((user) => (
                    <button
                      key={user.idusuario}
                      onClick={() => {
                        setSelectedUserId(user.idusuario.toString());
                        setSearchTerm(`${user.nombre} ${user.apellido}`);
                        setError('');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedUserId === user.idusuario.toString()
                          ? 'bg-gym-neon/10 text-gym-neon border border-gym-neon/20'
                          : 'text-gym-white hover:bg-gym-card'
                      }`}
                    >
                      {user.nombre} {user.apellido} - {user.cedula}
                    </button>
                  ))
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t border-gym-gray/10">
                <button
                  onClick={() => {
                    setShowEntradaModal(false);
                    setSelectedUserId('');
                    setError('');
                  }}
                  className="btn-secondary w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEntrada}
                  disabled={loading || !selectedUserId}
                  className="bg-gym-neon text-gym-dark px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto"
                >
                  {loading ? 'Registrando...' : 'Registrar Entrada'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Salida */}
      {showSalidaModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-lg w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gym-white mb-4">
                Registrar Salida
              </h2>
              <p className="text-gym-gray-light mb-4">
                Selecciona un usuario que esté dentro del gimnasio para registrar su salida.
              </p>

              {activos.length === 0 ? (
                <div className="text-gym-gray text-sm text-center py-4">
                  No hay usuarios dentro del gimnasio
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {activos.map((acceso) => (
                    <button
                      key={acceso.idacceso}
                      onClick={() => {
                        handleSalida(acceso.idusuario);
                        setShowSalidaModal(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gym-white hover:bg-gym-card transition-colors"
                    >
                      {acceso.nombre} {acceso.apellido} - Entró a las {formatDate(acceso.fechaentrada)}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-4 pt-3 border-t border-gym-gray/10">
                <button
                  onClick={() => setShowSalidaModal(false)}
                  className="btn-secondary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial */}
      {showHistorialModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-y-auto border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-bold text-gym-white">
                  Historial de Accesos
                </h2>
                <button
                  onClick={() => setShowHistorialModal(false)}
                  className="text-gym-gray hover:text-gym-white transition-colors"
                >
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {historial.length === 0 ? (
                <div className="text-center py-8 text-gym-gray">
                  No hay registros de accesos para este usuario
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gym-gray/10">
                        <th className="text-left py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Fecha Entrada</th>
                        <th className="text-left py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Fecha Salida</th>
                        <th className="text-left py-2 px-3 text-gym-gray text-xs uppercase tracking-wider">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((item) => (
                        <tr key={item.idacceso} className="border-b border-gym-gray/5">
                          <td className="py-2 px-3 text-gym-white text-sm">{formatDate(item.fechaentrada)}</td>
                          <td className="py-2 px-3 text-gym-gray text-sm">{formatDate(item.fechasalida)}</td>
                          <td className="py-2 px-3">
                            <span className={`text-sm font-medium ${item.fechasalida ? 'text-gym-gray' : 'text-gym-success'}`}>
                              {item.fechasalida ? 'Completado' : 'Dentro'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accesos;