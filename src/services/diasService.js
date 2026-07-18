// src/services/diasService.js
import api from './api';

const diasService = {
  // ============================================
  // CRUD BÁSICO
  // ============================================

  // Obtener todos los días
  getAll: async () => {
    try {
      const response = await api.get('/dias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener días:', error);
      throw error;
    }
  },

  // Obtener día por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/dias/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener día ${id}:`, error);
      throw error;
    }
  },

  // Crear día
  create: async (data) => {
    try {
      const response = await api.post('/dias', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear día:', error);
      throw error;
    }
  },

  // Actualizar día
  update: async (id, data) => {
    try {
      const response = await api.put(`/dias/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar día ${id}:`, error);
      throw error;
    }
  },

  // Eliminar día
  delete: async (id) => {
    try {
      const response = await api.delete(`/dias/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar día ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // FUNCIONES LOCALES
  // ============================================

  // Obtener días ordenados
  getDiasOrdenados: (dias) => {
    return [...dias].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  },

  // Buscar día por nombre
  searchLocal: (dias, query) => {
    if (!query) return dias;
    const search = query.toLowerCase().trim();
    return dias.filter(d => d.nombre?.toLowerCase().includes(search));
  },

  // Obtener nombre de día por ID
  getNombreById: (dias, id) => {
    const dia = dias.find(d => d.iddia === id);
    return dia ? dia.nombre : 'Sin día';
  },

  // Obtener ID de día por nombre
  getIdByNombre: (dias, nombre) => {
    const dia = dias.find(d => d.nombre?.toLowerCase() === nombre?.toLowerCase());
    return dia ? dia.iddia : null;
  }
};

export default diasService;