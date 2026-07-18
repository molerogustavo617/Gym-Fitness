// src/pages/Perfil.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';

const Perfil = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    nuevaClave: '',
    confirmarClave: ''
  });
  const navigate = useNavigate();

  // Verificar si el usuario es administrador
  const isAdmin = user?.idrol === 1;

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setFormData({
      nombre: currentUser.nombre || '',
      apellido: currentUser.apellido || '',
      correo: currentUser.correo || '',
      telefono: currentUser.telefono || '',
      cedula: currentUser.cedula || '',
      usuario: currentUser.usuario || '',
    });
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const dataToSend = {
        usuario: formData.usuario,
        nombre: formData.nombre,
        apellido: formData.apellido,
        cedula: formData.cedula,
        telefono: formData.telefono,
        correo: formData.correo,
        idRol: user.idrol
      };

      const response = await userService.updateProfile(user.idusuario, dataToSend);
      
      const updatedUser = response.data;
      const currentUser = authService.getCurrentUser();
      const mergedUser = { ...currentUser, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setUser(mergedUser);
      setFormData({
        nombre: mergedUser.nombre || '',
        apellido: mergedUser.apellido || '',
        correo: mergedUser.correo || '',
        telefono: mergedUser.telefono || '',
        cedula: mergedUser.cedula || '',
        usuario: mergedUser.usuario || '',
      });

      setSuccess('Datos actualizados correctamente');
      setEditando(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar los datos');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.nuevaClave.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.nuevaClave !== passwordData.confirmarClave) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setSaving(true);

    try {
      await userService.changePassword(user.idusuario, passwordData.nuevaClave);
      setSuccess('Contraseña actualizada correctamente');
      setShowPasswordForm(false);
      setPasswordData({ nuevaClave: '', confirmarClave: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gym-dark flex items-center justify-center">
        <div className="text-gym-neon">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gym-dark flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToDashboard}
            className="text-gym-gray hover:text-gym-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Dashboard
          </button>
          <span className="text-gym-neon font-medium">Mi Perfil</span>
        </div>

        <div className="card border-gym-neon/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gym-neon/10 border-2 border-gym-neon/30 flex items-center justify-center text-3xl font-bold text-gym-neon">
              {user.nombre?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gym-white">
                {user.nombre} {user.apellido}
              </h1>
              <p className="text-gym-gray-light">
                {user.rol || 'Administrador'}
                {isAdmin && (
                  <span className="ml-2 badge-neon text-xs">Admin</span>
                )}
              </p>
            </div>
            <button
              onClick={() => {
                setEditando(!editando);
                setError('');
                setSuccess('');
              }}
              className="ml-auto btn-secondary text-sm"
            >
              {editando ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>

          <div className="divider"></div>

          {error && (
            <div className="bg-gym-danger/10 border border-gym-danger/30 text-gym-danger p-3 rounded-xl mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-gym-success/10 border border-gym-success/30 text-gym-success p-3 rounded-xl mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Nombre</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`input-gym ${!editando && 'opacity-70 cursor-not-allowed'}`}
                  required
                />
              </div>
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Apellido</label>
                <input
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`input-gym ${!editando && 'opacity-70 cursor-not-allowed'}`}
                  required
                />
              </div>
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Usuario</label>
                <input
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`input-gym ${!editando && 'opacity-70 cursor-not-allowed'}`}
                  required
                />
              </div>
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Correo</label>
                <input
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`input-gym ${!editando && 'opacity-70 cursor-not-allowed'}`}
                  required
                />
              </div>
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Telefono</label>
                <input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`input-gym ${!editando && 'opacity-70 cursor-not-allowed'}`}
                />
              </div>
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Cedula</label>
                <input
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  disabled={!editando || !isAdmin}
                  className={`input-gym ${
                    (!editando || !isAdmin) && 'opacity-50 cursor-not-allowed'
                  }`}
                />
                {!isAdmin && (
                  <p className="text-gym-gray text-xs mt-1">
                    Solo administradores pueden modificar la cedula
                  </p>
                )}
                {isAdmin && editando && (
                  <p className="text-gym-warning text-xs mt-1">
                    Advertencia: Cambiar la cedula puede afectar documentos legales
                  </p>
                )}
              </div>
            </div>

            {editando && (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            )}
          </form>

          <div className="divider"></div>

          <div className="mt-4">
            <h3 className="text-gym-white font-medium mb-3">Seguridad</h3>
            
            {!showPasswordForm ? (
              <button
                className="btn-secondary text-sm"
                onClick={() => setShowPasswordForm(true)}
              >
                Cambiar Contraseña
              </button>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Nueva Contraseña</label>
                    <input
                      name="nuevaClave"
                      type="password"
                      value={passwordData.nuevaClave}
                      onChange={handlePasswordChange}
                      className="input-gym"
                      placeholder="********"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Confirmar Contraseña</label>
                    <input
                      name="confirmarClave"
                      type="password"
                      value={passwordData.confirmarClave}
                      onChange={handlePasswordChange}
                      className="input-gym"
                      placeholder="********"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({ nuevaClave: '', confirmarClave: '' });
                    }}
                    className="btn-secondary text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-gym-gray/10">
              <button
                onClick={handleLogout}
                className="w-full bg-gym-danger/10 text-gym-danger border border-gym-danger/30 px-4 py-3 rounded-lg text-sm font-medium hover:bg-gym-danger/20 transition-colors"
              >
                Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;