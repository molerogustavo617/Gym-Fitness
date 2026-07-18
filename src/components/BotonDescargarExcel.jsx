// src/components/BotonDescargarExcel.jsx
import React, { useState } from 'react';
import userService from '../services/userService';

const BotonDescargarExcel = () => {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setDescargando(true);
    setError('');

    try {
      const blob = await userService.downloadExcelReport();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Usuarios.xlsx');
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al generar Excel');
      console.error(err);
    } finally {
      setDescargando(false);
    }
  };

  return (
    <div className="flex-1 sm:flex-none">
      <button
        onClick={handleDownload}
        disabled={descargando}
        className="w-full sm:w-auto bg-transparent text-gym-success px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-gym-success/10 border border-gym-success/30 transition-all duration-300 flex items-center gap-1.5 justify-center font-mono disabled:opacity-40"
      >
        {descargando ? (
          <>
            <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-gym-success border-t-transparent rounded-full"></span>
            PROCESANDO...
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            Exportar Excel
          </>
        )}
      </button>
      {error && <p className="text-gym-danger text-[10px] font-mono mt-1 text-center sm:text-left">{error}</p>}
    </div>
  );
};

export default BotonDescargarExcel;