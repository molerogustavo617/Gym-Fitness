// src/services/accesoService.js
import api from './api';

const accesoService = {
  // Registrar entrada
  registrarEntrada: async (idUsuario, registradoPor) => {
    const response = await api.post('/accesos/entrada', { idUsuario, registradoPor });
    return response.data;
  },

  // Registrar salida por usuario
  registrarSalida: async (idUsuario) => {
    const response = await api.put(`/accesos/salida/usuario/${idUsuario}`);
    return response.data;
  },

  // Obtener usuarios activos (dentro del gimnasio)
  getActivos: async () => {
    const response = await api.get('/accesos/activos');
    return response.data;
  },

  // Obtener historial de accesos de un usuario
  getHistorialByUsuario: async (idUsuario, limit = 50) => {
    const response = await api.get(`/accesos/usuario/${idUsuario}?limit=${limit}`);
    return response.data;
  },

  // Obtener accesos del día actual
  getAccesosHoy: async () => {
    const response = await api.get('/accesos/hoy');
    return response.data;
  }
};

export default accesoService;