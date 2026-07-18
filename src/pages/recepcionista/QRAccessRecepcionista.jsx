// src/pages/recepcionista/QRAccessRecepcionista.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import QrScanner from 'qr-scanner';
import {
  QrCode,
  Camera,
  User,
  CheckCircle,
  XCircle,
  DoorOpen,
  DoorClosed,
  Search,
  AlertCircle,
  X,
  Shield,
  Calendar,
  Clock,
  UserCheck
} from 'lucide-react';
import authService from '../../services/authService';
import qrService from '../../services/qrService';
import accesoService from '../../services/accesoService';
import userService from '../../services/userService';
import membresiaUsuarioService from '../../services/membresiaUsuarioService';

const QRAccessRecepcionista = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);
  const [qrData, setQrData] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [dentroAhora, setDentroAhora] = useState([]);
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 2) {
      navigate('/dashboard');
      return;
    }
    setUser(currentUser);
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const usuariosData = await userService.getAll();
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      
      const accesosData = await accesoService.getAll();
      const dentro = accesosData.filter(a => !a.fechasalida);
      setDentroAhora(dentro);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  // Procesar QR escaneado
  const handleScan = async (result) => {
    if (!result) return;
    
    setScannerActive(false);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const qrCode = result.data || result;
      console.log('📱 QR escaneado:', qrCode);
      
      // Buscar el QR en la base de datos
      const qrResponse = await qrService.getByCode(qrCode);
      console.log('📋 Respuesta QR:', qrResponse);
      
      if (!qrResponse) {
        setError('QR no válido o no registrado');
        setScannerActive(true);
        setLoading(false);
        return;
      }

      // Obtener datos del cliente
      const clienteData = await userService.getById(qrResponse.idusuario);
      setCliente(clienteData);
      setQrData(qrCode);
      
      // Verificar si ya está dentro
      const yaDentro = dentroAhora.some(a => a.idusuario === clienteData.idusuario);
      
      setSuccess(`Cliente identificado: ${clienteData.nombre} ${clienteData.apellido}`);
      
    } catch (err) {
      console.error('❌ Error al procesar QR:', err);
      setError('Error al procesar el código QR');
    } finally {
      setLoading(false);
      // Reactivar scanner después de 3 segundos
      setTimeout(() => setScannerActive(true), 3000);
    }
  };

  // Registrar entrada
  const handleEntrada = async () => {
    if (!cliente) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await accesoService.create({
        idusuario: cliente.idusuario,
        fechaentrada: new Date().toISOString()
      });
      
      setSuccess(`✅ Entrada registrada: ${cliente.nombre} ${cliente.apellido}`);
      setDentroAhora([...dentroAhora, { idusuario: cliente.idusuario }]);
      
      // Limpiar después de 3 segundos
      setTimeout(() => {
        setCliente(null);
        setQrData(null);
        setScannerActive(true);
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar entrada');
    } finally {
      setLoading(false);
    }
  };

  // Registrar salida
  const handleSalida = async () => {
    if (!cliente) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Buscar acceso activo (sin salida)
      const accesoActivo = dentroAhora.find(a => a.idusuario === cliente.idusuario);
      if (!accesoActivo) {
        setError('Este cliente no tiene entrada registrada');
        setLoading(false);
        return;
      }

      await accesoService.update(accesoActivo.idacceso, {
        fechasalida: new Date().toISOString()
      });
      
      setSuccess(`✅ Salida registrada: ${cliente.nombre} ${cliente.apellido}`);
      setDentroAhora(dentroAhora.filter(a => a.idusuario !== cliente.idusuario));
      
      setTimeout(() => {
        setCliente(null);
        setQrData(null);
        setScannerActive(true);
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar salida');
    } finally {
      setLoading(false);
    }
  };

  // Buscar cliente manualmente
  const handleBuscarCliente = async () => {
    if (!searchTerm.trim()) {
      setError('Ingresa un nombre para buscar');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const encontrado = usuarios.find(u => 
        u.idrol === 3 &&
        `${u.nombre} ${u.apellido}`.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (encontrado) {
        setCliente(encontrado);
        setSuccess(`Cliente encontrado: ${encontrado.nombre} ${encontrado.apellido}`);
      } else {
        setError('No se encontró ningún cliente con ese nombre');
      }
    } catch (err) {
      setError('Error al buscar cliente');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setCliente(null);
    setQrData(null);
    setError('');
    setSuccess('');
    setScannerActive(true);
    setSearchTerm('');
  };

  return (
    <div className="w-full space-y-4 pb-20">
      
      {/* HEADER */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-[#00F2FE]/10 via-[#111625]/50 to-[#111625] border border-[#00F2FE]/20">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <QrCode className="w-7 h-7 text-[#00F2FE]" />
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Validar QR</h1>
              <p className="text-[#9A9AA0] text-xs font-mono">Escanea el QR del cliente para registrar entrada/salida</p>
            </div>
          </div>
          <button
            onClick={resetScanner}
            className="px-4 py-2 bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 rounded-xl text-sm font-medium hover:bg-[#00F2FE]/20 transition-all"
          >
            Reiniciar
          </button>
        </div>
      </div>

      {/* MENSAJES */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
          <button onClick={() => setError('')} className="ml-auto">
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

      {/* CÁMARA - Solo visible si no hay cliente identificado */}
      {!cliente && (
        <div className="bg-[#111625]/30 border border-[#00F2FE]/10 rounded-2xl overflow-hidden">
          <div className="relative">
            {scannerActive ? (
              <Webcam
                ref={webcamRef}
                className="w-full h-64 md:h-96 object-cover"
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: 'environment'
                }}
              />
            ) : (
              <div className="w-full h-64 md:h-96 bg-[#0A0A0B] flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-[#00F2FE]/30 mx-auto mb-2" />
                  <p className="text-[#9A9AA0] text-sm font-mono">Cámara pausada</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-[#00F2FE]/50 rounded-xl animate-pulse"></div>
            </div>
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#00F2FE]/20 border-t-[#00F2FE] rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <div className="p-4 text-center border-t border-[#00F2FE]/5">
            <p className="text-[#9A9AA0] text-sm font-mono">
              <Camera className="w-4 h-4 inline mr-2" />
              Enfoca el código QR del cliente
            </p>
          </div>
        </div>
      )}

      {/* BUSCAR CLIENTE MANUAL */}
      {!cliente && (
        <div className="bg-[#111625]/30 border border-[#00F2FE]/10 rounded-2xl p-4">
          <p className="text-[#9A9AA0] text-xs font-mono mb-2 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" />
            O buscar cliente manualmente
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre del cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-[#0A0A0B] border border-[#00F2FE]/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#00F2FE]/40 transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleBuscarCliente()}
            />
            <button
              onClick={handleBuscarCliente}
              className="px-4 py-2 bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 rounded-xl hover:bg-[#00F2FE]/20 transition-all"
            >
              Buscar
            </button>
          </div>
        </div>
      )}

      {/* INFO DEL CLIENTE - Cuando se identifica */}
      {cliente && (
        <div className="bg-[#111625]/30 border border-[#00F2FE]/20 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#00F2FE]/10 border-2 border-[#00F2FE]/30 flex items-center justify-center text-2xl font-bold text-[#00F2FE] overflow-hidden flex-shrink-0">
              {cliente.fotoperfil ? (
                <img src={cliente.fotoperfil} alt={cliente.nombre} className="w-full h-full object-cover" />
              ) : (
                cliente.nombre?.charAt(0) || 'C'
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-lg">{cliente.nombre} {cliente.apellido}</p>
              <p className="text-[#9A9AA0] text-xs font-mono">@{cliente.usuario}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">
                  Cliente
                </span>
                {dentroAhora.some(a => a.idusuario === cliente.idusuario) ? (
                  <span className="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20 flex items-center gap-0.5">
                    <DoorOpen className="w-3 h-3" /> Dentro
                  </span>
                ) : (
                  <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 flex items-center gap-0.5">
                    <DoorClosed className="w-3 h-3" /> Fuera
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleEntrada}
              disabled={loading || dentroAhora.some(a => a.idusuario === cliente.idusuario)}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                dentroAhora.some(a => a.idusuario === cliente.idusuario)
                  ? 'bg-[#0A0A0B] border border-[#5C5C60] text-[#5C5C60] cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              Registrar Entrada
            </button>
            <button
              onClick={handleSalida}
              disabled={loading || !dentroAhora.some(a => a.idusuario === cliente.idusuario)}
              className={`flex-1 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                !dentroAhora.some(a => a.idusuario === cliente.idusuario)
                  ? 'bg-[#0A0A0B] border border-[#5C5C60] text-[#5C5C60] cursor-not-allowed'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              <DoorClosed className="w-4 h-4" />
              Registrar Salida
            </button>
          </div>
        </div>
      )}

      {/* ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#111625]/30 border border-[#00F2FE]/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">Clientes dentro</p>
          <p className="text-2xl font-bold text-[#00F2FE]">{dentroAhora.length}</p>
        </div>
        <div className="bg-[#111625]/30 border border-[#00F2FE]/10 rounded-2xl p-3 text-center">
          <p className="text-[#9A9AA0] text-[10px] font-mono uppercase">QR Válidos</p>
          <p className="text-2xl font-bold text-green-400">{usuarios.filter(u => u.idrol === 3).length}</p>
        </div>
      </div>
    </div>
  );
};

export default QRAccessRecepcionista;