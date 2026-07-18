// src/services/ejercicioService.js
import api from './api';

const ejercicioService = {
  // ✅ CRUD BÁSICO (existe en backend)
  getAll: async () => {
    const response = await api.get('/ejercicios');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/ejercicios/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/ejercicios', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/ejercicios/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/ejercicios/${id}`);
    return response.data;
  },

  // ✅ FUNCIONES LOCALES (NO llaman al backend)
  
  searchLocal: (ejercicios, query) => {
    if (!query) return ejercicios;
    const search = query.toLowerCase().trim();
    return ejercicios.filter(ej => 
      ej.nombre?.toLowerCase().includes(search) ||
      ej.descripcion?.toLowerCase().includes(search) ||
      ej.musculo?.toLowerCase().includes(search)
    );
  },

  filterByMusculo: (ejercicios, musculo) => {
    if (!musculo) return ejercicios;
    return ejercicios.filter(ej => ej.musculo === musculo);
  },

  filterByMaquina: (ejercicios, idMaquina) => {
    if (!idMaquina) return ejercicios;
    return ejercicios.filter(ej => ej.idmaquina === parseInt(idMaquina));
  },

  getMusculos: (ejercicios) => {
    return [...new Set(ejercicios.map(e => e.musculo).filter(Boolean))];
  },

  paginate: (ejercicios, page = 1, itemsPerPage = 8) => {
    const start = (page - 1) * itemsPerPage;
    return ejercicios.slice(start, start + itemsPerPage);
  },

  getEstadisticas: (ejercicios) => {
    const total = ejercicios.length;
    const musculos = ejercicioService.getMusculos(ejercicios);
    return {
      total,
      musculos: musculos.length,
      porMusculo: musculos.map(m => ({
        musculo: m,
        cantidad: ejercicios.filter(e => e.musculo === m).length
      }))
    };
  }
};

export default ejercicioService;