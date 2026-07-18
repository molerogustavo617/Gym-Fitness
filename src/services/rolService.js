// src/services/rolService.js
import api from './api';

const rolService = {
  // Obtener todos los roles
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Obtener un rol por ID
  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Crear un nuevo rol
  create: async (descripcion) => {
    const response = await api.post('/roles', { descripcion });
    return response.data;
  },

  // Actualizar un rol
  update: async (id, descripcion) => {
    const response = await api.put(`/roles/${id}`, { descripcion });
    return response.data;
  },

  // Eliminar un rol
  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  }
};

export default rolService;