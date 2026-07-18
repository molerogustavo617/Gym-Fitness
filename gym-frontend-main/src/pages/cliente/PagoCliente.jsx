// src/pages/cliente/PagoCliente.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

// Iconos
import {
  CreditCard,
  Zap,
  Shield,
  ArrowLeft,
  CheckCircle,
  Wallet,
  Smartphone,
  Landmark,
  Calendar,
  Lock,
  User,
  Mail,
  Star
} from 'lucide-react';

const PagoCliente = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser() || { nombre: 'Usuario', email: 'usuario@email.com' };
  
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [loading, setLoading] = useState(false);
  const [pagoExitoso, setPagoExitoso] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user.nombre || '',
    email: user.email || '',
    telefono: '',
    numeroTarjeta: '',
    fechaExpiracion: '',
    cvv: ''
  });

  // ============================================================
  // SOLO UN PLAN: GYM FITNESS - $20
  // ============================================================
  const plan = {
    id: 'basico',
    nombre: 'GYM FITNESS',
    precio: 20,
    descripcion: 'Acceso completo al gimnasio',
    beneficios: [
      'Acceso 24/7 a todas las áreas',
      'Clases grupales ilimitadas',
      '1 sesión con entrenador al mes',
      'Seguimiento de progreso',
      'App móvil incluida',
      'Acceso a zona de peso libre',
      'Máquinas guiadas',
      'Casillero incluido'
    ],
    color: '#00F2FE',
    icon: Zap,
    popular: true
  };

  const metodosPago = [
    { id: 'tarjeta', nombre: 'Tarjeta de Crédito/Débito', icon: CreditCard },
    { id: 'paypal', nombre: 'PayPal', icon: Wallet },
    { id: 'transferencia', nombre: 'Transferencia Bancaria', icon: Landmark },
    { id: 'pago_movil', nombre: 'Pago Móvil', icon: Smartphone }
  ];

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handlePago = (e) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setPagoExitoso(true);
      
      const historial = JSON.parse(localStorage.getItem('gym_historial_pagos') || '[]');
      historial.push({
        id: Date.now(),
        plan: plan.nombre,
        monto: plan.precio,
        fecha: new Date().toISOString(),
        metodo: metodoPago,
        usuario: formData.nombre,
        email: formData.email,
        estado: 'completado'
      });
      localStorage.setItem('gym_historial_pagos', JSON.stringify(historial));
      
      setTimeout(() => {
        setPagoExitoso(false);
        navigate('/cliente/dashboard');
      }, 3000);
    }, 2000);
  };

  if (pagoExitoso) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="card border-[#00F2FE]/30 bg-[#111625]/40 backdrop-blur-md p-10 rounded-3xl text-center w-full shadow-[0_0_60px_rgba(0,242,254,0.1)]">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">¡Pago Exitoso!</h2>
          <p className="text-[#9A9AA0] font-mono text-sm">
            Tu plan <span className="text-[#00F2FE]">{plan.nombre}</span> ha sido activado correctamente.
          </p>
          <p className="text-[#5C5C60] text-xs font-mono mt-2">
            Redirigiendo al dashboard...
          </p>
          <div className="w-full h-1 bg-[#1A1A2E] rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00F2FE] to-[#66F5FE] animate-pulse w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/cliente/dashboard')}
          className="p-2 rounded-xl border border-[#00F2FE]/10 hover:border-[#00F2FE]/30 text-[#9A9AA0] hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <CreditCard className="w-7 h-7 text-[#00F2FE]" />
            Pasarela de Pago
          </h1>
          <p className="text-[#9A9AA0] text-xs font-mono">
            Plan GYM FITNESS - $20/mes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ============================================================ */}
        {/* COLUMNA IZQUIERDA (2/3) */}
        {/* ============================================================ */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PLAN ÚNICO DESTACADO */}
          <div className="card border-[#00F2FE]/30 bg-[#00F2FE]/10 backdrop-blur-md p-6 rounded-2xl shadow-[0_0_40px_rgba(0,242,254,0.1)]">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <plan.icon className="w-6 h-6 text-[#00F2FE]" />
                  <h2 className="text-white font-bold text-xl">{plan.nombre}</h2>
                  <span className="text-[10px] font-mono uppercase bg-[#00F2FE] text-[#0A0A0B] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" /> Único
                  </span>
                </div>
                <p className="text-[#9A9AA0] text-sm font-mono mt-1">{plan.descripcion}</p>
                <div className="mt-3">
                  <span className="text-white text-3xl font-black">${plan.precio}</span>
                  <span className="text-[#9A9AA0] text-sm font-mono ml-1">/mes</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#00F2FE]/20 border border-[#00F2FE]/30 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#00F2FE]" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              {plan.beneficios.map((beneficio, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[#C9C9CC]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#00F2FE]" />
                  {beneficio}
                </div>
              ))}
            </div>
          </div>

          {/* MÉTODOS DE PAGO */}
          <div className="card border-[#00F2FE]/10 bg-[#111625]/30 backdrop-blur-md p-6 rounded-2xl">
            <h2 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-[#00F2FE]" />
              Método de Pago
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {metodosPago.map((metodo) => (
                <button
                  key={metodo.id}
                  onClick={() => setMetodoPago(metodo.id)}
                  className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                    metodoPago === metodo.id
                      ? 'border-[#00F2FE]/40 bg-[#00F2FE]/10'
                      : 'border-[#00F2FE]/10 hover:border-[#00F2FE]/30 bg-[#0A0A0B]/50'
                  }`}
                >
                  <metodo.icon 
                    className={`w-6 h-6 ${
                      metodoPago === metodo.id ? 'text-[#00F2FE]' : 'text-[#9A9AA0]'
                    }`}
                  />
                  <span className={`text-[10px] font-mono ${
                    metodoPago === metodo.id ? 'text-white' : 'text-[#9A9AA0]'
                  }`}>
                    {metodo.nombre}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* FORMULARIO DE TARJETA */}
          {metodoPago === 'tarjeta' && (
            <div className="card border-[#00F2FE]/10 bg-[#111625]/30 backdrop-blur-md p-6 rounded-2xl">
              <h2 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-[#00F2FE]" />
                Datos de la Tarjeta
              </h2>
              
              <form onSubmit={handlePago} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-[#9A9AA0] uppercase tracking-wider block mb-1.5">
                      <User className="w-3 h-3 inline mr-1" />
                      Nombre del Titular
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      placeholder="Nombre completo"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      className="w-full bg-[#0A0A0B] border border-[#232326] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F2FE] focus:shadow-[0_0_20px_rgba(0,242,254,0.1)] transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#9A9AA0] uppercase tracking-wider block mb-1.5">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Correo Electrónico
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#0A0A0B] border border-[#232326] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F2FE] focus:shadow-[0_0_20px_rgba(0,242,254,0.1)] transition-all"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-mono text-[#9A9AA0] uppercase tracking-wider block mb-1.5">
                    <CreditCard className="w-3 h-3 inline mr-1" />
                    Número de Tarjeta
                  </label>
                  <input
                    id="numeroTarjeta"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={formData.numeroTarjeta}
                    onChange={handleInputChange}
                    className="w-full bg-[#0A0A0B] border border-[#232326] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F2FE] focus:shadow-[0_0_20px_rgba(0,242,254,0.1)] transition-all font-mono tracking-wider"
                    maxLength="19"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-[#9A9AA0] uppercase tracking-wider block mb-1.5">
                      <Calendar className="w-3 h-3 inline mr-1" />
                      Fecha Expiración
                    </label>
                    <input
                      id="fechaExpiracion"
                      type="text"
                      placeholder="MM/AA"
                      value={formData.fechaExpiracion}
                      onChange={handleInputChange}
                      className="w-full bg-[#0A0A0B] border border-[#232326] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F2FE] focus:shadow-[0_0_20px_rgba(0,242,254,0.1)] transition-all font-mono"
                      maxLength="5"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#9A9AA0] uppercase tracking-wider block mb-1.5">
                      <Lock className="w-3 h-3 inline mr-1" />
                      CVV
                    </label>
                    <input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="w-full bg-[#0A0A0B] border border-[#232326] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00F2FE] focus:shadow-[0_0_20px_rgba(0,242,254,0.1)] transition-all font-mono"
                      maxLength="4"
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {metodoPago !== 'tarjeta' && (
            <div className="card border-[#00F2FE]/10 bg-[#111625]/30 backdrop-blur-md p-6 rounded-2xl">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#00F2FE]/5 border border-[#00F2FE]/10">
                <Shield className="w-6 h-6 text-[#00F2FE]" />
                <div>
                  <p className="text-white text-sm font-bold">Pago con {metodosPago.find(m => m.id === metodoPago)?.nombre}</p>
                  <p className="text-[#9A9AA0] text-xs font-mono">
                    Serás redirigido a la plataforma de pago para completar la transacción.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* COLUMNA DERECHA: RESUMEN (1/3) */}
        {/* ============================================================ */}
        <div className="space-y-6">
          <div className="card border-[#00F2FE]/20 bg-[#111625]/40 backdrop-blur-md p-6 rounded-2xl sticky top-6 shadow-[0_0_30px_rgba(0,242,254,0.05)]">
            
            <h2 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[#00F2FE]" />
              Resumen del Pago
            </h2>
            
            <div className="border-b border-[#00F2FE]/10 pb-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Plan</p>
                  <p className="text-white font-bold">{plan.nombre}</p>
                </div>
                <plan.icon className="w-5 h-5 text-[#00F2FE]" />
              </div>
              <p className="text-[#9A9AA0] text-[10px] font-mono mt-1">{plan.descripcion}</p>
            </div>
            
            <div className="space-y-1.5 mb-4">
              <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Beneficios incluidos</p>
              {plan.beneficios.slice(0, 5).map((beneficio, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-[#C9C9CC]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#00F2FE]" />
                  {beneficio}
                </div>
              ))}
              <span className="text-[10px] font-mono text-[#5C5C60]">+ {plan.beneficios.length - 5} más</span>
            </div>
            
            <div className="border-t border-[#00F2FE]/10 pt-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[#9A9AA0] text-[10px] font-mono uppercase">Método de pago</span>
                <span className="text-white text-xs font-mono flex items-center gap-1.5">
                  {metodosPago.find(m => m.id === metodoPago)?.nombre}
                </span>
              </div>
            </div>
            
            <div className="border-t border-[#00F2FE]/10 pt-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-[#9A9AA0] text-sm font-mono uppercase">Total</span>
                <span className="text-white text-2xl font-black">${plan.precio}</span>
              </div>
              <p className="text-[#00F2FE] text-[10px] font-mono mt-1 text-right">
                Pago mensual sin compromiso
              </p>
            </div>
            
            <button
              onClick={handlePago}
              disabled={loading}
              className="w-full py-4 bg-[#00F2FE] text-[#0A0A0B] font-mono text-sm uppercase tracking-wider rounded-xl hover:bg-[#00D4E0] transition-all shadow-[0_0_30px_rgba(0,242,254,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Pagar ${plan.precio}
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 mt-3 text-[10px] font-mono text-[#5C5C60]">
              <Shield className="w-3 h-3" />
              <span>Pago seguro con encriptación SSL</span>
            </div>
          </div>
          
          <div className="card border-[#00F2FE]/10 bg-[#111625]/30 backdrop-blur-md p-4 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-[#9A9AA0] uppercase tracking-wider">Últimos pagos</span>
              <span className="text-[10px] font-mono text-[#00F2FE]">Ver historial</span>
            </div>
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0A0A0B]/50 border border-[#00F2FE]/5">
                <div>
                  <p className="text-[10px] font-mono text-[#9A9AA0]">GYM FITNESS</p>
                  <p className="text-[8px] font-mono text-[#5C5C60]">15/06/2026</p>
                </div>
                <span className="text-[10px] font-mono text-green-400">$20</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#0A0A0B]/50 border border-[#00F2FE]/5">
                <div>
                  <p className="text-[10px] font-mono text-[#9A9AA0]">GYM FITNESS</p>
                  <p className="text-[8px] font-mono text-[#5C5C60]">15/05/2026</p>
                </div>
                <span className="text-[10px] font-mono text-green-400">$20</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagoCliente;