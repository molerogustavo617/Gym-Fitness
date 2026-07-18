// src/pages/admin/Pagos.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
  CheckCircle,
  X,
  Eye,
  Plus,
  Filter,
  RefreshCw,
  DollarSign,
  User,
  Calendar,
  Clock
} from 'lucide-react';
import pagoService from '../../services/pagoService';
import userService from '../../services/userService';
import membresiaService from '../../services/membresiaService';
import authService from '../../services/authService';
import PaymentDisplay from '../../components/PaymentDisplay';
import { usePriceConverter } from '../../hooks/usePriceConverter';

const Pagos = () => {
  const { exchangeRate } = usePriceConverter();
  const [pagos, setPagos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [membresias, setMembresias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterUsuario, setFilterUsuario] = useState('');
  const [filterFechaInicio, setFilterFechaInicio] = useState('');
  const [filterFechaFin, setFilterFechaFin] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Formulario de registro
  const [formData, setFormData] = useState({
    idUsuario: '',
    idMembresia: '',
    metodoPago: 'efectivo',
    montoBs: '',
    referencia: '',
    bancoOrigen: '',
    fechaPago: new Date().toISOString().split('T')[0],
    comprobanteBase64: null,
    comprobanteUrl: null
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (user.idrol !== 1 && user.idrol !== 2)) {
      navigate('/dashboard');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [pagosData, usuariosData, membresiasData] = await Promise.all([
        pagoService.getAll(),
        userService.getAll(),
        membresiaService.getAll()
      ]);
      setPagos(pagosData);
      setUsuarios(usuariosData);
      setMembresias(membresiasData);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPagos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await pagoService.getAll();
      setPagos(data);
    } catch (err) {
      setError('Error al cargar los pagos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no puede superar los 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        comprobanteBase64: reader.result,
        comprobanteUrl: URL.createObjectURL(file)
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const membresia = membresias.find(m => m.idmembresia === parseInt(formData.idMembresia));
      
      // ✅ Convertir Bs a USD (el backend guarda en USD)
      const montoBs = parseFloat(formData.montoBs);
      const montoUSD = exchangeRate > 0 ? montoBs / exchangeRate : 0;

      const dataToSend = {
        idUsuario: parseInt(formData.idUsuario),
        idMembresia: parseInt(formData.idMembresia),
        monto: parseFloat(montoUSD.toFixed(2)) || membresia?.precio || 0,
        metodoPago: formData.metodoPago,
        referencia: formData.referencia || null,
        bancoOrigen: formData.bancoOrigen || null,
        fechaPago: formData.fechaPago,
        comprobanteBase64: formData.comprobanteBase64 || null,
        estado: formData.metodoPago === 'efectivo' ? 'aprobado' : 'pendiente'
      };

      console.log('📤 Monto en Bs:', montoBs);
      console.log('📤 Monto en USD:', montoUSD);
      console.log('📤 Datos a enviar:', dataToSend);

      const response = await pagoService.create(dataToSend);
      
      if (response?.data?.idpago) {
        setSuccess(`Pago registrado correctamente (ID: #${response.data.idpago})`);
        setShowModal(false);
        resetForm();
        loadPagos();
      } else {
        setError('Error al registrar el pago');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      idUsuario: '',
      idMembresia: '',
      metodoPago: 'efectivo',
      montoBs: '',
      referencia: '',
      bancoOrigen: '',
      fechaPago: new Date().toISOString().split('T')[0],
      comprobanteBase64: null,
      comprobanteUrl: null
    });
  };

  const getUserName = (id) => {
    const user = usuarios.find(u => u.idusuario === id);
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario desconocido';
  };

  const getMembresiaNombre = (id) => {
    const membresia = membresias.find(m => m.idmembresia === id);
    return membresia ? membresia.nombre : 'Membresía desconocida';
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado': return 'text-green-400';
      case 'pendiente': return 'text-yellow-400';
      case 'rechazado': return 'text-red-400';
      default: return 'text-gym-gray';
    }
  };

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case 'aprobado': return 'Aprobado';
      case 'pendiente': return 'Pendiente';
      case 'rechazado': return 'Rechazado';
      default: return estado || 'Desconocido';
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(monto || 0);
  };

  const filteredPagos = pagos.filter(pago => {
    const search = searchTerm.toLowerCase();
    const nombreUsuario = getUserName(pago.idusuario).toLowerCase();
    const matchSearch = nombreUsuario.includes(search) || pago.referencia?.toLowerCase().includes(search);
    const matchEstado = filterEstado ? pago.estado === filterEstado : true;
    const matchUsuario = filterUsuario ? pago.idusuario === parseInt(filterUsuario) : true;
    const matchFecha = filterFechaInicio && filterFechaFin 
      ? new Date(pago.fechapago) >= new Date(filterFechaInicio) && new Date(pago.fechapago) <= new Date(filterFechaFin)
      : true;
    return matchSearch && matchEstado && matchUsuario && matchFecha;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPagos.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPagos.length / itemsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando pagos...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-gym-neon" />
          <div>
            <h1 className="text-2xl font-bold text-gym-white tracking-tight">Pagos</h1>
            <p className="text-gym-gray text-sm hidden sm:block">Gestiona los pagos de membresías</p>
          </div>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-gym-neon text-gym-dark px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" /> Registrar Pago
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gym-gray-light" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
            <option value="rechazado">Rechazado</option>
          </select>
          <select
            value={filterUsuario}
            onChange={(e) => {
              setFilterUsuario(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          >
            <option value="">Todos los clientes</option>
            {usuarios.map((user) => (
              <option key={user.idusuario} value={user.idusuario}>
                {user.nombre} {user.apellido}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={filterFechaInicio}
            onChange={(e) => setFilterFechaInicio(e.target.value)}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          />
          <input
            type="date"
            value={filterFechaFin}
            onChange={(e) => setFilterFechaFin(e.target.value)}
            className="px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gym-gray/10">
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">ID</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Cliente</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden sm:table-cell">Membresía</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden md:table-cell">Monto</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Estado</th>
                <th className="text-left py-2.5 px-3 text-gym-gray text-xs uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((pago) => (
                  <tr key={pago.idpago} className="border-b border-gym-gray/5 hover:bg-gym-card/30 transition-colors">
                    <td className="py-2.5 px-3 text-gym-gray-light">#{pago.idpago}</td>
                    <td className="py-2.5 px-3 text-gym-white">{getUserName(pago.idusuario)}</td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden sm:table-cell">{getMembresiaNombre(pago.idmembresia)}</td>
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <PaymentDisplay 
                        amountUSD={pago.monto} 
                        title=""
                        className="bg-transparent p-0 border-0"
                        showExchangeRate={false}
                      />
                    </td>
                    <td className="py-2.5 px-3 text-gym-gray-light hidden lg:table-cell">{formatFecha(pago.fechapago)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`font-medium ${getEstadoColor(pago.estado)}`}>
                        {getEstadoLabel(pago.estado)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={() => navigate(`/admin/pagos/${pago.idpago}`)}
                        className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded hover:bg-blue-400/10"
                        title="Ver detalle"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gym-gray">
                    No hay pagos registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredPagos.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-gym-gray/10">
            <span className="text-gym-gray-light text-xs">
              Mostrando {indexOfFirstItem + 1} al {Math.min(indexOfLastItem, filteredPagos.length)} de {filteredPagos.length} pagos
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

      {/* Modal Registrar Pago */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-dark-secondary rounded-2xl max-w-lg w-full border border-gym-gray/10 max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gym-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-gym-neon" />
                  Registrar Pago
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
                  <label className="text-gym-gray-light text-sm block mb-1">Cliente *</label>
                  <select
                    name="idUsuario"
                    value={formData.idUsuario}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  >
                    <option value="">Seleccionar cliente</option>
                    {usuarios.map((user) => (
                      <option key={user.idusuario} value={user.idusuario}>
                        {user.nombre} {user.apellido} (@{user.usuario})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Membresía *</label>
                  <select
                    name="idMembresia"
                    value={formData.idMembresia}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  >
                    <option value="">Seleccionar membresía</option>
                    {membresias.map((m) => (
                      <option key={m.idmembresia} value={m.idmembresia}>
                        {m.nombre} - {m.precio} USD ({m.duraciondias} días)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Método de Pago *</label>
                  <select
                    name="metodoPago"
                    value={formData.metodoPago}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                  </select>
                </div>

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">
                    Monto (Bs) *
                    {exchangeRate > 0 && (
                      <span className="text-xs text-gym-gray-light ml-1">
                        (Tasa: 1 USD = Bs {exchangeRate.toFixed(2)})
                      </span>
                    )}
                  </label>
                  <input
                    name="montoBs"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 500.00"
                    value={formData.montoBs}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                    required
                  />
                  {formData.montoBs && exchangeRate > 0 && (
                    <p className="text-xs text-gym-gray-light mt-1">
                      ≈ {new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(parseFloat(formData.montoBs) / exchangeRate)}
                    </p>
                  )}
                </div>

                {formData.metodoPago === 'transferencia' && (
                  <>
                    <div>
                      <label className="text-gym-gray-light text-sm block mb-1">Referencia *</label>
                      <input
                        name="referencia"
                        type="text"
                        placeholder="Número de referencia"
                        value={formData.referencia}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-gym-gray-light text-sm block mb-1">Banco Origen</label>
                      <input
                        name="bancoOrigen"
                        type="text"
                        placeholder="Banco desde donde se transfiere"
                        value={formData.bancoOrigen}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-gym-gray-light text-sm block mb-1">Comprobante</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors file:bg-gym-card file:text-gym-white file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-3 cursor-pointer"
                      />
                      {formData.comprobanteUrl && (
                        <div className="mt-2">
                          <img src={formData.comprobanteUrl} alt="Comprobante" className="w-32 h-32 object-cover rounded-lg border border-gym-gray/20" />
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div>
                  <label className="text-gym-gray-light text-sm block mb-1">Fecha de Pago</label>
                  <input
                    name="fechaPago"
                    type="date"
                    value={formData.fechaPago}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white focus:outline-none focus:border-gym-neon/50 transition-colors"
                  />
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
                    {loading ? 'Registrando...' : 'Registrar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagos;