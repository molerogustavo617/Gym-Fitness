// src/services/historialCambioService.js
import api from './api';

const historialCambioService = {
  // Obtener todos los registros
  getAll: async () => {
    const response = await api.get('/historial-cambios');
    return response.data;
  },

  // Obtener registro por ID
  getById: async (id) => {
    const response = await api.get(`/historial-cambios/${id}`);
    return response.data;
  },

  // Obtener registros por usuario
  getByUsuario: async (idUsuario) => {
    const response = await api.get(`/historial-cambios/usuario/${idUsuario}`);
    return response.data;
  },

  // Obtener registros por tabla
  getByTabla: async (tabla) => {
    const response = await api.get(`/historial-cambios/tabla/${tabla}`);
    return response.data;
  },

  // Obtener registros por acción
  getByAccion: async (accion) => {
    const response = await api.get(`/historial-cambios/accion/${accion}`);
    return response.data;
  },

  // Obtener registros por rango de fechas
  getByRangoFechas: async (fechaInicio, fechaFin) => {
    const response = await api.get(`/historial-cambios/rango?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
    return response.data;
  }
};

export default historialCambioService;