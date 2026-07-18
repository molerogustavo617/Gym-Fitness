// src/services/entrenadosService.js
import api from './api';

const entrenadosService = {
  // Crear relación entrenador-alumno
  create: async (data) => {
    const response = await api.post('/entrenados', data);
    return response.data;
  },

  // Obtener todas las relaciones
  getAll: async () => {
    const response = await api.get('/entrenados');
    return response.data;
  },

  // Obtener alumnos de un entrenador
  getAlumnosByEntrenador: async (idEntrenador) => {
    const response = await api.get(`/entrenados/entrenador/${idEntrenador}`);
    return response.data;
  },

  // Obtener entrenadores de un alumno
  getEntrenadoresByAlumno: async (idEntrenado) => {
    const response = await api.get(`/entrenados/alumno/${idEntrenado}`);
    return response.data;
  },

  // Actualizar relación
  update: async (id, data) => {
    const response = await api.put(`/entrenados/${id}`, data);
    return response.data;
  },

  // Eliminar relación
  delete: async (id) => {
    const response = await api.delete(`/entrenados/${id}`);
    return response.data;
  },

  // Obtener pagos próximos
  getPagosProximos: async (dias = 7) => {
    const response = await api.get(`/entrenados/pagos/proximos?dias=${dias}`);
    return response.data;
  }
};

export default entrenadosService;