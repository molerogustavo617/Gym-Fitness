/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Fondo Base Principal - Gris Oscuro Texturizado
        'gym-dark': '#171717',
        // Fondo Secundario - Un toque más oscuro para contrastar secciones
        'gym-dark-secondary': '#0F0F0F',
        // Superficie de tarjetas y modales
        'gym-card': '#222222',
        'gym-card-hover': '#2A2A2A',
        
        // Colores de soporte para textos y bordes
        'gym-gray': '#6B7280',
        'gym-gray-light': '#9CA3AF',
        'gym-white': '#FFFFFF',

        // COLOR DE ACENTO: VERDE TIFFANY (Tu color estrella)
        'gym-neon': '#21F1A8', 
        // Efecto Glow / Resplandor con transparencia basado en tu Tiffany
        'gym-neon-glow': 'rgba(33, 241, 168, 0.15)',

        // Colores de estado integrados a la paleta
        'gym-success': '#00F5A0', // Verde Tiffany brillante
        'gym-danger': '#FF3B30',
        'gym-warning': '#FFCC00',
        'gym-info': '#00A3FF',
      },
    },
  },
  plugins: [],
}