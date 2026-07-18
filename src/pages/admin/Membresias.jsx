// src/pages/admin/Membresias.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle,
  X,
  Plus,
  Edit,
  Trash2,
  Power,
  DollarSign,
  Calendar,
  Tag
} from 'lucide-react';
import membresiaService from '../../services/membresiaService';
import authService from '../../services/authService';
import PaymentDisplay from '../../components/PaymentDisplay';
import { usePriceConverter } from '../../hooks/usePriceConverter';

const Membresias = () => {
  const { exchangeRate } = usePriceConverter();
  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActivo, setFilterActivo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMembresia, setSelectedMembresia] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    precioBs: '',
    duracionDias: '',
    activo: true
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.idrol !== 1) {
      navigate('/dashboard');
      return;
    }
    loadMembresias();
  }, [navigate]);

  const loadMembresias = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await membresiaService.getAll();
      setMembresias(data);
    } catch (err) {
      setError('Error al cargar las membresías');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({
      nombre: '',
      precioBs: '',
      duracionDias: '',
      activo: true
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openEditModal = (membresia) => {
    setIsEditing(true);
    setSelectedMembresia(membresia);
    // ✅ Convertir el precio de USD a Bs para mostrarlo en el formulario
    const precioBs = exchangeRate > 0 ? (membresia.precio || 0) * exchangeRate : membresia.precio || 0;
    setFormData({
      nombre: membresia.nombre || '',
      precioBs: precioBs.toFixed(2),
      duracionDias: membresia.duraciondias || '',
      activo: membresia.activo !== undefined ? membresia.activo : true
    });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const openDeleteModal = (membresia) => {
    setSelectedMembresia(membresia);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // ✅ Convertir Bs a USD usando la tasa de cambio
      const precioBs = parseFloat(formData.precioBs);
      const precioUSD = exchangeRate > 0 ? precioBs / exchangeRate : 0;

      const dataToSend = {
        nombre: formData.nombre,
        precio: parseFloat(precioUSD.toFixed(2)), // ✅ Guardar en USD
        duracionDias: parseInt(formData.duracionDias),
        activo: formData.activo
      };

      console.log('📤 Precio en Bs:', precioBs);
      console.log('📤 Precio en USD:', precioUSD);
      console.log('📤 Datos a enviar:', dataToSend);

      if (isEditing) {
        await membresiaService.update(selectedMembresia.idmembresia, dataToSend);
        setSuccess('Membresía actualizada correctamente');
      } else {
        await membresiaService.create(dataToSend);
        setSuccess('Membresía creada correctamente');
      }

      setShowModal(false);
      loadMembresias();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la membresía');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (membresia) => {
    try {
      await membresiaService.toggleStatus(membresia.idmembresia, !membresia.activo);
      setSuccess(`Membresía ${membresia.activo ? 'desactivada' : 'activada'} correctamente`);
      loadMembresias();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar el estado');
    }
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await membresiaService.delete(selectedMembresia.idmembresia);
      setSuccess('Membresía eliminada correctamente');
      setShowDeleteModal(false);
      loadMembresias();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar la membresía');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembresias = membresias.filter(m => {
    const search = searchTerm.toLowerCase();
    const matchSearch = m.nombre?.toLowerCase().includes(search);
    const matchActivo = filterActivo !== '' ? m.activo === (filterActivo === 'true') : true;
    return matchSearch && matchActivo;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMembresias.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredMembresias.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando membresías...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <Package className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-2xl font-bold text-gym-white tracking-tight">Membresías</h1>
            <p className="text-gym-gray text-sm hidden sm:block">Gestiona los planes de membresía del gimnasio</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Nueva Membresía
        </button>
      </div>

      {/* Error/Success */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
          <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gym-gray-light" />
            <input
              type="text"
              placeholder="Buscar membresía..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>
          <select
            value={filterActivo}
            onChange={(e) => {
              setFilterActivo(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gym-gray/10">
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Nombre</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden sm:table-cell">Precio</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden md:table-cell">Duración</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((membresia) => (
                  <tr key={membresia.idmembresia} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 px-3 text-gym-white font-medium">{membresia.nombre}</td>
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      <PaymentDisplay 
                        amountUSD={membresia.precio} 
                        title=""
                        className="bg-transparent p-0 border-0"
                        showExchangeRate={false}
                      />
                    </td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden md:table-cell">{membresia.duraciondias} días</td>
                    <td className="py-2.5 px-3">
                      <span className={membresia.activo ? 'text-green-400' : 'text-red-400'}>
                        {membresia.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(membresia)}
                          className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-400/10"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(membresia)}
                          className={`transition-colors p-1 rounded ${
                            membresia.activo 
                              ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10' 
                              : 'text-green-400 hover:text-green-300 hover:bg-green-400/10'
                          }`}
                          title={membresia.activo ? 'Desactivar' : 'Activar'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(membresia)}
                          className="text-red-400 hover:text-red-300 transition-colors p-1 rounded hover:bg-red-400/10"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gym-gray">
                    No hay membresías registradas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredMembresias.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gym-gray/10">
            <span className="text-gym-gray-light text-xs">
              Mostrando {indexOfFirstItem + 1} al {Math.min(indexOfLastItem, filteredMembresias.length)} de {filteredMembresias.length} membresías
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPage === 1 
                    ? 'text-gym-gray/30 cursor-not-allowed' 
                    : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? 'bg-gym-neon/10 text-gym-neon border border-gym-neon/30'
                        : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-gym-gray/30 cursor-not-allowed' 
                    : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-white'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gym-white">
                  {isEditing ? 'Editar Membresía' : 'Nueva Membresía'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gym-gray hover:text-gym-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg mb-4 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {error}
                  <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Nombre *</label>
                  <input
                    name="nombre"
                    type="text"
                    placeholder="Ej: Mensual"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">
                    Precio (Bs) *
                    {exchangeRate > 0 && (
                      <span className="text-xs text-gym-gray-light ml-1">
                        (Tasa: 1 USD = Bs {exchangeRate.toFixed(2)})
                      </span>
                    )}
                  </label>
                  <input
                    name="precioBs"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 500.00"
                    value={formData.precioBs}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  />
                  {formData.precioBs && exchangeRate > 0 && (
                    <p className="text-xs text-gym-gray-light mt-1">
                      ≈ {new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(parseFloat(formData.precioBs) / exchangeRate)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Duración (días) *</label>
                  <input
                    name="duracionDias"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={formData.duracionDias}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    name="activo"
                    type="checkbox"
                    checked={formData.activo}
                    onChange={handleInputChange}
                    className="w-4 h-4 bg-gym-dark border-gym-gray/20 rounded text-gym-neon focus:ring-gym-neon/50"
                  />
                  <label className="text-gym-gray-light text-sm">Membresía activa</label>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t border-gym-gray/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors w-full sm:w-auto"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-gym-neon text-gym-dark px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition-colors disabled:opacity-50 w-full sm:w-auto"
                  >
                    {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedMembresia && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-md w-full border border-gym-gray/10">
            <div className="p-4 md:p-6">
              <h2 className="text-lg font-bold text-gym-white flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-400" />
                Eliminar Membresía
              </h2>
              <p className="text-gym-gray-light text-sm mt-2">
                ¿Estás seguro de que deseas eliminar la membresía 
                <span className="text-gym-white font-medium"> "{selectedMembresia.nombre}"</span>?
              </p>
              <p className="text-gym-warning text-xs mt-1">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4 pt-4 border-t border-gym-gray/10">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 w-full sm:w-auto"
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Membresias;