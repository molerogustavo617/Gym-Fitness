// src/pages/cliente/QRCliente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Shield, Copy, Check, ArrowLeft, Smartphone } from 'lucide-react';
import authService from '../../services/authService';

const QRCliente = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const qrData = user ? JSON.stringify({
    id: user.idusuario,
    cedula: user.cedula || user.idusuario,
    nombre: `${user.nombre} ${user.apellido}`,
  }) : '';

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}&color=00f2fe&bgcolor=111625`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white font-mono text-sm animate-pulse">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col items-center justify-center max-w-md mx-auto px-4">
      
      {/* Header */}
      <div className="flex items-center gap-3 w-full mb-4">
        <button 
          onClick={() => navigate('/cliente/dashboard')}
          className="p-2 rounded-xl border border-[#00F2FE]/10 hover:border-[#00F2FE]/30 text-[#9A9AA0] hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <QrCode className="w-6 h-6 text-[#00F2FE]" />
            Mi QR
          </h1>
          <p className="text-[#9A9AA0] text-xs font-mono">Presenta este código en la recepción</p>
        </div>
      </div>

      {/* QR Code - Centrado */}
      <div className="bg-[#111625]/50 backdrop-blur-md border border-[#00F2FE]/20 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,242,254,0.05)] relative overflow-hidden flex flex-col items-center justify-center w-full max-w-sm">
        
        <div className="absolute top-0 left-0 w-full h-0.5 bg-[#00F2FE]/60 shadow-[0_0_10px_#00f2fe] animate-pulse"></div>

        <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#00F2FE]/30"></div>
        <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#00F2FE]/30"></div>
        <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#00F2FE]/30"></div>
        <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#00F2FE]/30"></div>

        <div className="bg-[#0A0A0B] p-4 rounded-2xl border border-[#00F2FE]/10 shadow-inner">
          <img 
            src={qrUrl} 
            alt="Código QR de Acceso" 
            className="w-48 h-48 rounded-xl object-contain select-none pointer-events-none"
            onError={(e) => { 
              e.target.src = "https://via.placeholder.com/200/111625/00F2FE?text=QR"; 
            }}
          />
        </div>

        <div className="text-center font-mono mt-3">
          <p className="text-white font-bold text-lg">
            {user.nombre} {user.apellido}
          </p>
          <p className="text-[#00F2FE] text-xs mt-1 tracking-widest flex items-center justify-center gap-2">
            <Shield className="w-3 h-3" />
            ID: {user.cedula || user.idusuario}
          </p>
        </div>
      </div>

      {/* Copiar código */}
      <div className="flex items-center gap-3 w-full max-w-sm mt-4">
        <button
          onClick={handleCopy}
          className="flex-1 px-4 py-2.5 bg-[#111625]/50 border border-[#00F2FE]/10 rounded-xl text-sm font-mono text-[#9A9AA0] hover:border-[#00F2FE]/30 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar Código
            </>
          )}
        </button>
      </div>

      {/* Mensaje de advertencia */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#5C5C60] mt-4">
        <Smartphone className="w-3 h-3" />
        <span>No compartas capturas de pantalla de tu acceso personal</span>
      </div>
      
    </div>
  );
};

export default QRCliente;