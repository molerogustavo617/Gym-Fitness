// src/pages/admin/Configuracion.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import configService from '../../services/configService';
import authService from '../../services/authService';

const Configuracion = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    noDocumento: '',
    direccion: '',
    correo: '',
    telefono: '',
    telefono2: '',
    instagram: '',
    whatsapp: '',
    telegram: '',
    tiktok: '',
    porcentajeIva: 16.00,
    porcentajeIgtf: 3.00
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
      const data = await configService.getConfig();
      setConfig(data);
      setFormData({
        noDocumento: data.nodocumento || '',
        direccion: data.direccion || '',
        correo: data.correo || '',
        telefono: data.telefono || '',
        telefono2: data.telefono2 || '',
        instagram: data.instagram || '',
        whatsapp: data.whatsapp || '',
        telegram: data.telegram || '',
        tiktok: data.tiktok || '',
        porcentajeIva: parseFloat(data.porcentajeiva) || 16.00,
        porcentajeIgtf: parseFloat(data.porcentajeigtf) || 3.00
      });
    } catch (err) {
      setError('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'porcentajeIva' || name === 'porcentajeIgtf' ? parseFloat(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const dataToSend = {
        noDocumento: formData.noDocumento || null,
        direccion: formData.direccion || null,
        correo: formData.correo || null,
        telefono: formData.telefono || null,
        telefono2: formData.telefono2 || null,
        instagram: formData.instagram || null,
        whatsapp: formData.whatsapp || null,
        telegram: formData.telegram || null,
        tiktok: formData.tiktok || null,
        porcentajeIva: formData.porcentajeIva || 16.00,
        porcentajeIgtf: formData.porcentajeIgtf || 3.00
      };

      await configService.updateConfig(dataToSend);
      setSuccess('Configuración actualizada correctamente');
      setIsEditing(false);
      loadConfig();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gym-neon">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 md:mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gym-white tracking-tight">
            Configuración
          </h1>
          <p className="text-gym-gray text-sm mt-0.5">
            Datos de la empresa y configuración del sistema
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
        )}
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

      {/* Formulario */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Datos de la empresa */}
            <div className="md:col-span-2">
              <h3 className="text-gym-white font-medium text-sm uppercase tracking-wider text-gym-gray mb-3">
                Datos de la Empresa
              </h3>
            </div>

            <div>
              <label className="text-gym-gray-light text-sm block mb-1">RIF</label>
              <input
                name="noDocumento"
                value={formData.noDocumento}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                placeholder="J-12345678-9"
              />
            </div>

            <div>
              <label className="text-gym-gray-light text-sm block mb-1">Correo</label>
              <input
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                placeholder="info@gimnasio.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-gym-gray-light text-sm block mb-1">Dirección</label>
              <input
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                placeholder="Calle Principal, Local 1"
              />
            </div>

            <div>
              <label className="text-gym-gray-light text-sm block mb-1">Teléfono</label>
              <input
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                placeholder="0412-1234567"
              />
            </div>

            <div>
              <label className="text-gym-gray-light text-sm block mb-1">Teléfono 2</label>
              <input
                name="telefono2"
                value={formData.telefono2}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                placeholder="0412-7654321"
              />
            </div>

            {/* Redes sociales */}
            <div className="md:col-span-2 mt-2">
              <h3 className="text-gym-white font-medium text-sm uppercase tracking-wider text-gym-gray mb-3">
                Redes Sociales
              </h3>
            </div>

            <div>
              <label className="text-gym-gray-light text-sm block mb-1">Instagram</label>
              <input
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                placeholder="@gimnasio"
              />
            </div>

            <div>
              <label className="text-gym-gray-light text-sm block mb-1">WhatsApp</label>
              <input
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                placeholder="0412-1234567"
              />
            </div>

            <div>
              <label className="text-gym-gray-light text-sm block mb-1">Telegram</label>
              <input
                name="telegram"
                value={formData.telegram}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                placeholder="@gimnasio"
              />
            </div>

            <div>
              <label className="text-gym-gray-light text-sm block mb-1">TikTok</label>
              <input
                name="tiktok"
                value={formData.tiktok}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
                placeholder="@gimnasio"
              />
            </div>

            {/* Impuestos */}
            <div className="md:col-span-2 mt-2">
              <h3 className="text-gym-white font-medium text-sm uppercase tracking-wider text-gym-gray mb-3">
                Impuestos
              </h3>
            </div>

            <div>
              <label className="text-gym-gray-light text-sm block mb-1">IVA (%)</label>
              <input
                name="porcentajeIva"
                type="number"
                step="0.01"
                value={formData.porcentajeIva}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
              />
            </div>

            <div>
              <label className="text-gym-gray-light text-sm block mb-1">IGTF (%)</label>
              <input
                name="porcentajeIgtf"
                type="number"
                step="0.01"
                value={formData.porcentajeIgtf}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`input-gym ${!isEditing && 'opacity-70 cursor-not-allowed'}`}
              />
            </div>
          </div>

          {isEditing && (
            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 mt-4 border-t border-gym-gray/10">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  loadConfig();
                  setError('');
                  setSuccess('');
                }}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary w-full sm:w-auto disabled:opacity-50"
              >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </form>

        {/* Resumen de configuración actual */}
        {!isEditing && config && (
          <div className="mt-4 pt-4 border-t border-gym-gray/10">
            <h3 className="text-gym-gray text-sm font-medium mb-2">Resumen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div>
                <p className="text-gym-gray">RIF</p>
                <p className="text-gym-white">{config.nodocumento || 'No definido'}</p>
              </div>
              <div>
                <p className="text-gym-gray">IVA</p>
                <p className="text-gym-white">{config.porcentajeiva || '16'}%</p>
              </div>
              <div>
                <p className="text-gym-gray">IGTF</p>
                <p className="text-gym-white">{config.porcentajeigtf || '3'}%</p>
              </div>
              <div>
                <p className="text-gym-gray">Correo</p>
                <p className="text-gym-white truncate">{config.correo || 'No definido'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Configuracion;