// src/services/pagoService.js
import api from './api';

const pagoService = {
  // Obtener todos los pagos
  getAll: async () => {
    const response = await api.get('/pagos');
    return response.data;
  },

  // Obtener pagos por estado
  getByEstado: async (estado) => {
    const response = await api.get(`/pagos/estado/${estado}`);
    return response.data;
  },

  // Obtener pagos por usuario
  getByUsuario: async (idUsuario) => {
    const response = await api.get(`/pagos/usuario/${idUsuario}`);
    return response.data;
  },

  // Obtener pagos pendientes
  getPendientes: async () => {
    const response = await api.get('/pagos/pendientes');
    return response.data;
  },

  // Obtener pago por ID
  getById: async (id) => {
    const response = await api.get(`/pagos/${id}`);
    return response.data;
  },

  // Crear pago
  create: async (data) => {
    const response = await api.post('/pagos', data);
    return response.data;
  },

  // Aprobar pago
  aprobar: async (id, comentario = null) => {
    const response = await api.patch(`/pagos/${id}/aprobar`, { comentario });
    return response.data;
  },

  // Rechazar pago
  rechazar: async (id, comentario = null) => {
    const response = await api.patch(`/pagos/${id}/rechazar`, { comentario });
    return response.data;
  },

  // Actualizar pago
  update: async (id, data) => {
    const response = await api.put(`/pagos/${id}`, data);
    return response.data;
  },

  // Eliminar pago
  delete: async (id) => {
    const response = await api.delete(`/pagos/${id}`);
    return response.data;
  }
};

export default pagoService;