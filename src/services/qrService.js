// src/services/qrService.js
import api from './api';

const qrService = {
  // Obtener todos los QR (para administradores)
  getAll: async () => {
    const response = await api.get('/qr');
    return response.data;
  },

  // Obtener QR de un usuario específico
  getByUser: async (idUsuario) => {
    const response = await api.get(`/qr/usuario/${idUsuario}`);
    return response.data;
  },

  // ✅ NUEVO: Generar QR para un usuario (solo para regeneración)
  generate: async (idUsuario) => {
    const response = await api.post('/qr/generate', { idUsuario });
    return response.data;
  },

  // Validar un código QR
  validate: async (codigo) => {
    const response = await api.post('/qr/validate', { codigo });
    return response.data;
  },

  // Desactivar QR de un usuario
  deactivate: async (idUsuario) => {
    const response = await api.delete(`/qr/usuario/${idUsuario}`);
    return response.data;
  },

  // ✅ NUEVO: Regenerar QR (desactiva el anterior y crea uno nuevo)
  regenerate: async (idUsuario) => {
    const response = await api.post('/qr/regenerate', { idUsuario });
    return response.data;
  }
};

export default qrService;