// src/services/maquinaService.js
import api from './api';

const maquinaService = {
  // Obtener todas las máquinas
  getAll: async () => {
    const response = await api.get('/maquinas');
    return response.data;
  },

  // Obtener una máquina por ID
  getById: async (id) => {
    const response = await api.get(`/maquinas/${id}`);
    return response.data;
  },

  // Crear una nueva máquina
  create: async (data) => {
    const response = await api.post('/maquinas', data);
    return response.data;
  },

  // Actualizar una máquina
  update: async (id, data) => {
    const response = await api.put(`/maquinas/${id}`, data);
    return response.data;
  },

  // Eliminar una máquina
  delete: async (id) => {
    const response = await api.delete(`/maquinas/${id}`);
    return response.data;
  }
};

export default maquinaService;