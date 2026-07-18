// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import cuentaImage from '../assets/cuenta.png'; // ← Importar la imagen

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(correo, clave);  // ← GUARDAR LA RESPUESTA
      console.log('Usuario logueado:', response.usuario);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gym-dark via-gym-dark-secondary to-gym-dark flex items-center justify-center p-5">
      {/* Efecto de fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gym-neon/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gym-neon/5 rounded-full blur-3xl"></div>
      </div>

      <div className="card w-full max-w-md relative z-10 border-gym-neon/10">
        <div className="text-center mb-8">
          {/* Imagen de cuenta */}
          <div className="flex justify-center mb-4">
            <img 
              src={cuentaImage}
              alt="Cuenta" 
              className="w-20 h-20 rounded-full border-2 border-gym-neon/30 object-cover"
            />
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gym-neon to-gym-neon/70 bg-clip-text text-transparent">
            Iniciar Sesión
          </h2>
          <p className="text-gym-gray-light mt-2">Accede a tu cuenta</p>
        </div>

        {error && (
          <div className="bg-gym-danger/10 border border-gym-danger/30 text-gym-danger p-4 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-gym-gray-light text-sm font-medium block mb-2">
              Correo electronico
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="input-gym"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="mb-6">
            <label className="text-gym-gray-light text-sm font-medium block mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                className="input-gym pr-12"
                placeholder="********"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gym-gray hover:text-gym-white transition-colors"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
          </button>
        </form>

        <div className="divider"></div>

        <p className="text-center text-gym-gray text-sm">
          {new Date().getFullYear()} Gym System. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
};

export default Login;
