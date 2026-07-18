// src/services/qrService.js
import api from './api';

const qrService = {
  // Generar QR para un usuario
  generate: async (idUsuario) => {
    const response = await api.post(`/qr/usuario/${idUsuario}`);
    return response.data;
  },

  // Obtener QR de un usuario
  getByUser: async (idUsuario) => {
    const response = await api.get(`/qr/usuario/${idUsuario}`);
    return response.data;
  },

  // Validar código QR
  validate: async (codigo) => {
    const response = await api.get(`/qr/validar/${codigo}`);
    return response.data;
  },

  // Desactivar QR de un usuario
  deactivate: async (idUsuario) => {
    const response = await api.delete(`/qr/usuario/${idUsuario}`);
    return response.data;
  }
};

export default qrService;