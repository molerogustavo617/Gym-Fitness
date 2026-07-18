// src/services/entrenamientoService.js
import api from './api';

const entrenamientoService = {
  // Registrar un entrenamiento
  create: async (data) => {
    const response = await api.post('/entrenamientos', data);
    return response.data;
  },

  // Obtener todos los entrenamientos
  getAll: async () => {
    const response = await api.get('/entrenamientos');
    return response.data;
  },

  // Obtener entrenamientos por usuario
  getByUsuario: async (idUsuario, limit = 50) => {
    const response = await api.get(`/entrenamientos/usuario/${idUsuario}?limit=${limit}`);
    return response.data;
  },

  // Obtener entrenamientos por máquina
  getByMaquina: async (idMaquina, limit = 50) => {
    const response = await api.get(`/entrenamientos/maquina/${idMaquina}?limit=${limit}`);
    return response.data;
  },

  // Actualizar un entrenamiento
  update: async (id, data) => {
    const response = await api.put(`/entrenamientos/${id}`, data);
    return response.data;
  },

  // Eliminar un entrenamiento
  delete: async (id) => {
    const response = await api.delete(`/entrenamientos/${id}`);
    return response.data;
  }
};

export default entrenamientoService;