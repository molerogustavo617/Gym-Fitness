// src/pages/Perfil.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  Save,
  X,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Lock,
  Key,
  Edit,
  Camera,
  UserCog
} from 'lucide-react';
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
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const navigate = useNavigate();

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
    if (currentUser.fotoperfil) {
      setFotoPreview(currentUser.fotoperfil);
    }
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

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoPreview(reader.result);
      setFotoPerfil(reader.result);
    };
    reader.readAsDataURL(file);
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

      if (fotoPerfil) {
        dataToSend.fotoPerfil = fotoPerfil;
      }

      // ✅ Usar el método update que ya existe en userService
      const response = await userService.update(user.idusuario, dataToSend);
      
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
      if (mergedUser.fotoperfil) {
        setFotoPreview(mergedUser.fotoperfil);
      }

      setSuccess('Datos actualizados correctamente');
      setEditando(false);
      setFotoPerfil(null);
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

  const getRolColor = (rol) => {
    switch (rol) {
      case 'Administrador': return 'bg-gym-neon/20 text-gym-neon border-gym-neon/30';
      case 'Recepcionista': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Entrenador': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Cliente': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gym-gray/20 text-gym-gray-light border-gym-gray/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto pt-8">
      {/* Header con navegación visible - BAJADO */}
      <div className="flex items-center justify-between mb-6 bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 px-5 py-3">
        <button
          onClick={goToDashboard}
          className="text-gym-gray-light hover:text-gym-white transition-colors flex items-center gap-2 text-sm group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Volver</span>
        </button>
        <span className="text-gym-neon font-semibold text-sm tracking-wide">MI PERFIL</span>
        <div className="w-24"></div>
      </div>

      {/* Card Principal */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 overflow-hidden">
        {/* Cabecera con foto y datos */}
        <div className="p-6 border-b border-gym-gray/10">
          <div className="flex items-center gap-6">
            {/* Foto de perfil con opción de cambio */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gym-neon/10 border-2 border-gym-neon/30 flex items-center justify-center text-4xl font-bold text-gym-neon overflow-hidden shrink-0">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  user.nombre?.charAt(0) || 'U'
                )}
              </div>
              {editando && (
                <label className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-6 h-6 text-white" />
                  <span className="text-white text-[10px] font-medium mt-1">Cambiar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Información del usuario */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gym-white truncate">
                  {user.nombre} {user.apellido}
                </h1>
                <span className={`px-3 py-0.5 rounded-full text-xs font-medium border ${getRolColor(user.rol)}`}>
                  {user.rol || 'Usuario'}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-gym-gray-light flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {user.correo || 'Sin correo'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {user.telefono || 'Sin teléfono'}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> @{user.usuario}
                </span>
              </div>
            </div>

            {/* Botón Editar */}
            <button
              onClick={() => {
                setEditando(!editando);
                setError('');
                setSuccess('');
                setShowPasswordForm(false);
                if (!editando) {
                  setFotoPerfil(null);
                }
              }}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 shrink-0 ${
                editando 
                  ? 'bg-gym-gray/20 text-gym-white hover:bg-gym-gray/30' 
                  : 'bg-gym-neon/10 text-gym-neon hover:bg-gym-neon/20 border border-gym-neon/20'
              }`}
            >
              {editando ? <X className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {editando ? 'Cancelar' : 'Editar Perfil'}
            </button>
          </div>
        </div>

        {/* Mensajes */}
        {(error || success) && (
          <div className="px-6 pt-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1">{error}</span>
                <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="flex-1">{success}</span>
                <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-300">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Formulario */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Nombre *</label>
                <input
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors ${
                    !editando && 'opacity-70 cursor-not-allowed'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Apellido *</label>
                <input
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors ${
                    !editando && 'opacity-70 cursor-not-allowed'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Usuario *</label>
                <input
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors ${
                    !editando && 'opacity-70 cursor-not-allowed'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Correo *</label>
                <input
                  name="correo"
                  type="email"
                  value={formData.correo}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors ${
                    !editando && 'opacity-70 cursor-not-allowed'
                  }`}
                  required
                />
              </div>
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Teléfono</label>
                <input
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors ${
                    !editando && 'opacity-70 cursor-not-allowed'
                  }`}
                />
              </div>
              <div>
                <label className="text-gym-gray-light text-sm block mb-1">Cédula</label>
                <input
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleChange}
                  disabled={!editando}
                  className={`w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors ${
                    !editando && 'opacity-70 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {editando && (
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gym-gray/10">
                <button
                  type="button"
                  onClick={() => {
                    setEditando(false);
                    setFotoPerfil(null);
                    setFormData({
                      nombre: user.nombre || '',
                      apellido: user.apellido || '',
                      correo: user.correo || '',
                      telefono: user.telefono || '',
                      cedula: user.cedula || '',
                      usuario: user.usuario || '',
                    });
                    if (user.fotoperfil) {
                      setFotoPreview(user.fotoperfil);
                    }
                  }}
                  className="px-5 py-2.5 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gym-neon text-gym-dark px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-gym-dark border-t-transparent rounded-full animate-spin"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* Seguridad - Cambiar contraseña */}
          <div className="mt-6 pt-6 border-t border-gym-gray/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gym-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gym-neon" /> Seguridad
                </h3>
                <p className="text-gym-gray-light text-xs mt-0.5">Cambia tu contraseña cuando lo necesites</p>
              </div>
              {!showPasswordForm && (
                <button
                  className="px-4 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors text-sm flex items-center gap-2"
                  onClick={() => setShowPasswordForm(true)}
                >
                  <Key className="w-4 h-4" /> Cambiar Contraseña
                </button>
              )}
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gym-gray-light text-sm block mb-1">Nueva Contraseña</label>
                    <input
                      name="nuevaClave"
                      type="password"
                      value={passwordData.nuevaClave}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                      placeholder="Mínimo 6 caracteres"
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
                      className="w-full px-4 py-2.5 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                      placeholder="Repite la contraseña"
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
                    className="px-4 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-gym-neon text-gym-dark px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-gym-dark border-t-transparent rounded-full animate-spin"></span>
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" /> Actualizar Contraseña
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Cerrar Sesión - Botón más estilizado */}
          <div className="mt-6 pt-4 border-t border-gym-gray/10">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 group"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;