// src/pages/admin/Configuracion.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Save,
  XCircle,
  CheckCircle,
  X,
  Mail,
  Phone,
  Hash,
  MessageCircle,
  Send,
  Video,
  DollarSign,
  User,
  MapPin,
  FileText,
  Building,
  Percent,
  Loader2
} from 'lucide-react';
import configuracionService from '../../services/configuracionService';
import authService from '../../services/authService';

const Configuracion = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    porcentajeIva: '',        // ✅ Cambiado
    porcentajeIgtf: '',       // ✅ Cambiado
    correo: '',
    telefono: '',
    telefono2: '',
    instagram: '',
    whatsapp: '',
    telegram: '',
    tiktok: '',
    bancoNombre: '',          // ✅ Cambiado
    bancoCedula: '',          // ✅ Cambiado
    bancoTelefono: '',        // ✅ Cambiado
    bancoCorreo: '',          // ✅ Cambiado
    noDocumento: '',          // ✅ Cambiado
    direccion: ''
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.idrol !== 1) {
      navigate('/dashboard');
      return;
    }
    loadConfig();
  }, [navigate]);

  const loadConfig = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await configuracionService.getAll();
      // El backend devuelve el objeto directamente, no un array
      if (data && data.idconfiguracion) {
        setConfig(data);
        setFormData({
          porcentajeIva: data.porcentajeiva ?? '',      // ✅ El backend devuelve en minúscula
          porcentajeIgtf: data.porcentajeigtf ?? '',     // ✅ El backend devuelve en minúscula
          correo: data.correo ?? '',
          telefono: data.telefono ?? '',
          telefono2: data.telefono2 ?? '',
          instagram: data.instagram ?? '',
          whatsapp: data.whatsapp ?? '',
          telegram: data.telegram ?? '',
          tiktok: data.tiktok ?? '',
          bancoNombre: data.banconombre ?? '',           // ✅ El backend devuelve en minúscula
          bancoCedula: data.bancocedula ?? '',           // ✅ El backend devuelve en minúscula
          bancoTelefono: data.bancotelefono ?? '',       // ✅ El backend devuelve en minúscula
          bancoCorreo: data.bancocorreo ?? '',           // ✅ El backend devuelve en minúscula
          noDocumento: data.nodocumento ?? '',           // ✅ El backend devuelve en minúscula
          direccion: data.direccion ?? ''
        });
      } else {
        setConfig(null);
      }
    } catch (err) {
      setError('Error al cargar la configuración');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const dataToSend = {
        porcentajeIva: formData.porcentajeIva ? parseFloat(formData.porcentajeIva) : null,
        porcentajeIgtf: formData.porcentajeIgtf ? parseFloat(formData.porcentajeIgtf) : null,
        correo: formData.correo || null,
        telefono: formData.telefono || null,
        telefono2: formData.telefono2 || null,
        instagram: formData.instagram || null,
        whatsapp: formData.whatsapp || null,
        telegram: formData.telegram || null,
        tiktok: formData.tiktok || null,
        bancoNombre: formData.bancoNombre || null,
        bancoCedula: formData.bancoCedula || null,
        bancoTelefono: formData.bancoTelefono || null,
        bancoCorreo: formData.bancoCorreo || null,
        noDocumento: formData.noDocumento || null,
        direccion: formData.direccion || null
      };

      await configuracionService.update(dataToSend);

      setSuccess('Configuración guardada correctamente');
      loadConfig();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <Settings className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-2xl font-bold text-gym-white tracking-tight">Configuración del Sistema</h1>
            <p className="text-gym-gray text-sm hidden sm:block">Gestiona los parámetros generales del gimnasio</p>
          </div>
        </div>
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

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sección: Datos Generales */}
          <div className="col-span-full">
            <h3 className="text-sm font-semibold text-gym-neon uppercase tracking-wider border-b border-gym-gray/10 pb-2 mb-4">
              Datos Generales
            </h3>
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <Mail className="w-4 h-4 inline mr-1" /> Correo
            </label>
            <input
              name="correo"
              type="email"
              placeholder="correo@gimnasio.com"
              value={formData.correo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <Phone className="w-4 h-4 inline mr-1" /> Teléfono
            </label>
            <input
              name="telefono"
              type="text"
              placeholder="+58 212-555-1212"
              value={formData.telefono}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <Phone className="w-4 h-4 inline mr-1" /> Teléfono 2
            </label>
            <input
              name="telefono2"
              type="text"
              placeholder="+58 212-555-1313"
              value={formData.telefono2}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          <div className="col-span-full">
            <label className="text-gym-gray-light text-sm block mb-1">
              <MapPin className="w-4 h-4 inline mr-1" /> Dirección
            </label>
            <textarea
              name="direccion"
              placeholder="Av. Principal, Local 2, Caracas"
              value={formData.direccion}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <FileText className="w-4 h-4 inline mr-1" /> RIF / Documento
            </label>
            <input
              name="noDocumento"
              type="text"
              placeholder="J-12345678-9"
              value={formData.noDocumento}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          {/* Sección: Redes Sociales */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-gym-neon uppercase tracking-wider border-b border-gym-gray/10 pb-2 mb-4">
              Redes Sociales
            </h3>
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">Instagram</label>
            <input
              name="instagram"
              type="text"
              placeholder="@gimnasio"
              value={formData.instagram}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <MessageCircle className="w-4 h-4 inline mr-1" /> WhatsApp
            </label>
            <input
              name="whatsapp"
              type="text"
              placeholder="+58 412-555-1212"
              value={formData.whatsapp}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <Send className="w-4 h-4 inline mr-1" /> Telegram
            </label>
            <input
              name="telegram"
              type="text"
              placeholder="@gimnasio"
              value={formData.telegram}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <Video className="w-4 h-4 inline mr-1" /> TikTok
            </label>
            <input
              name="tiktok"
              type="text"
              placeholder="@gimnasio"
              value={formData.tiktok}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          {/* Sección: Datos Bancarios */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-gym-neon uppercase tracking-wider border-b border-gym-gray/10 pb-2 mb-4">
              <Building className="w-4 h-4 inline mr-1" /> Datos Bancarios
            </h3>
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <User className="w-4 h-4 inline mr-1" /> Nombre del Banco
            </label>
            <input
              name="bancoNombre"
              type="text"
              placeholder="Banco Nacional"
              value={formData.bancoNombre}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <Hash className="w-4 h-4 inline mr-1" /> Cédula / RIF del Banco
            </label>
            <input
              name="bancoCedula"
              type="text"
              placeholder="V-12345678"
              value={formData.bancoCedula}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <Phone className="w-4 h-4 inline mr-1" /> Teléfono del Banco
            </label>
            <input
              name="bancoTelefono"
              type="text"
              placeholder="+58 212-555-1414"
              value={formData.bancoTelefono}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">
              <Mail className="w-4 h-4 inline mr-1" /> Correo del Banco
            </label>
            <input
              name="bancoCorreo"
              type="email"
              placeholder="banco@gimnasio.com"
              value={formData.bancoCorreo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          {/* Sección: Impuestos */}
          <div className="col-span-full mt-4">
            <h3 className="text-sm font-semibold text-gym-neon uppercase tracking-wider border-b border-gym-gray/10 pb-2 mb-4">
              <Percent className="w-4 h-4 inline mr-1" /> Impuestos
            </h3>
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">Porcentaje IVA</label>
            <input
              name="porcentajeIva"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="16"
              value={formData.porcentajeIva}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>

          <div>
            <label className="text-gym-gray-light text-sm block mb-1">Porcentaje IGTF</label>
            <input
              name="porcentajeIgtf"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="3"
              value={formData.porcentajeIgtf}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gym-gray/10">
          <button
            type="submit"
            disabled={saving}
            className="bg-gym-neon text-gym-dark px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Configuracion;