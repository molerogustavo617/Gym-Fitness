// src/pages/cliente/QRCliente.jsx
import React from 'react';
import authService from '../../services/authService';

const QRCliente = () => {
  const user = authService.getCurrentUser() || { nombre: 'Usuario', cedula: '00000000' };

  // Usamos una API pública y gratuita para generar el código QR basado en el identificador único del usuario (su cédula o id)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${user.cedula || user.id || 'gym-user'}&color=00f2fe&bgcolor=111625`;

  return (
    <div className="space-y-6 max-w-md mx-auto text-center">
      <div>
        <h2 className="text-xl font-black text-gym-white tracking-tight uppercase">MI ACCESO QR</h2>
        <p className="text-gym-gray-light text-xs font-mono">Presenta este código en la recepción para registrar tu entrada</p>
      </div>

      {/* CONTENEDOR DEL QR CON EFECTO DE ESCANEO */}
      <div className="card border-gym-neon/20 bg-gym-dark-secondary/40 backdrop-blur-md p-8 rounded-3xl shadow-[0_0_30px_rgba(0,242,254,0.05)] relative overflow-hidden flex flex-col items-center justify-center">
        
        {/* Línea Láser Animada */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gym-neon/60 shadow-[0_0_10px_#00f2fe] animate-bounce" style={{ animationDuration: '3s' }}></div>

        {/* Imagen del QR generado dinámicamente */}
        <div className="bg-gym-dark p-4 rounded-2xl border border-gym-neon/10 mb-4 shadow-inner">
          <img 
            src={qrUrl} 
            alt="Código QR de Acceso" 
            className="w-56 h-56 rounded-xl object-contain select-none pointer-events-none"
            onError={(e) => { e.target.src = "https://via.placeholder.com/250?text=QR+Error"; }}
          />
        </div>

        {/* Información corta */}
        <div className="font-mono">
          <div className="text-gym-white font-bold tracking-wide uppercase text-sm">
            {user.nombre} {user.apellido}
          </div>
          <div className="text-gym-neon text-xs mt-0.5 tracking-widest uppercase">
            ID: {user.cedula || 'ATLETA-ACTIVO'}
          </div>
        </div>
      </div>

      <p className="text-[11px] font-mono text-gym-gray leading-normal px-4">
        * El código se actualiza automáticamente con tus credenciales seguras de afiliado. No compartas capturas de pantalla de tu acceso.
      </p>
    </div>
  );
};

export default QRCliente;