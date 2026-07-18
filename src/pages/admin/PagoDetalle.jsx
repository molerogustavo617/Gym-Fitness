// src/pages/admin/PagoDetalle.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  XCircle,
  CheckCircle,
  X,
  User,
  Calendar,
  DollarSign,
  FileText,
  Image,
  Clock,
  AlertCircle,
  Check,
  Trash2,
  Eye
} from 'lucide-react';
import pagoService from '../../services/pagoService';
import userService from '../../services/userService';
import membresiaService from '../../services/membresiaService';
import authService from '../../services/authService';
import PaymentDisplay from '../../components/PaymentDisplay';

const PagoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pago, setPago] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [membresia, setMembresia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showComprobante, setShowComprobante] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [comentarioRechazo, setComentarioRechazo] = useState('');
  const [showRechazoInput, setShowRechazoInput] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || (user.idrol !== 1 && user.idrol !== 2)) {
      navigate('/dashboard');
      return;
    }
    setCurrentUser(user);
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const pagoData = await pagoService.getById(id);
      setPago(pagoData);

      if (pagoData.idusuario) {
        const userData = await userService.getById(pagoData.idusuario);
        setUsuario(userData);
      }

      if (pagoData.idmembresia) {
        const membresiaData = await membresiaService.getById(pagoData.idmembresia);
        setMembresia(membresiaData);
      }
    } catch (err) {
      setError('Error al cargar el detalle del pago');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAprobar = async () => {
    if (!window.confirm('¿Estás seguro de aprobar este pago?')) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await pagoService.aprobar(id);
      setSuccess('Pago aprobado correctamente');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al aprobar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleRechazar = async () => {
    if (!comentarioRechazo.trim()) {
      setError('Debes ingresar un motivo de rechazo');
      return;
    }

    if (!window.confirm('¿Estás seguro de rechazar este pago?')) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await pagoService.rechazar(id, comentarioRechazo);
      setSuccess('Pago rechazado correctamente');
      setShowRechazoInput(false);
      setComentarioRechazo('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al rechazar el pago');
    } finally {
      setLoading(false);
    }
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

  const formatFechaCompleta = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMonto = (monto) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD'
    }).format(monto || 0);
  };

  const getMetodoPagoLabel = (metodo) => {
    switch (metodo) {
      case 'efectivo': return 'Efectivo';
      case 'transferencia': return 'Transferencia';
      default: return metodo || 'Desconocido';
    }
  };

  if (loading && !pago) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-10 h-10 border-4 border-gym-neon/20 border-t-gym-neon rounded-full animate-spin"></div>
        <div className="text-gym-neon font-semibold text-sm tracking-wide">Cargando detalle...</div>
      </div>
    );
  }

  if (!pago) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <XCircle className="w-12 h-12 text-gym-danger" />
        <p className="text-gym-gray">Pago no encontrado</p>
        <button
          onClick={() => navigate('/admin/pagos')}
          className="text-gym-neon hover:underline"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gym-dark-secondary p-4 md:p-6 rounded-2xl border border-gym-gray/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/pagos')}
            className="text-gym-gray-light hover:text-gym-white transition-colors p-1"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gym-white tracking-tight">
              Pago #{pago.idpago}
            </h1>
            <p className="text-gym-gray text-sm hidden sm:block">
              Detalle del pago de membresía
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-medium text-sm ${getEstadoColor(pago.estado)}`}>
            {getEstadoLabel(pago.estado)}
          </span>
          <span className="text-gym-gray-light text-xs">•</span>
          <span className="text-gym-gray-light text-xs">{formatFecha(pago.fechapago)}</span>
        </div>
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

      {/* Contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Columna Izquierda - Información del Cliente y Membresía */}
        <div className="lg:col-span-2 space-y-4">
          {/* Cliente */}
          <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4" /> Cliente
            </h3>
            {usuario ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-gym-gray-light text-xs">Nombre</p>
                  <p className="text-gym-white font-medium">{usuario.nombre} {usuario.apellido}</p>
                </div>
                <div>
                  <p className="text-gym-gray-light text-xs">Usuario</p>
                  <p className="text-gym-white font-medium">@{usuario.usuario}</p>
                </div>
                <div>
                  <p className="text-gym-gray-light text-xs">Cédula</p>
                  <p className="text-gym-white font-medium">{usuario.cedula || '-'}</p>
                </div>
                <div>
                  <p className="text-gym-gray-light text-xs">Correo</p>
                  <p className="text-gym-white font-medium">{usuario.correo || '-'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gym-gray">Cliente no encontrado</p>
            )}
          </div>

          {/* Membresía */}
          <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Membresía
            </h3>
            {membresia ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-gym-gray-light text-xs">Nombre</p>
                  <p className="text-gym-white font-medium">{membresia.nombre}</p>
                </div>
                <div>
                  <p className="text-gym-gray-light text-xs">Precio</p>
                  <PaymentDisplay 
                    amountUSD={membresia.precio} 
                    title=""
                    className="bg-transparent p-0 border-0"
                    showExchangeRate={false}
                  />
                </div>
                <div>
                  <p className="text-gym-gray-light text-xs">Duración</p>
                  <p className="text-gym-white font-medium">{membresia.duraciondias} días</p>
                </div>
              </div>
            ) : (
              <p className="text-gym-gray">Membresía no encontrada</p>
            )}
          </div>
        </div>

        {/* Columna Derecha - Datos del Pago y Acciones */}
        <div className="space-y-4">
          {/* Datos del Pago */}
          <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
            <h3 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Datos del Pago
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gym-gray-light text-sm">Monto</span>
                <PaymentDisplay 
                  amountUSD={pago.monto} 
                  title=""
                  className="bg-transparent p-0 border-0"
                  showExchangeRate={false}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-gym-gray-light text-sm">Método</span>
                <span className="text-gym-white">{getMetodoPagoLabel(pago.metodopago)}</span>
              </div>
              {pago.referencia && (
                <div className="flex justify-between">
                  <span className="text-gym-gray-light text-sm">Referencia</span>
                  <span className="text-gym-white font-mono text-sm">{pago.referencia}</span>
                </div>
              )}
              {pago.bancoorigen && (
                <div className="flex justify-between">
                  <span className="text-gym-gray-light text-sm">Banco Origen</span>
                  <span className="text-gym-white">{pago.bancoorigen}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gym-gray-light text-sm">Fecha de Pago</span>
                <span className="text-gym-white">{formatFecha(pago.fechapago)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gym-gray-light text-sm">Fecha de Registro</span>
                <span className="text-gym-gray-light text-xs">{formatFechaCompleta(pago.fechacreacion)}</span>
              </div>
              {pago.comentario && (
                <div className="mt-2 pt-2 border-t border-gym-gray/10">
                  <p className="text-gym-gray-light text-sm">Comentario</p>
                  <p className="text-gym-white text-sm">{pago.comentario}</p>
                </div>
              )}
            </div>
          </div>

          {/* Comprobante */}
          {pago.comprobante && (
            <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
              <h3 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider mb-4 flex items-center gap-2">
                <Image className="w-4 h-4" /> Comprobante
              </h3>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowComprobante(true)}
                  className="relative group"
                >
                  <img
                    src={pago.comprobante}
                    alt="Comprobante"
                    className="w-48 h-48 object-cover rounded-lg border border-gym-gray/20 hover:border-gym-neon/50 transition-all"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Acciones */}
          {pago.estado === 'pendiente' && currentUser?.idrol === 1 && (
            <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
              <h3 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider mb-4">
                Acciones
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleAprobar}
                  disabled={loading}
                  className="w-full bg-gym-success/10 text-gym-success border border-gym-success/20 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gym-success/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Aprobar Pago
                </button>

                {!showRechazoInput ? (
                  <button
                    onClick={() => setShowRechazoInput(true)}
                    disabled={loading}
                    className="w-full bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Rechazar Pago
                  </button>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      placeholder="Motivo del rechazo..."
                      value={comentarioRechazo}
                      onChange={(e) => setComentarioRechazo(e.target.value)}
                      className="w-full px-4 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white placeholder-gym-gray-light focus:outline-none focus:border-gym-neon/50 transition-colors resize-none text-sm"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setShowRechazoInput(false);
                          setComentarioRechazo('');
                        }}
                        className="flex-1 px-4 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors text-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleRechazar}
                        disabled={loading || !comentarioRechazo.trim()}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Rechazando...' : 'Rechazar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {pago.estado !== 'pendiente' && (
            <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
              <p className="text-gym-gray-light text-sm text-center">
                {pago.estado === 'aprobado' ? '✅ Este pago ya fue aprobado' : '❌ Este pago ya fue rechazado'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Comprobante */}
      {showComprobante && pago.comprobante && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowComprobante(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={pago.comprobante}
              alt="Comprobante"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PagoDetalle;