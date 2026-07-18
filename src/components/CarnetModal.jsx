// src/components/CarnetModal.jsx
import React, { useRef } from 'react';
import QRCode from 'react-qr-code';
import { X, Download, Printer, CheckCircle } from 'lucide-react';
import html2canvas from 'html2canvas';

const CarnetModal = ({ isOpen, onClose, user, gymName }) => {
  const carnetRef = useRef(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!carnetRef.current) return;
    
    try {
      const canvas = await html2canvas(carnetRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null
      });
      
      const link = document.createElement('a');
      link.download = `carnet-${user.usuario || 'usuario'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error al descargar el carnet:', error);
    }
  };

  const handlePrint = () => {
    if (!carnetRef.current) return;
    
    const printWindow = window.open('', '_blank');
    const htmlContent = carnetRef.current.outerHTML;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Carnet - ${user.nombre} ${user.apellido}</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0A0A0B; }
            * { box-sizing: border-box; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const nombreCompleto = `${user?.nombre || ''} ${user?.apellido || ''}`.trim();
  const fotoPerfil = user?.fotoperfil || null;
  const inicial = nombreCompleto.charAt(0).toUpperCase() || 'U';
  const qrData = JSON.stringify({
    id: user?.idusuario,
    cedula: user?.cedula || user?.idusuario,
    nombre: nombreCompleto
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-sm w-full">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Carnet */}
        <div
          ref={carnetRef}
          className="bg-gradient-to-br from-[#111625] to-[#0A0A0B] rounded-2xl border border-orange-500/20 p-6 shadow-[0_0_60px_rgba(255,107,53,0.08)] relative overflow-hidden"
        >
          {/* Fondo decorativo */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-orange-500/5 blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-orange-500/5 blur-2xl"></div>

          <div className="relative z-10 text-center">
            {/* Nombre del Gym */}
            <h2 className="text-lg font-black tracking-tight text-white">
              {gymName || 'GYM FITNESS'}
            </h2>
            <div className="w-12 h-0.5 bg-orange-500/30 mx-auto my-2"></div>

            {/* Foto de perfil */}
            <div className="flex justify-center mt-3">
              {fotoPerfil ? (
                <img
                  src={fotoPerfil}
                  alt={nombreCompleto}
                  className="w-20 h-20 rounded-full object-cover border-2 border-orange-500/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center text-3xl font-black text-orange-400">
                  {inicial}
                </div>
              )}
            </div>

            {/* Nombre */}
            <h3 className="text-white font-bold text-lg mt-3 tracking-tight">
              {nombreCompleto || 'Usuario'}
            </h3>

            {/* Rol */}
            <p className="text-orange-400 text-xs font-mono font-bold tracking-wider uppercase">
              MIEMBRO
            </p>

            {/* Cédula */}
            <p className="text-[#9A9AA0] text-sm font-mono mt-1">
              {user?.cedula || 'Sin cédula'}
            </p>

            {/* QR */}
            <div className="flex justify-center mt-4">
              <div className="bg-white p-2 rounded-lg">
                <QRCode
                  value={qrData}
                  size={100}
                  bgColor="#FFFFFF"
                  fgColor="#0A0A0B"
                />
              </div>
            </div>
            <p className="text-[#5C5C60] text-[8px] font-mono mt-1">
              ID: #{user?.idusuario || '0000'}
            </p>

            {/* Sello de verificación */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <span className="text-green-400 text-[10px]">
                VERIFICADO
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 mt-4 justify-center">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-orange-500 text-[#0A0A0B] rounded-xl text-xs font-bold uppercase hover:bg-orange-400 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#1A1A2E] border border-orange-500/20 text-white rounded-xl text-xs font-bold uppercase hover:bg-[#2A2A3E] transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarnetModal;