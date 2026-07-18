// src/services/configService.js
import api from './api';

const configService = {
  // Obtener configuración
  getConfig: async () => {
    const response = await api.get('/configuracion');
    return response.data;
  },

  // Actualizar configuración
  updateConfig: async (data) => {
    const response = await api.put('/configuracion', data);
    return response.data;
  }
};

export default configService;