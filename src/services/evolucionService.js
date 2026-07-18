// src/services/evolucionService.js
import api from './api';

const evolucionService = {
  // ============================================
  // CRUD BÁSICO
  // ============================================

  getAll: async () => {
    try {
      const response = await api.get('/evolucion');
      return response.data;
    } catch (error) {
      console.error('Error al obtener evoluciones:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/evolucion/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener evolución ${id}:`, error);
      throw error;
    }
  },

  getByUsuario: async (idUsuario) => {
    try {
      const response = await api.get(`/evolucion/usuario/${idUsuario}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener evoluciones del usuario ${idUsuario}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/evolucion', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear evolución:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/evolucion/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar evolución ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/evolucion/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar evolución ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // FUNCIONES LOCALES
  // ============================================

  // Filtrar por usuario (local)
  filterByUsuarioLocal: (evoluciones, idUsuario) => {
    if (!idUsuario) return evoluciones;
    return evoluciones.filter(e => e.idusuario === idUsuario);
  },

  // Filtrar por rango de fechas
  filterByFechaRange: (evoluciones, fechaInicio, fechaFin) => {
    return evoluciones.filter(e => {
      if (fechaInicio && e.fecha < fechaInicio) return false;
      if (fechaFin && e.fecha > fechaFin) return false;
      return true;
    });
  },

  // Obtener última evolución (local)
  getUltimaLocal: (evoluciones) => {
    if (evoluciones.length === 0) return null;
    return evoluciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0];
  },

  // Obtener primera evolución (local)
  getPrimeraLocal: (evoluciones) => {
    if (evoluciones.length === 0) return null;
    return evoluciones.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))[0];
  },

  // Calcular estadísticas de evolución
  getEstadisticasLocal: (evoluciones) => {
    if (evoluciones.length === 0) {
      return {
        total: 0,
        pesoInicial: null,
        pesoActual: null,
        pesoCambio: null,
        grasaInicial: null,
        grasaActual: null,
        grasaCambio: null,
        masaInicial: null,
        masaActual: null,
        masaCambio: null
      };
    }

    const sorted = [...evoluciones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const primera = sorted[0];
    const ultima = sorted[sorted.length - 1];

    return {
      total: evoluciones.length,
      pesoInicial: primera.peso,
      pesoActual: ultima.peso,
      pesoCambio: ultima.peso - primera.peso,
      grasaInicial: primera.porcentajegrasa,
      grasaActual: ultima.porcentajegrasa,
      grasaCambio: ultima.porcentajegrasa - primera.porcentajegrasa,
      masaInicial: primera.porcentajemasacorporal,
      masaActual: ultima.porcentajemasacorporal,
      masaCambio: ultima.porcentajemasacorporal - primera.porcentajemasacorporal
    };
  },

  // Obtener datos para gráfico (peso vs tiempo)
  getPesoChartData: (evoluciones) => {
    return [...evoluciones]
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map(e => ({
        fecha: e.fecha,
        peso: e.peso,
        grasa: e.porcentajegrasa,
        masa: e.porcentajemasacorporal
      }));
  },

  // Calcular tendencia
  getTendencia: (evoluciones, campo = 'peso') => {
    if (evoluciones.length < 2) return 'insuficiente';
    
    const sorted = [...evoluciones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const primero = sorted[0][campo];
    const ultimo = sorted[sorted.length - 1][campo];
    
    if (ultimo > primero) return 'subiendo';
    if (ultimo < primero) return 'bajando';
    return 'estable';
  }
};

export default evolucionService;