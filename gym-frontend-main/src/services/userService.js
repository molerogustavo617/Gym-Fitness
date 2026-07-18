// src/services/userService.js
import api from './api';

const userService = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  // Obtener un usuario por ID
  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // Crear un nuevo usuario
  create: async (data) => {
    const response = await api.post('/usuarios', data);
    return response.data;
  },

  // Actualizar un usuario
  update: async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (id, nuevaClave) => {
    const response = await api.put(`/usuarios/${id}/password`, { clave: nuevaClave });
    return response.data;
  },

  // Activar/desactivar usuario
  toggleStatus: async (id, activo) => {
    const response = await api.patch(`/usuarios/${id}/status`, { activo });
    return response.data;
  },

  // NUEVO MÉTODO: Descargar reporte de Excel manejando el binario (Blob) con la instancia 'api'
  downloadExcelReport: async () => {
    const response = await api.get('/usuarios/reporte/excel', {
      responseType: 'blob' // Indispensable para que no se corrompa el Excel
    });
    return response.data;
  }
};

export default userService;