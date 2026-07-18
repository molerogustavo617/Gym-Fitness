// src/services/membresiaUsuarioService.js
import api from './api';

const membresiaUsuarioService = {
  // Obtener todas las relaciones
  getAll: async () => {
    const response = await api.get('/membresias-usuarios');
    return response.data;
  },

  // Obtener relación por ID
  getById: async (id) => {
    const response = await api.get(`/membresias-usuarios/${id}`);
    return response.data;
  },

  // Obtener membresías activas de un usuario
  getActivasByUsuario: async (idUsuario) => {
    const response = await api.get(`/membresias-usuarios/usuario/${idUsuario}/activas`);
    return response.data;
  },

  // Obtener historial de membresías de un usuario
  getHistorialByUsuario: async (idUsuario) => {
    const response = await api.get(`/membresias-usuarios/usuario/${idUsuario}/historial`);
    return response.data;
  },

  // Verificar si un usuario tiene membresía activa
  tieneMembresiaActiva: async (idUsuario) => {
    const response = await api.get(`/membresias-usuarios/usuario/${idUsuario}/tiene`);
    return response.data;
  },

  // Crear relación
  create: async (data) => {
    const response = await api.post('/membresias-usuarios', data);
    return response.data;
  },

  // Actualizar relación
  update: async (id, data) => {
    const response = await api.put(`/membresias-usuarios/${id}`, data);
    return response.data;
  },

  // Cambiar estado
  updateEstado: async (id, estado) => {
    const response = await api.patch(`/membresias-usuarios/${id}/estado`, { estado });
    return response.data;
  },

  // Eliminar relación
  delete: async (id) => {
    const response = await api.delete(`/membresias-usuarios/${id}`);
    return response.data;
  }
};

export default membresiaUsuarioService;