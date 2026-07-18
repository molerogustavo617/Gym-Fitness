// src/services/accesoService.js
import api from './api';

const accesoService = {
  getAll: async () => {
    const response = await api.get('/accesos');
    return response.data;
  },

  getActivos: async () => {
    const response = await api.get('/accesos/activos');
    return response.data;
  },

  getByUsuario: async (idUsuario) => {
    const response = await api.get(`/accesos/usuario/${idUsuario}`);
    return response.data;
  },

  registrarEntrada: async (data) => {
    const response = await api.post('/accesos/entrada', data);
    return response.data;
  },

  registrarSalida: async (data) => {
    const response = await api.post('/accesos/salida', data);
    return response.data;
  }
};

export default accesoService;