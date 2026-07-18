// src/pages/cliente/MembresiasCliente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  ArrowLeft,
  Calendar,
  Clock,
  AlertCircle,
  Shield,
  Zap,
  Crown,
  ArrowRight,
  X
} from 'lucide-react';
import authService from '../../services/authService';
import membresiaService from '../../services/membresiaService';
import membresiaUsuarioService from '../../services/membresiaUsuarioService';
import PaymentDisplay from '../../components/PaymentDisplay';

const MembresiasCliente = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [membresias, setMembresias] = useState([]);
  const [membresiaActiva, setMembresiaActiva] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadData(currentUser.idusuario);
  }, [navigate]);

  const loadData = async (userId) => {
    setLoading(true);
    setError('');
    try {
      const membresiasData = await membresiaService.getAll();
      setMembresias(membresiasData || []);

      const activaData = await membresiaUsuarioService.getActivasByUsuario(userId);
      if (activaData && activaData.length > 0) {
        const activa = activaData[0];
        setMembresiaActiva(activa);
      }

      const historialData = await membresiaUsuarioService.getHistorialByUsuario(userId);
      setHistorial(historialData || []);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calcularDiasRestantes = (fechaFin) => {
    if (!fechaFin) return 0;
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const handleSeleccionarMembresia = (membresia) => {
    if (membresiaActiva) {
      setError('Ya tienes una membresía activa. No puedes seleccionar otra.');
      return;
    }
    navigate('/cliente/pagos', { 
      state: { 
        membresiaSeleccionada: membresia,
        monto: membresia.precio
      } 
    });
  };

  const handleRenovar = () => {
    navigate('/cliente/pagos');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white font-mono text-sm animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          Cargando membresías...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto px-4">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/cliente/dashboard')}
          className="p-2 rounded-xl border border-orange-500/20 hover:border-orange-500/40 text-[#9A9AA0] hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-orange-400" />
            Mis Membresías
          </h1>
          <p className="text-[#9A9AA0] text-xs font-mono">Visualiza tu plan actual y elige el tuyo</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* MEMBRESÍA ACTIVA */}
      {/* ============================================================ */}
      {membresiaActiva ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/20 via-orange-500/5 to-[#111625] p-5 shadow-[0_0_30px_rgba(255,107,53,0.05)]">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-500/5 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-[10px] font-mono uppercase tracking-wider font-bold">
                    Membresía Activa
                  </span>
                </div>
                <h2 className="text-2xl font-black text-white mt-0.5">
                  {membresiaActiva.membresia?.nombre || 'Plan'}
                </h2>
                <div className="mt-1">
                  <PaymentDisplay 
                    amountUSD={membresiaActiva.membresia?.precio || 0} 
                    title=""
                    className="bg-transparent p-0 border-0"
                  />
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-orange-400">
                  {calcularDiasRestantes(membresiaActiva.fechafin)}
                </span>
                <p className="text-[#9A9AA0] text-[10px] font-mono">días restantes</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-[#9A9AA0]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Vence: {formatearFecha(membresiaActiva.fechafin)}</span>
              </div>
              <button
                onClick={handleRenovar}
                className="px-5 py-2 bg-orange-500 text-[#0A0A0B] text-xs font-bold uppercase rounded-xl hover:bg-orange-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,107,53,0.2)]"
              >
                Renovar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-6 text-center">
          <div className="flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-orange-400/50 mb-3" />
            <h3 className="text-white font-bold text-lg">Sin membresía activa</h3>
            <p className="text-[#9A9AA0] text-sm font-mono mt-1">
              Selecciona un plan para empezar a entrenar
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PLANES DISPONIBLES */}
      {/* ============================================================ */}
      <div>
        <h3 className="text-white text-sm font-bold flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-orange-400" />
          Planes Disponibles
          <span className="text-[#9A9AA0] text-[8px] font-mono">Elige tu plan ideal</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {membresias.map((plan) => {
            const estaActivo = membresiaActiva?.membresia?.idmembresia === plan.idmembresia;
            const noPuedeSeleccionar = membresiaActiva && !estaActivo;

            return (
              <div
                key={plan.idmembresia}
                className={`bg-[#111625]/30 border rounded-2xl p-4 transition-all ${
                  estaActivo
                    ? 'border-orange-500/50 bg-orange-500/5'
                    : noPuedeSeleccionar
                    ? 'border-gray-500/20 opacity-60'
                    : 'border-orange-500/10 hover:border-orange-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-bold text-lg">{plan.nombre}</h4>
                    <p className="text-[#9A9AA0] text-xs font-mono mt-0.5">
                      {plan.duraciondias} días de duración
                    </p>
                  </div>
                  {estaActivo && (
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-[8px] font-mono rounded-full border border-orange-500/30">
                      Activo
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <PaymentDisplay 
                    amountUSD={plan.precio} 
                    title=""
                    className="bg-transparent p-0 border-0"
                  />
                </div>

                <div className="mt-4 flex items-center gap-2 text-[10px] font-mono text-[#9A9AA0]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{plan.duraciondias} días de acceso</span>
                </div>

                <button
                  onClick={() => handleSeleccionarMembresia(plan)}
                  disabled={noPuedeSeleccionar}
                  className={`mt-4 w-full py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                    estaActivo
                      ? 'bg-orange-500/20 text-orange-400 cursor-default'
                      : noPuedeSeleccionar
                      ? 'bg-gray-500/10 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 text-[#0A0A0B] hover:bg-orange-400 shadow-[0_0_20px_rgba(255,107,53,0.2)]'
                  }`}
                >
                  {estaActivo ? (
                    'Plan Actual'
                  ) : noPuedeSeleccionar ? (
                    'Ya tienes un plan activo'
                  ) : (
                    <>
                      Seleccionar <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* HISTORIAL DE MEMBRESÍAS */}
      {/* ============================================================ */}
      {historial.length > 0 && (
        <div className="bg-[#111625]/30 border border-orange-500/10 rounded-2xl p-4">
          <h3 className="text-white text-sm font-bold flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-400" />
            Historial de Membresías
            <span className="text-[#9A9AA0] text-[8px] font-mono">{historial.length} planes</span>
          </h3>

          <div className="space-y-2">
            {historial.slice(0, 5).map((item) => (
              <div key={item.idmembresiausuario} className="flex items-center justify-between p-3 rounded-xl bg-[#0A0A0B]/50 border border-orange-500/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Crown className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {item.membresia?.nombre || 'Membresía'}
                    </p>
                    <p className="text-[#9A9AA0] text-xs font-mono">
                      {formatearFecha(item.fechainicio)} - {formatearFecha(item.fechafin)}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold">
                    <PaymentDisplay 
                      amountUSD={item.membresia?.precio || 0} 
                      title=""
                      className="bg-transparent p-0 border-0"
                      showExchangeRate={false}
                    />
                  </p>
                  <span className={`text-[10px] font-mono ${item.estado === 'activo' ? 'text-green-400' : 'text-gray-400'}`}>
                    {item.estado === 'activo' ? 'Activo' : 'Completado'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MembresiasCliente;