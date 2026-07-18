// src/pages/cliente/EjerciciosCliente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Search,
  ArrowLeft,
  X,
  Eye,
  Play,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Tag,
  Info
} from 'lucide-react';
import authService from '../../services/authService';
import ejercicioService from '../../services/ejercicioService';

const EjerciciosCliente = () => {
  const navigate = useNavigate();
  const [ejercicios, setEjercicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMusculo, setFilterMusculo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedEjercicio, setSelectedEjercicio] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadEjercicios();
  }, [navigate]);

  const loadEjercicios = async () => {
    setLoading(true);
    try {
      const data = await ejercicioService.getAll();
      setEjercicios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar ejercicios:', error);
    } finally {
      setLoading(false);
    }
  };

  const musculos = [...new Set(ejercicios.map(e => e.musculo).filter(Boolean))];

  const filteredEjercicios = ejercicios.filter(ej => {
    const search = searchTerm.toLowerCase();
    const matchSearch = ej.nombre?.toLowerCase().includes(search) ||
                       ej.descripcion?.toLowerCase().includes(search);
    const matchMusculo = filterMusculo ? ej.musculo === filterMusculo : true;
    return matchSearch && matchMusculo;
  });

  const totalPages = Math.ceil(filteredEjercicios.length / itemsPerPage);
  const currentItems = filteredEjercicios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openDetailModal = (ejercicio) => {
    setSelectedEjercicio(ejercicio);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-[#00F2FE]/20 border-t-[#00F2FE] rounded-full animate-spin"></div>
        <div className="text-[#00F2FE] font-semibold text-sm tracking-wide">Cargando ejercicios...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111625]/50 border border-[#00F2FE]/10 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/cliente/dashboard')}
            className="p-2 rounded-xl border border-[#00F2FE]/10 hover:border-[#00F2FE]/30 text-[#9A9AA0] hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-[#00F2FE]" />
              Ejercicios
            </h1>
            <p className="text-[#9A9AA0] text-xs font-mono">Catálogo completo de ejercicios</p>
          </div>
        </div>
        <span className="text-sm text-[#9A9AA0] font-mono">
          {ejercicios.length} ejercicios
        </span>
      </div>

      {/* BUSCADOR Y FILTROS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9A9AA0]" />
          <input
            type="text"
            placeholder="Buscar ejercicio..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-[#0A0A0B]/50 border border-[#00F2FE]/10 rounded-xl text-white text-sm placeholder-[#9A9AA0] focus:outline-none focus:border-[#00F2FE]/40 transition-colors"
          />
        </div>
        <select
          value={filterMusculo}
          onChange={(e) => {
            setFilterMusculo(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 bg-[#0A0A0B]/50 border border-[#00F2FE]/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F2FE]/40 transition-colors"
        >
          <option value="">Todos los músculos</option>
          {musculos.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* GRID DE EJERCICIOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentItems.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Dumbbell className="w-12 h-12 text-[#9A9AA0]/20 mx-auto mb-3" />
            <p className="text-[#9A9AA0] text-sm font-mono">
              No hay ejercicios que coincidan con los filtros
            </p>
          </div>
        ) : (
          currentItems.map((ej) => (
            <div
              key={ej.idejercicio}
              className="group bg-[#111625]/30 border border-[#00F2FE]/10 rounded-2xl overflow-hidden hover:border-[#00F2FE]/30 transition-all cursor-pointer"
              onClick={() => openDetailModal(ej)}
            >
              {/* Imagen */}
              <div className="w-full h-40 bg-[#0A0A0B]/50 overflow-hidden flex items-center justify-center relative">
                {ej.imagenurl ? (
                  <img
                    src={ej.imagenurl}
                    alt={ej.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="flex flex-col items-center text-[#9A9AA0]/20">
                          <Dumbbell class="w-12 h-12" />
                          <span class="text-xs mt-1">Sin imagen</span>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-[#9A9AA0]/20">
                    <Dumbbell className="w-12 h-12" />
                    <span className="text-xs mt-1">Sin imagen</span>
                  </div>
                )}
                {ej.musculo && (
                  <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-[#00F2FE] text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#00F2FE]/20">
                    {ej.musculo}
                  </span>
                )}
                {ej.videourl && (
                  <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/20 flex items-center gap-0.5">
                    <Play className="w-3 h-3" /> Video
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-3">
                  <span className="text-white text-xs font-mono flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Ver detalle
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-bold text-sm truncate" title={ej.nombre}>
                  {ej.nombre}
                </h3>
                {ej.descripcion && (
                  <p className="text-[#9A9AA0] text-[10px] font-mono mt-1 line-clamp-2">
                    {ej.descripcion}
                  </p>
                )}
                {ej.repeticionesrecomendadas && (
                  <p className="text-[#9A9AA0] text-[10px] font-mono mt-1">
                    Recomendado: {ej.repeticionesrecomendadas}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINACIÓN */}
      {filteredEjercicios.length > itemsPerPage && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-[#00F2FE]/10">
          <span className="text-[#9A9AA0] text-[10px]">
            {((currentPage - 1) * itemsPerPage) + 1}-
            {Math.min(currentPage * itemsPerPage, filteredEjercicios.length)} de {filteredEjercicios.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded-lg text-xs disabled:text-[#9A9AA0]/30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium ${
                    currentPage === pageNum
                      ? 'bg-[#00F2FE]/20 text-[#00F2FE]'
                      : 'text-[#9A9AA0] hover:bg-[#00F2FE]/10'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 rounded-lg text-xs disabled:text-[#9A9AA0]/30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETALLE EJERCICIO */}
      {showDetailModal && selectedEjercicio && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-[#00F2FE]/20 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#00F2FE]" />
                {selectedEjercicio.nombre}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[#9A9AA0] hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagen grande */}
            <div className="w-full h-48 rounded-xl bg-[#0A0A0B]/50 overflow-hidden mb-4 flex items-center justify-center">
              {selectedEjercicio.imagenurl ? (
                <img
                  src={selectedEjercicio.imagenurl}
                  alt={selectedEjercicio.nombre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Dumbbell className="w-16 h-16 text-[#9A9AA0]/20" />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {selectedEjercicio.musculo && (
                  <span className="text-xs bg-[#00F2FE]/10 text-[#00F2FE] px-2 py-0.5 rounded-full">
                    {selectedEjercicio.musculo}
                  </span>
                )}
                {selectedEjercicio.repeticionesrecomendadas && (
                  <span className="text-xs bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded-full">
                    {selectedEjercicio.repeticionesrecomendadas}
                  </span>
                )}
              </div>

              {selectedEjercicio.descripcion && (
                <div className="bg-[#0A0A0B]/50 border border-[#00F2FE]/5 rounded-xl p-3">
                  <p className="text-[#9A9AA0] text-xs font-mono uppercase flex items-center gap-1">
                    <Info className="w-3 h-3" /> Descripción
                  </p>
                  <p className="text-white text-sm mt-1">{selectedEjercicio.descripcion}</p>
                </div>
              )}

              {selectedEjercicio.videourl && (
                <a
                  href={selectedEjercicio.videourl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all"
                >
                  <Play className="w-4 h-4" />
                  Ver video tutorial
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EjerciciosCliente;