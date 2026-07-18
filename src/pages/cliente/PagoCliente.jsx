// src/pages/cliente/PagoCliente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Shield,
  Copy,
  Check,
  Upload,
  X,
  Landmark,
  Smartphone,
  Zap,
  FileText
} from 'lucide-react';
import authService from '../../services/authService';
import pagoService from '../../services/pagoService';
import configuracionService from '../../services/configuracionService';
import PaymentDisplay from '../../components/PaymentDisplay';

const PagoCliente = () => {
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [user, setUser] = useState(null);
  const [configuracion, setConfiguracion] = useState(null);
  const [metodoPago, setMetodoPago] = useState('transferencia');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const montoDesdeMembresias = location.state?.monto || null;
  const membresiaDesdeMembresias = location.state?.membresiaSeleccionada || null;

  const [formData, setFormData] = useState({
    referencia: '',
    bancoOrigen: '',
    fechaPago: new Date().toISOString().split('T')[0],
    comprobanteBase64: null,
    comprobanteUrl: null,
    monto: montoDesdeMembresias || ''
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const configData = await configuracionService.getAll();
      setConfiguracion(configData || {});
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecciona una imagen válida');
      return;
    }

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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setEnviando(true);

    try {
      if (metodoPago === 'transferencia') {
        if (!formData.referencia.trim()) {
          setError('El número de referencia es obligatorio');
          setEnviando(false);
          return;
        }
        if (!formData.bancoOrigen.trim()) {
          setError('El banco origen es obligatorio');
          setEnviando(false);
          return;
        }
        if (!formData.comprobanteBase64) {
          setError('La captura de pantalla es obligatoria');
          setEnviando(false);
          return;
        }
      }

      const dataToSend = {
        idUsuario: user.idusuario,
        idMembresia: membresiaDesdeMembresias?.idmembresia || null,
        monto: parseFloat(formData.monto) || 0,
        metodoPago: metodoPago,
        referencia: formData.referencia || null,
        bancoOrigen: formData.bancoOrigen || null,
        fechaPago: formData.fechaPago,
        comprobanteBase64: formData.comprobanteBase64 || null,
        estado: metodoPago === 'efectivo' ? 'aprobado' : 'pendiente',
        comentario: `Pago ${metodoPago === 'efectivo' ? 'en efectivo' : 'por transferencia'}`
      };

      const response = await pagoService.create(dataToSend);
      
      if (response?.data?.idpago) {
        setSuccess('¡Pago registrado correctamente!');
        setShowConfirm(true);
        setTimeout(() => {
          setShowConfirm(false);
          setFormData({
            referencia: '',
            bancoOrigen: '',
            fechaPago: new Date().toISOString().split('T')[0],
            comprobanteBase64: null,
            comprobanteUrl: null,
            monto: ''
          });
        }, 2000);
      } else {
        setError('Error al registrar el pago');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar el pago');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white font-mono text-sm animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin"></div>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 max-w-3xl mx-auto px-4">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/cliente/dashboard')}
          className="p-2 rounded-xl border border-[#00F2FE]/10 hover:border-[#00F2FE]/30 text-[#9A9AA0] hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#00F2FE]" />
            Registrar Pago
          </h1>
          <p className="text-[#9A9AA0] text-xs font-mono">Sube tu comprobante de pago</p>
        </div>
      </div>

      {/* Mostrar membresía seleccionada */}
      {membresiaDesdeMembresias && (
        <div className="bg-[#111625]/40 border border-[#00F2FE]/10 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#9A9AA0] text-xs font-mono">Membresía seleccionada</p>
              <p className="text-white font-bold text-lg">{membresiaDesdeMembresias.nombre}</p>
              <p className="text-[#9A9AA0] text-xs font-mono">{membresiaDesdeMembresias.duraciondias} días de duración</p>
            </div>
            <div className="text-right">
              <PaymentDisplay 
                amountUSD={membresiaDesdeMembresias.precio} 
                title=""
                className="bg-transparent p-0 border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error/Success */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {/* Datos bancarios */}
      {configuracion && (
        <div className="bg-[#111625]/40 border border-[#00F2FE]/10 rounded-2xl p-4">
          <h3 className="text-white text-sm font-bold flex items-center gap-2 mb-3">
            <Landmark className="w-4 h-4 text-[#00F2FE]" />
            Datos para la transferencia
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-1.5 border-b border-[#00F2FE]/5">
              <span className="text-[#9A9AA0] text-sm">Banco:</span>
              <span className="text-white font-medium">{configuracion.banconombre || 'No configurado'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#00F2FE]/5">
              <span className="text-[#9A9AA0] text-sm">Cédula/RIF:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{configuracion.bancocedula || 'No configurado'}</span>
                <button
                  onClick={() => handleCopy(configuracion.bancocedula)}
                  className="text-[#00F2FE] hover:text-[#00D4E0] transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#00F2FE]/5">
              <span className="text-[#9A9AA0] text-sm">Teléfono:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{configuracion.bancotelefono || 'No configurado'}</span>
                <button
                  onClick={() => handleCopy(configuracion.bancotelefono)}
                  className="text-[#00F2FE] hover:text-[#00D4E0] transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-[#9A9AA0] text-sm">Correo:</span>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{configuracion.bancocorreo || 'No configurado'}</span>
                <button
                  onClick={() => handleCopy(configuracion.bancocorreo)}
                  className="text-[#00F2FE] hover:text-[#00D4E0] transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
          {copied && (
            <p className="text-green-400 text-xs font-mono mt-2 flex items-center gap-1">
              <Check className="w-3 h-3" /> Copiado al portapapeles
            </p>
          )}
        </div>
      )}

      {/* Método de pago */}
      <div className="bg-[#111625]/40 border border-[#00F2FE]/10 rounded-2xl p-4">
        <h3 className="text-white text-sm font-bold flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-[#00F2FE]" />
          Método de pago
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMetodoPago('transferencia')}
            className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              metodoPago === 'transferencia'
                ? 'border-[#00F2FE]/40 bg-[#00F2FE]/10'
                : 'border-[#00F2FE]/10 hover:border-[#00F2FE]/30 bg-[#0A0A0B]/30'
            }`}
          >
            <Landmark className={`w-6 h-6 ${metodoPago === 'transferencia' ? 'text-[#00F2FE]' : 'text-[#9A9AA0]'}`} />
            <span className={`text-sm font-medium ${metodoPago === 'transferencia' ? 'text-white' : 'text-[#9A9AA0]'}`}>
              Transferencia
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMetodoPago('efectivo')}
            className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
              metodoPago === 'efectivo'
                ? 'border-[#00F2FE]/40 bg-[#00F2FE]/10'
                : 'border-[#00F2FE]/10 hover:border-[#00F2FE]/30 bg-[#0A0A0B]/30'
            }`}
          >
            <Smartphone className={`w-6 h-6 ${metodoPago === 'efectivo' ? 'text-[#00F2FE]' : 'text-[#9A9AA0]'}`} />
            <span className={`text-sm font-medium ${metodoPago === 'efectivo' ? 'text-white' : 'text-[#9A9AA0]'}`}>
              Efectivo
            </span>
          </button>
        </div>
      </div>

      {/* Formulario de pago */}
      {metodoPago === 'transferencia' && (
        <div className="bg-[#111625]/40 border border-[#00F2FE]/10 rounded-2xl p-4">
          <h3 className="text-white text-sm font-bold flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-[#00F2FE]" />
            Datos de la transferencia
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">Monto (USD) *</label>
              <input
                name="monto"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.monto}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#00F2FE]/20 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F2FE]/50"
                required
              />
              {formData.monto && (
                <div className="mt-2">
                  <PaymentDisplay 
                    amountUSD={parseFloat(formData.monto)} 
                    title=""
                    className="bg-transparent p-0 border-0"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">Número de referencia *</label>
              <input
                name="referencia"
                type="text"
                placeholder="Ej: 20240525123456"
                value={formData.referencia}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#00F2FE]/20 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F2FE]/50"
                required
              />
            </div>

            <div>
              <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">Banco origen *</label>
              <input
                name="bancoOrigen"
                type="text"
                placeholder="Ej: Mercantil, Banesco, Provincial"
                value={formData.bancoOrigen}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#00F2FE]/20 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F2FE]/50"
                required
              />
            </div>

            <div>
              <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">Fecha de transferencia *</label>
              <input
                name="fechaPago"
                type="date"
                value={formData.fechaPago}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-[#0A0A0B] border border-[#00F2FE]/20 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F2FE]/50"
                required
              />
            </div>

            <div>
              <label className="text-[#9A9AA0] text-xs font-mono block mb-1.5">Captura de pantalla *</label>
              <div className="flex flex-col items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#00F2FE]/20 rounded-xl cursor-pointer hover:border-[#00F2FE]/40 transition-all bg-[#0A0A0B]/50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-[#9A9AA0] mb-2" />
                    <p className="text-sm text-[#9A9AA0]">
                      <span className="font-semibold">Subir comprobante</span>
                    </p>
                    <p className="text-xs text-[#5C5C60]">PNG, JPG, WEBP (Máx. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {formData.comprobanteUrl && (
                  <div className="mt-3 relative">
                    <img 
                      src={formData.comprobanteUrl} 
                      alt="Comprobante" 
                      className="w-32 h-32 object-cover rounded-xl border border-[#00F2FE]/20"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          comprobanteBase64: null,
                          comprobanteUrl: null
                        });
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full py-3 bg-[#00F2FE] text-[#0A0A0B] font-bold rounded-xl hover:bg-[#00D4E0] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {enviando ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Enviar Pago
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Pago en efectivo */}
      {metodoPago === 'efectivo' && (
        <div className="bg-[#111625]/40 border border-[#00F2FE]/10 rounded-2xl p-6 text-center">
          <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
          <h3 className="text-white font-bold text-lg">Pago en Efectivo</h3>
          <p className="text-[#9A9AA0] text-sm font-mono mt-1">
            Acércate a la recepción para realizar tu pago en efectivo.
          </p>
          <p className="text-[#5C5C60] text-xs font-mono mt-2">
            El recepcionista registrará tu pago manualmente.
          </p>
          <button
            onClick={() => {
              setSuccess('¡Pago registrado en efectivo!');
              setShowConfirm(true);
              setTimeout(() => {
                setShowConfirm(false);
                loadData();
              }, 2000);
            }}
            className="mt-4 px-6 py-2.5 bg-yellow-500 text-[#0A0A0B] font-bold rounded-xl hover:bg-yellow-400 transition-all"
          >
            Marcar como pagado
          </button>
        </div>
      )}

      {/* Confirmación */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111625] border border-[#00F2FE]/30 rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-xl font-black text-white mb-2">¡Pago Registrado!</h2>
            <p className="text-[#9A9AA0] text-sm font-mono">
              Tu pago ha sido enviado correctamente.
              {metodoPago === 'transferencia' && ' Queda pendiente de aprobación.'}
            </p>
            {metodoPago === 'transferencia' && (
              <p className="text-yellow-400 text-xs font-mono mt-2">
                ⏳ El administrador revisará tu comprobante
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PagoCliente;