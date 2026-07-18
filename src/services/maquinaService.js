// src/services/maquinaService.js
import api from './api';

const maquinaService = {
  getAll: async () => {
    const response = await api.get('/maquinas');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/maquinas/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/maquinas', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/maquinas/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/maquinas/${id}`);
    return response.data;
  },

  getEstadisticas: async () => {
    const response = await api.get('/maquinas/estadisticas');
    return response.data;
  }
};

export default maquinaService;