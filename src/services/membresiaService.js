// src/services/membresiaService.js
import api from './api';

const membresiaService = {
  // Obtener todas las membresías
  getAll: async () => {
    const response = await api.get('/membresias');
    return response.data;
  },

  // Obtener membresía por ID
  getById: async (id) => {
    const response = await api.get(`/membresias/${id}`);
    return response.data;
  },

  // Obtener membresías activas
  getActivas: async () => {
    const response = await api.get('/membresias/activas');
    return response.data;
  },

  // Crear membresía
  create: async (data) => {
    const response = await api.post('/membresias', data);
    return response.data;
  },

  // Actualizar membresía
  update: async (id, data) => {
    const response = await api.put(`/membresias/${id}`, data);
    return response.data;
  },

  // Cambiar estado activo/inactivo
  toggleStatus: async (id, activo) => {
    const response = await api.patch(`/membresias/${id}/status`, { activo });
    return response.data;
  },

  // Eliminar membresía
  delete: async (id) => {
    const response = await api.delete(`/membresias/${id}`);
    return response.data;
  }
};

export default membresiaService;