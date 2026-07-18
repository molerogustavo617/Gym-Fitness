// src/services/entrenamientoService.js
import api from './api';

const entrenamientoService = {
  // ============================================
  // CRUD BÁSICO
  // ============================================

  getAll: async () => {
    try {
      const response = await api.get('/entrenamientos');
      return response.data;
    } catch (error) {
      console.error('Error al obtener entrenamientos:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/entrenamientos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener entrenamiento ${id}:`, error);
      throw error;
    }
  },

  getByUsuario: async (idUsuario) => {
    try {
      const response = await api.get(`/entrenamientos/usuario/${idUsuario}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener entrenamientos del usuario ${idUsuario}:`, error);
      throw error;
    }
  },

  getByRutinaAsignada: async (idAsignacion) => {
    try {
      const response = await api.get(`/entrenamientos/rutina-asignada/${idAsignacion}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener entrenamientos de rutina asignada ${idAsignacion}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const response = await api.post('/entrenamientos', data);
      return response.data;
    } catch (error) {
      console.error('Error al crear entrenamiento:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/entrenamientos/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar entrenamiento ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/entrenamientos/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar entrenamiento ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // FUNCIONES LOCALES
  // ============================================

  // Filtrar por usuario (local)
  filterByUsuarioLocal: (entrenamientos, idUsuario) => {
    if (!idUsuario) return entrenamientos;
    return entrenamientos.filter(e => e.idusuario === idUsuario);
  },

  // Filtrar por fecha
  filterByFecha: (entrenamientos, fecha) => {
    if (!fecha) return entrenamientos;
    return entrenamientos.filter(e => e.fecha === fecha);
  },

  // Filtrar por rango de fechas
  filterByFechaRange: (entrenamientos, fechaInicio, fechaFin) => {
    return entrenamientos.filter(e => {
      if (fechaInicio && e.fecha < fechaInicio) return false;
      if (fechaFin && e.fecha > fechaFin) return false;
      return true;
    });
  },

  // Filtrar completados
  filterCompletados: (entrenamientos, completado = true) => {
    return entrenamientos.filter(e => e.completado === completado);
  },

  // Filtrar por ejercicio
  filterByEjercicio: (entrenamientos, idEjercicio) => {
    if (!idEjercicio) return entrenamientos;
    return entrenamientos.filter(e => e.idejercicio === idEjercicio);
  },

  // Buscar por texto (notas)
  searchLocal: (entrenamientos, query) => {
    if (!query) return entrenamientos;
    const search = query.toLowerCase().trim();
    return entrenamientos.filter(e =>
      e.notas?.toLowerCase().includes(search)
    );
  },

  // Agrupar por sesión (fecha + usuario)
  groupBySesion: (entrenamientos) => {
    const sesiones = {};
    entrenamientos.forEach(e => {
      const key = `${e.idusuario}_${e.fecha}`;
      if (!sesiones[key]) {
        sesiones[key] = {
          idusuario: e.idusuario,
          fecha: e.fecha,
          ejercicios: [],
          completado: e.completado,
          notas: e.notas
        };
      }
      sesiones[key].ejercicios.push({
        idejercicio: e.idejercicio,
        peso: e.peso,
        repeticiones: e.repeticiones,
        completado: e.completado
      });
    });
    return Object.values(sesiones);
  },

  // Calcular estadísticas
  getEstadisticas: (entrenamientos) => {
    const total = entrenamientos.length;
    const completados = entrenamientos.filter(e => e.completado === true).length;
    const pendientes = total - completados;

    // Peso promedio
    const pesos = entrenamientos.filter(e => e.peso > 0).map(e => e.peso);
    const pesoPromedio = pesos.length > 0 
      ? pesos.reduce((a, b) => a + b, 0) / pesos.length 
      : 0;

    // Ejercicios más realizados
    const ejerciciosCount = {};
    entrenamientos.forEach(e => {
      const id = e.idejercicio;
      ejerciciosCount[id] = (ejerciciosCount[id] || 0) + 1;
    });
    const ejerciciosMasRealizados = Object.entries(ejerciciosCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ idejercicio: parseInt(id), count }));

    return {
      total,
      completados,
      pendientes,
      pesoPromedio,
      ejerciciosMasRealizados,
      completadosPorcentaje: total > 0 ? (completados / total) * 100 : 0
    };
  },

  // Obtener progreso por ejercicio
  getProgresoEjercicio: (entrenamientos, idEjercicio, idUsuario) => {
    const filtrados = entrenamientos.filter(e =>
      e.idejercicio === idEjercicio &&
      e.idusuario === idUsuario
    );
    return filtrados
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
      .map(e => ({
        fecha: e.fecha,
        peso: e.peso,
        repeticiones: e.repeticiones,
        completado: e.completado
      }));
  },

  // Paginación local
  paginate: (entrenamientos, page = 1, itemsPerPage = 10) => {
    const start = (page - 1) * itemsPerPage;
    return entrenamientos.slice(start, start + itemsPerPage);
  }
};

export default entrenamientoService;