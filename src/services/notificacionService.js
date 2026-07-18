// src/services/notificacionService.js
import api from './api';

const notificacionService = {
  getAll: async () => {
    const response = await api.get('/notificaciones');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/notificaciones/${id}`);
    return response.data;
  },

  getByUsuario: async (idUsuario) => {
    const response = await api.get(`/notificaciones/usuario/${idUsuario}`);
    return response.data;
  },

  getNoLeidas: async (idUsuario) => {
    const response = await api.get(`/notificaciones/usuario/${idUsuario}/no-leidas`);
    return response.data;
  },

  countNoLeidas: async (idUsuario) => {
    const response = await api.get(`/notificaciones/usuario/${idUsuario}/count`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/notificaciones', data);
    return response.data;
  },

  marcarLeida: async (id) => {
    const response = await api.patch(`/notificaciones/${id}/leida`);
    return response.data;
  },

  marcarTodasLeidas: async (idUsuario) => {
    const response = await api.patch(`/notificaciones/usuario/${idUsuario}/leidas`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notificaciones/${id}`);
    return response.data;
  },

  deleteAll: async (idUsuario) => {
    const response = await api.delete(`/notificaciones/usuario/${idUsuario}`);
    return response.data;
  }
};

export default notificacionService;