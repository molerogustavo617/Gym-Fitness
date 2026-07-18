// src/services/userService.js
import api from './api';

const userService = {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await api.get('/usuarios');
    // ✅ Normalizar: asegurar que fotoPerfil tenga el valor correcto
    const users = response.data.map(user => ({
      ...user,
      fotoPerfil: user.fotoPerfil || user.fotoperfil || null
    }));
    return users;
  },

  // Obtener un usuario por ID
  getById: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    const user = response.data;
    // ✅ Normalizar
    user.fotoPerfil = user.fotoPerfil || user.fotoperfil || null;
    return user;
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

  // Descargar reporte de Excel
  downloadExcelReport: async () => {
    const response = await api.get('/usuarios/reporte/excel', {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default userService;