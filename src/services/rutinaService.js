// src/services/rutinaService.js
import api from './api';

const rutinaService = {
  // ============================================
  // RUTINAS - CRUD BÁSICO
  // ============================================

  getAll: async () => {
    try {
      const response = await api.get('/rutinas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener rutinas:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/rutinas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener rutina ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/rutinas', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear rutina:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/rutinas/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar rutina ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/rutinas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar rutina ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // RUTINA EJERCICIOS - CRUD BÁSICO
  // ============================================

  getEjerciciosByRutina: async (idRutina) => {
    try {
      const response = await api.get(`/rutina-ejercicios/rutina/${idRutina}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener ejercicios de rutina ${idRutina}:`, error);
      throw error;
    }
  },

  addEjercicio: async (data) => {
    try {
      const response = await api.post('/rutina-ejercicios', data);
      return response.data;
    } catch (error) {
      console.error('Error al agregar ejercicio a rutina:', error);
      throw error;
    }
  },

  updateEjercicio: async (id, data) => {
    try {
      const response = await api.put(`/rutina-ejercicios/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar ejercicio de rutina ${id}:`, error);
      throw error;
    }
  },

  removeEjercicio: async (id) => {
    try {
      const response = await api.delete(`/rutina-ejercicios/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar ejercicio de rutina ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // RUTINAS ASIGNADAS - CRUD BÁSICO
  // ============================================

  getAsignaciones: async () => {
    try {
      const response = await api.get('/rutinas-asignadas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener asignaciones:', error);
      throw error;
    }
  },

  getAsignacionesByCliente: async (idCliente) => {
    try {
      const response = await api.get(`/rutinas-asignadas/cliente/${idCliente}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener asignaciones del cliente ${idCliente}:`, error);
      throw error;
    }
  },

  getAsignacionActivaByCliente: async (idCliente) => {
    try {
      const response = await api.get(`/rutinas-asignadas/cliente/${idCliente}/activa`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener asignación activa del cliente ${idCliente}:`, error);
      throw error;
    }
  },

  asignarRutina: async (data) => {
    try {
      const response = await api.post('/rutinas-asignadas', data);
      return response.data;
    } catch (error) {
      console.error('Error al asignar rutina:', error);
      throw error;
    }
  },

  updateAsignacion: async (id, data) => {
    try {
      const response = await api.put(`/rutinas-asignadas/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar asignación ${id}:`, error);
      throw error;
    }
  },

  desasignarRutina: async (id) => {
    try {
      const response = await api.delete(`/rutinas-asignadas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al desasignar rutina ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // DIAS - CRUD BÁSICO
  // ============================================

  getDias: async () => {
    try {
      const response = await api.get('/dias');
      return response.data;
    } catch (error) {
      console.error('Error al obtener días:', error);
      throw error;
    }
  },

  // ============================================
  // FUNCIONES LOCALES (filtros y estadísticas)
  // ============================================

  // Filtrar rutinas por entrenador
  filterByEntrenador: (rutinas, idEntrenador) => {
    if (!idEntrenador) return rutinas;
    return rutinas.filter(r => r.idusuario === idEntrenador);
  },

  // Filtrar rutinas activas
  filterActivas: (rutinas) => {
    return rutinas.filter(r => r.activo === true);
  },

  // Buscar rutinas por texto
  searchLocal: (rutinas, query) => {
    if (!query) return rutinas;
    const search = query.toLowerCase().trim();
    return rutinas.filter(r =>
      r.nombre?.toLowerCase().includes(search) ||
      r.descripcion?.toLowerCase().includes(search)
    );
  },

  // Obtener estadísticas de rutinas
  getEstadisticas: (rutinas) => {
    const total = rutinas.length;
    const activas = rutinas.filter(r => r.activo === true).length;
    return {
      total,
      activas,
      inactivas: total - activas
    };
  },

  // Paginación local
  paginate: (rutinas, page = 1, itemsPerPage = 8) => {
    const start = (page - 1) * itemsPerPage;
    return rutinas.slice(start, start + itemsPerPage);
  },

  // Ordenar rutinas
  sort: (rutinas, field = 'nombre', order = 'asc') => {
    return [...rutinas].sort((a, b) => {
      const valA = (a[field] || '').toString().toLowerCase();
      const valB = (b[field] || '').toString().toLowerCase();
      return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  },

  // Agrupar ejercicios de rutina por día
  groupEjerciciosByDia: (ejercicios) => {
    const grouped = {};
    ejercicios.forEach(ej => {
      const dia = ej.iddia || 'sin-dia';
      if (!grouped[dia]) grouped[dia] = [];
      grouped[dia].push(ej);
    });
    return grouped;
  },

  // Ordenar ejercicios de rutina
  sortEjercicios: (ejercicios) => {
    return [...ejercicios].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  }
};

export default rutinaService;