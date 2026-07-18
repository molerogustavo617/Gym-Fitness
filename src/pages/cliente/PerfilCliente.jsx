// src/pages/cliente/PerfilCliente.jsx
import React, { useState, useEffect } from 'react';
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
  BadgeCheck,
  Zap,
  Crown,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';
import authService from '../../services/authService';
import userService from '../../services/userService';
import CarnetModal from '../../components/CarnetModal';

// Imágenes motivacionales para el header
const IMAGENES_PERFIL = [
  'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=400&q=80',
];

const PerfilCliente = () => {
  const navigate = useNavigate();
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
  const [showPassword, setShowPassword] = useState(false);
  const [showCarnet, setShowCarnet] = useState(false);

  const imagenHeader = IMAGENES_PERFIL[Math.floor(Math.random() * IMAGENES_PERFIL.length)];

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
    navigate('/cliente/dashboard');
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

      setSuccess('¡Datos actualizados correctamente! 💪');
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
      setSuccess('¡Contraseña actualizada! 🔒');
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
      case 'Administrador': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Recepcionista': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Entrenador': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Cliente': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const nombreCompleto = `${user?.nombre || ''} ${user?.apellido || ''}`;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 space-y-4 pb-4">
      
      {/* Header con imagen motivacional */}
      <div className="relative overflow-hidden rounded-2xl p-5 min-h-[120px] flex items-end">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${imagenHeader})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent" />
        
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {/* Foto de perfil con hover para cambiar */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center text-2xl font-black text-orange-400 overflow-hidden">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  nombreCompleto.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              {editando && (
                <label className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-white text-[8px] font-mono mt-0.5">Cambiar</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">
                {nombreCompleto || 'Usuario'}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-orange-400 text-xs font-mono">@{user?.usuario}</span>
                <span className="flex items-center gap-1 text-[10px] text-green-400 font-mono">
                  <BadgeCheck className="w-3 h-3" /> Activo
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={goToDashboard}
            className="p-2 rounded-xl border border-orange-500/20 hover:border-orange-500/40 text-[#9A9AA0] hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {(error || success) && (
        <div>
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
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
      <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-sm font-bold flex items-center gap-2">
            <User className="w-4 h-4 text-orange-400" />
            Información Personal
          </h2>
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
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              editando 
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20'
            }`}
          >
            {editando ? <X className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5" />}
            {editando ? 'Cancelar' : 'Editar'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9A9AA0] text-[10px] font-mono block mb-0.5">Nombre *</label>
              <input
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                disabled={!editando}
                className={`w-full px-3 py-1.5 bg-[#0A0A0B] rounded-lg border text-sm text-white focus:outline-none transition-all ${
                  editando 
                    ? 'border-orange-500/30 focus:border-orange-400' 
                    : 'border-[#232326] opacity-70 cursor-not-allowed'
                }`}
                required
              />
            </div>
            <div>
              <label className="text-[#9A9AA0] text-[10px] font-mono block mb-0.5">Apellido *</label>
              <input
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                disabled={!editando}
                className={`w-full px-3 py-1.5 bg-[#0A0A0B] rounded-lg border text-sm text-white focus:outline-none transition-all ${
                  editando 
                    ? 'border-orange-500/30 focus:border-orange-400' 
                    : 'border-[#232326] opacity-70 cursor-not-allowed'
                }`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9A9AA0] text-[10px] font-mono block mb-0.5">Usuario *</label>
              <input
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                disabled={!editando}
                className={`w-full px-3 py-1.5 bg-[#0A0A0B] rounded-lg border text-sm text-white focus:outline-none transition-all ${
                  editando 
                    ? 'border-orange-500/30 focus:border-orange-400' 
                    : 'border-[#232326] opacity-70 cursor-not-allowed'
                }`}
                required
              />
            </div>
            <div>
              <label className="text-[#9A9AA0] text-[10px] font-mono block mb-0.5">Correo *</label>
              <input
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleChange}
                disabled={!editando}
                className={`w-full px-3 py-1.5 bg-[#0A0A0B] rounded-lg border text-sm text-white focus:outline-none transition-all ${
                  editando 
                    ? 'border-orange-500/30 focus:border-orange-400' 
                    : 'border-[#232326] opacity-70 cursor-not-allowed'
                }`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9A9AA0] text-[10px] font-mono block mb-0.5">Teléfono</label>
              <input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                disabled={!editando}
                className={`w-full px-3 py-1.5 bg-[#0A0A0B] rounded-lg border text-sm text-white focus:outline-none transition-all ${
                  editando 
                    ? 'border-orange-500/30 focus:border-orange-400' 
                    : 'border-[#232326] opacity-70 cursor-not-allowed'
                }`}
              />
            </div>
            <div>
              <label className="text-[#9A9AA0] text-[10px] font-mono block mb-0.5">Cédula</label>
              <input
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                disabled={!editando}
                className={`w-full px-3 py-1.5 bg-[#0A0A0B] rounded-lg border text-sm text-white focus:outline-none transition-all ${
                  editando 
                    ? 'border-orange-500/30 focus:border-orange-400' 
                    : 'border-[#232326] opacity-70 cursor-not-allowed'
                }`}
              />
            </div>
          </div>

          {editando && (
            <div className="flex justify-end gap-2 pt-2 border-t border-orange-500/10">
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
                className="px-4 py-1.5 bg-[#0A0A0B] border border-[#232326] text-[#9A9AA0] rounded-lg hover:bg-[#1A1A2E] transition-colors text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-1.5 bg-orange-500 text-[#0A0A0B] rounded-lg font-medium hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Guardar
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Seguridad - Cambiar contraseña */}
      <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-orange-400" />
            <h3 className="text-white text-sm font-bold">Seguridad</h3>
          </div>
          {!showPasswordForm && (
            <button
              className="px-3 py-1.5 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl text-xs font-medium hover:bg-orange-500/20 transition-all flex items-center gap-1.5"
              onClick={() => {
                setShowPasswordForm(true);
                setError('');
                setSuccess('');
              }}
            >
              <Key className="w-3.5 h-3.5" /> Cambiar
            </button>
          )}
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordSubmit} className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#9A9AA0] text-[10px] font-mono block mb-0.5">
                  <Lock className="w-3 h-3 inline mr-1" />
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    name="nuevaClave"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.nuevaClave}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3 py-1.5 bg-[#0A0A0B] rounded-lg border border-orange-500/30 text-sm text-white focus:outline-none focus:border-orange-400 transition-all pr-8"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9A9AA0] hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[#9A9AA0] text-[10px] font-mono block mb-0.5">
                  <CheckCircle className="w-3 h-3 inline mr-1" />
                  Confirmar
                </label>
                <input
                  name="confirmarClave"
                  type="password"
                  value={passwordData.confirmarClave}
                  onChange={handlePasswordChange}
                  placeholder="Repite la contraseña"
                  className="w-full px-3 py-1.5 bg-[#0A0A0B] rounded-lg border border-orange-500/30 text-sm text-white focus:outline-none focus:border-orange-400 transition-all"
                  required
                />
              </div>
            </div>
            {passwordData.nuevaClave && passwordData.nuevaClave.length < 6 && (
              <p className="text-red-400 text-[10px] font-mono">Mínimo 6 caracteres</p>
            )}
            {passwordData.nuevaClave && passwordData.confirmarClave && passwordData.nuevaClave !== passwordData.confirmarClave && (
              <p className="text-red-400 text-[10px] font-mono">Las contraseñas no coinciden</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ nuevaClave: '', confirmarClave: '' });
                  setError('');
                  setSuccess('');
                }}
                className="px-3 py-1.5 bg-[#0A0A0B] border border-[#232326] text-[#9A9AA0] rounded-lg hover:bg-[#1A1A2E] transition-colors text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-orange-500 text-[#0A0A0B] rounded-lg font-medium hover:bg-orange-400 transition-colors disabled:opacity-50 flex items-center gap-1.5 text-xs"
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin"></span>
                    Actualizando...
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Actualizar
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Información adicional + Botón Carnet */}
      <div className="bg-[#111625]/30 border border-orange-500/10 rounded-xl p-3">
        {/* Botón Carnet */}
        <button
          onClick={() => setShowCarnet(true)}
          className="w-full mt-3 px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
        >
          <BadgeCheck className="w-4 h-4" />
          Ver mi Carnet
        </button>
      </div>

      {/* Cerrar Sesión */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 group"
      >
        <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        Cerrar Sesión
      </button>

      {/* ============================================================ */}
      {/* MODAL CARNET */}
      {/* ============================================================ */}
      <CarnetModal
        isOpen={showCarnet}
        onClose={() => setShowCarnet(false)}
        user={user}
        gymName="GYM FITNESS"
      />
    </div>
  );
};

export default PerfilCliente;