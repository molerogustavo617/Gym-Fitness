// src/services/authService.js
import api from './api';

const authService = {
  // Iniciar sesión
  login: async (correo, clave) => {
    const response = await api.post('/auth/login', { correo, clave });
    const { token, usuario } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usuario));
    
    return { token, usuario };
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Obtener usuario guardado
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;