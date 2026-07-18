// src/services/configuracionService.js
import api from './api';

const configuracionService = {
  // Obtener configuración (único registro)
  getAll: async () => {
    const response = await api.get('/configuracion');
    return response.data;
  },

  // Actualizar configuración (PUT sin ID porque es único)
  update: async (data) => {
    const response = await api.put('/configuracion', data);
    return response.data;
  },

  // Obtener configuración pública (sin auth)
  getPublic: async () => {
    const response = await api.get('/configuracion/public');
    return response.data;
  },

  // ✅ NUEVO: Obtener solo la tasa de cambio
  getExchangeRate: async () => {
    try {
      const response = await api.get('/configuracion/public');
      // El backend puede tener el campo 'tasaCambio' o 'tasa_cambio'
      return response.data?.tasaCambio || response.data?.tasa_cambio || 0;
    } catch (error) {
      console.error('Error al obtener tasa de cambio:', error);
      return 0;
    }
  },

  // ✅ NUEVO: Actualizar solo la tasa de cambio
  updateExchangeRate: async (tasaCambio) => {
    try {
      const response = await api.put('/configuracion', { tasaCambio });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar tasa de cambio:', error);
      throw error;
    }
  }
};

export default configuracionService;