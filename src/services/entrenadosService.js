// src/services/entrenadosService.js
import api from './api';

const entrenadosService = {
  // ============================================
  // CRUD BÁSICO
  // ============================================

  getAll: async () => {
    try {
      const response = await api.get('/entrenados');
      return response.data;
    } catch (error) {
      console.error('Error al obtener relaciones:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/entrenados/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener relación ${id}:`, error);
      throw error;
    }
  },

  getByEntrenador: async (idEntrenador) => {
    try {
      const response = await api.get(`/entrenados/entrenador/${idEntrenador}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener relaciones del entrenador ${idEntrenador}:`, error);
      throw error;
    }
  },

  getByCliente: async (idCliente) => {
    try {
      const response = await api.get(`/entrenados/cliente/${idCliente}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener relaciones del cliente ${idCliente}:`, error);
      throw error;
    }
  },

  getActivaByCliente: async (idCliente) => {
    try {
      const response = await api.get(`/entrenados/cliente/${idCliente}/activa`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener relación activa del cliente ${idCliente}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/entrenados', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear relación:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/entrenados/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar relación ${id}:`, error);
      throw error;
    }
  },

  deactivate: async (id) => {
    try {
      const response = await api.delete(`/entrenados/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al desactivar relación ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // FUNCIONES LOCALES
  // ============================================

  // Filtrar relaciones activas
  filterActivos: (relaciones) => {
    return relaciones.filter(r => r.activo === true);
  },

  // Filtrar relaciones por entrenador (local)
  filterByEntrenadorLocal: (relaciones, idEntrenador) => {
    if (!idEntrenador) return relaciones;
    return relaciones.filter(r => r.identrenador === idEntrenador);
  },

  // Filtrar relaciones por cliente (local)
  filterByClienteLocal: (relaciones, idCliente) => {
    if (!idCliente) return relaciones;
    return relaciones.filter(r => r.identrenado === idCliente);
  },

  // Obtener IDs de clientes de un entrenador
  getClientesIds: (relaciones, idEntrenador) => {
    const filtradas = relaciones.filter(r => 
      r.identrenador === idEntrenador && r.activo === true
    );
    return filtradas.map(r => r.identrenado);
  },

  // Obtener estadísticas
  getEstadisticas: (relaciones) => {
    const total = relaciones.length;
    const activas = relaciones.filter(r => r.activo === true).length;
    return {
      total,
      activas,
      inactivas: total - activas
    };
  },

  // Agrupar por entrenador
  groupByEntrenador: (relaciones) => {
    const grouped = {};
    relaciones.forEach(r => {
      const id = r.identrenador;
      if (!grouped[id]) grouped[id] = [];
      grouped[id].push(r);
    });
    return grouped;
  }
};

export default entrenadosService;