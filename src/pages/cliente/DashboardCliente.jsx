// src/pages/cliente/DashboardCliente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  QrCode,
  CreditCard,
  User,
  Calendar,
  Clock,
  Target,
  Check,
  ArrowRight,
  AlertCircle,
  Shield,
  Flame,
  Award,
  ChevronRight,
  Trophy,
  Crown,
  Zap,
  Activity,
  BadgeCheck
} from 'lucide-react';
import authService from '../../services/authService';
import accesoService from '../../services/accesoService';
import entrenamientoService from '../../services/entrenamientoService';
import membresiaUsuarioService from '../../services/membresiaUsuarioService';
import pagoService from '../../services/pagoService';
import rutinaService from '../../services/rutinaService';
import CarnetModal from '../../components/CarnetModal';

// ============================================================
// IMÁGENES
// ============================================================
const IMAGENES = {
  hero1: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1920&q=80',
  hero2: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1920&q=80',
  hero3: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1920&q=80',
  hero4: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=1920&q=80',
  mujer1: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
  mujer2: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
  mujer3: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=800&q=80',
  mujer4: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&w=800&q=80',
  mujer5: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=800&q=80',
  mujer6: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  hombre1: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80',
  hombre2: 'https://images.unsplash.com/photo-1571731956672-f2b94d7c0f1d?auto=format&fit=crop&w=800&q=80',
  hombre3: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  hombre4: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
  fondo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=80'
};

const DashboardCliente = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [membresiaActiva, setMembresiaActiva] = useState(null);
  const [rutinaHoy, setRutinaHoy] = useState(null);
  const [entrenamientos, setEntrenamientos] = useState([]);
  const [accesos, setAccesos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [diasRestantes, setDiasRestantes] = useState(0);
  const [racha, setRacha] = useState(0);
  const [mejorRacha, setMejorRacha] = useState(0);
  const [showCarnet, setShowCarnet] = useState(false);
  const navigate = useNavigate();

  const imagenesHero = [
    IMAGENES.hero1, IMAGENES.hero2, IMAGENES.hero3, IMAGENES.hero4,
    IMAGENES.mujer1, IMAGENES.mujer2, IMAGENES.mujer3, IMAGENES.mujer4,
    IMAGENES.hombre1, IMAGENES.hombre2, IMAGENES.hombre3, IMAGENES.hombre4
  ];
  const imagenHeroRandom = imagenesHero[Math.floor(Math.random() * imagenesHero.length)];

  const frases = [
    "Los grandes no nacen, SE HACEN",
    "El dolor es temporal. La gloria es para siempre",
    "No es el peso lo que doblas. ERES TÚ",
    "El único mal entrenamiento es el que no hiciste",
    "¿Quieres resultados diferentes? ¡ENTRENA DIFERENTE!",
    "El cuerpo logra lo que la mente cree",
    "La disciplina pesa más que el hierro",
    "SÉ EL MEJOR. SIEMPRE.",
    "No pares. NO TE RINDAS.",
    "MASTERY. NO EXCUSES."
  ];

  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    loadDashboardData(currentUser.idusuario);
  }, [navigate]);

  // ============================================================
  // ✅ LOAD DASHBOARD DATA - CORREGIDO
  // ============================================================
  const loadDashboardData = async (userId) => {
    setLoading(true);
    setError('');

    try {
      // ============================================================
      // 1. MEMBRESÍA - CORREGIDO
      // ============================================================
      console.log('🔍 Buscando membresía para usuario:', userId);
      
      const membresiaData = await membresiaUsuarioService.getActivasByUsuario(userId);
      console.log('📋 Datos de membresía recibidos:', membresiaData);

      if (membresiaData && Array.isArray(membresiaData) && membresiaData.length > 0) {
        const activa = membresiaData[0];
        
        // ✅ Extraer correctamente los datos de la membresía
        const membresiaInfo = {
          ...activa,
          membresia: {
            nombre: activa.membresia_nombre || activa.membresia?.nombre || 'Membresía',
            precio: activa.membresia_precio || activa.membresia?.precio || 0,
            duracion: activa.membresia_duracion || activa.membresia?.duracionDias || 30
          }
        };
        
        setMembresiaActiva(membresiaInfo);
        
        // ✅ Calcular días restantes
        if (activa.fechafin) {
          const hoy = new Date();
          const fin = new Date(activa.fechafin);
          const diff = Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
          setDiasRestantes(diff > 0 ? diff : 0);
        } else {
          setDiasRestantes(0);
        }
      } else {
        console.log('⚠️ No se encontró membresía activa para el usuario:', userId);
        setMembresiaActiva(null);
        setDiasRestantes(0);
      }

      // ============================================================
      // 2. ENTRENAMIENTOS
      // ============================================================
      const entrenamientosData = await entrenamientoService.getByUsuario(userId);
      setEntrenamientos(entrenamientosData || []);

      // ============================================================
      // 3. ACCESOS
      // ============================================================
      const accesosData = await accesoService.getByUsuario(userId);
      setAccesos(accesosData || []);

      // ============================================================
      // 4. PAGOS
      // ============================================================
      const pagosData = await pagoService.getByUsuario(userId);
      setPagos(pagosData || []);

      // ============================================================
      // 5. RUTINA DE HOY
      // ============================================================
      try {
        const asignaciones = await rutinaService.getAsignaciones();
        if (asignaciones && asignaciones.length > 0) {
          const asignacionActiva = asignaciones.find(a => 
            a.idusuario === userId && a.activo === true
          );
          if (asignacionActiva) {
            const rutina = await rutinaService.getById(asignacionActiva.idrutina);
            const ejercicios = await rutinaService.getEjerciciosByRutina(rutina.idrutina);
            setRutinaHoy({
              ...rutina,
              ejercicios: ejercicios || []
            });
          }
        }
      } catch (err) {
        console.log('No hay rutina asignada aún');
      }

      // ============================================================
      // 6. RACHA
      // ============================================================
      if (accesosData && accesosData.length > 0) {
        const diasUnicos = new Set();
        accesosData.forEach(a => {
          const fecha = new Date(a.fechaentrada);
          const key = fecha.toISOString().split('T')[0];
          diasUnicos.add(key);
        });

        let rachaCount = 0;
        let maxRacha = 0;
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const diasOrdenados = Array.from(diasUnicos).sort();
        
        for (let i = diasOrdenados.length - 1; i >= 0; i--) {
          const fechaAcceso = new Date(diasOrdenados[i]);
          fechaAcceso.setHours(0, 0, 0, 0);
          const diffDias = Math.floor((hoy - fechaAcceso) / (1000 * 60 * 60 * 24));
          if (diffDias === rachaCount) {
            rachaCount++;
          } else if (diffDias > rachaCount) {
            break;
          }
        }
        setRacha(rachaCount);

        let tempRacha = 0;
        for (let i = 0; i < diasOrdenados.length; i++) {
          const fechaActual = new Date(diasOrdenados[i]);
          fechaActual.setHours(0, 0, 0, 0);
          if (i > 0) {
            const fechaAnterior = new Date(diasOrdenados[i - 1]);
            fechaAnterior.setHours(0, 0, 0, 0);
            const diff = Math.floor((fechaActual - fechaAnterior) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
              tempRacha++;
            } else {
              tempRacha = 1;
            }
          } else {
            tempRacha = 1;
          }
          if (tempRacha > maxRacha) {
            maxRacha = tempRacha;
          }
        }
        setMejorRacha(maxRacha);
      }

    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar algunos datos');
    } finally {
      setLoading(false);
    }
  };

  const getDiaSemana = () => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[new Date().getDay()];
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

  const totalEntrenamientos = entrenamientos?.length || 0;
  const metaEntrenamientos = 20;
  const porcentajeEntrenamientos = metaEntrenamientos > 0 
    ? Math.round((totalEntrenamientos / metaEntrenamientos) * 100) 
    : 0;

  const nombre = user?.nombre || 'Usuario';
  const apellido = user?.apellido || '';
  const fotoPerfil = user?.fotoperfil || null;

  const getRachaMensaje = () => {
    if (racha === 0) return "Comienza tu legado hoy";
    if (racha <= 2) return "El camino comienza";
    if (racha <= 5) return "No pares. Sigue";
    if (racha <= 10) return "Estás en llamas";
    if (racha > 10) return "Leyenda viva";
  };

  const getRachaColor = () => {
    if (racha === 0) return 'text-gray-400 border-gray-400/30';
    if (racha <= 2) return 'text-orange-400 border-orange-400/30';
    if (racha <= 5) return 'text-yellow-400 border-yellow-400/30';
    if (racha <= 10) return 'text-green-400 border-green-400/30';
    if (racha > 10) return 'text-purple-400 border-purple-400/30';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white font-mono text-sm animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          Cargando...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 max-w-4xl mx-auto px-3 sm:px-4">
      
      {error && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-xl text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* ============================================================ */}
      {/* HEADER HERO */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl p-6 min-h-[200px] flex items-end">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${imagenHeroRandom})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/30 to-transparent" />
        
        <div className="relative z-10 w-full">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-orange-500/30 text-orange-400 text-[10px] font-mono uppercase tracking-wider px-3 py-0.5 rounded-full border border-orange-500/20">
                  {getDiaSemana()}
                </span>
                <span className="text-[#9A9AA0] text-[10px] font-mono">
                  {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 leading-tight tracking-tight">
                {nombre} {apellido}
              </h1>
              <p className="text-orange-400 text-sm font-mono font-bold tracking-wider mt-0.5">
                {fraseAleatoria}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-[#9A9AA0] font-mono">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" /> {user?.rol || 'Atleta'}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#5C5C60]"></span>
                <span className="flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-orange-400" /> Activo
                </span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/cliente/perfil')}
              className="w-14 h-14 rounded-full border-2 border-orange-500/40 flex items-center justify-center text-orange-400 font-black text-2xl hover:border-orange-500/70 hover:scale-105 transition-all flex-shrink-0 shadow-[0_0_30px_rgba(255,107,53,0.1)] overflow-hidden bg-[#0A0A0B]/70"
            >
              {fotoPerfil ? (
                <img 
                  src={fotoPerfil} 
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                />
              ) : (
                nombre.charAt(0).toUpperCase()
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MEMBRESÍA - CORREGIDO */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-[#111625] p-5 shadow-[0_0_40px_rgba(255,107,53,0.05)]">
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-orange-500/5 blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-orange-500/5 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-[10px] font-mono uppercase tracking-wider font-bold">
                  Membresía Activa
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                {membresiaActiva?.membresia?.nombre || 'Sin membresía'}
              </h2>
              <p className="text-[#9A9AA0] text-sm font-mono">
                {membresiaActiva?.membresia?.precio ? `$${membresiaActiva.membresia.precio}/mes` : 'Pendiente de activación'}
              </p>
            </div>
            {diasRestantes > 0 && (
              <div className="text-right">
                <span className="text-3xl font-black text-orange-400">{diasRestantes}</span>
                <p className="text-[#9A9AA0] text-[10px] font-mono">días restantes</p>
              </div>
            )}
          </div>

          {diasRestantes > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] font-mono text-[#9A9AA0]">
                <span>Vence: {formatearFecha(membresiaActiva?.fechafin)}</span>
                <span>30 días</span>
              </div>
              <div className="w-full h-2 bg-[#1A1A2E] rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(255,107,53,0.3)]"
                  style={{ width: `${Math.min((diasRestantes / 30) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/cliente/pagos')}
            className="mt-4 px-5 py-2 bg-orange-500 text-[#0A0A0B] text-xs font-bold uppercase rounded-xl hover:bg-orange-400 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,107,53,0.2)] hover:shadow-[0_0_30px_rgba(255,107,53,0.3)]"
          >
            {diasRestantes > 0 ? 'Renovar Membresía' : 'Activar Membresía'} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STATS CIRCULARES */}
      {/* ============================================================ */}
      <div className="grid grid-cols-4 gap-2">
        <div className={`bg-[#111625]/50 backdrop-blur-md border rounded-2xl p-3 text-center group transition-all ${getRachaColor()}`}>
          <div className="relative w-14 h-14 mx-auto">
            <svg className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="#1A1A2E" strokeWidth="4" fill="none"/>
              <circle 
                cx="28" cy="28" r="24" 
                stroke={racha > 0 ? '#FF6B35' : '#1A1A2E'} 
                strokeWidth="4" 
                fill="none"
                strokeDasharray="150.8"
                strokeDashoffset={150.8 - (Math.min(racha, 7) / 7) * 150.8}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm">{racha}</span>
          </div>
          <p className="text-[#9A9AA0] text-[8px] font-mono mt-0.5 flex items-center justify-center gap-0.5">
            <Flame className="w-3 h-3 text-orange-400" /> Racha
          </p>
          <p className={`text-[8px] font-mono font-bold ${racha > 0 ? 'text-orange-400' : 'text-gray-400'} truncate`}>
            {getRachaMensaje()}
          </p>
        </div>

        <div className="bg-[#111625]/50 backdrop-blur-md border border-[#00F2FE]/10 rounded-2xl p-3 text-center group hover:border-[#00F2FE]/30 transition-all">
          <div className="relative w-14 h-14 mx-auto">
            <svg className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="#1A1A2E" strokeWidth="4" fill="none"/>
              <circle 
                cx="28" cy="28" r="24" 
                stroke="#00F2FE" 
                strokeWidth="4" 
                fill="none"
                strokeDasharray="150.8"
                strokeDashoffset={150.8 - (porcentajeEntrenamientos / 100) * 150.8}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm">{totalEntrenamientos}</span>
          </div>
          <p className="text-[#9A9AA0] text-[8px] font-mono mt-0.5 flex items-center justify-center gap-0.5">
            <Dumbbell className="w-3 h-3 text-[#00F2FE]" /> Entrenos
          </p>
        </div>

        <div className="bg-[#111625]/50 backdrop-blur-md border border-yellow-400/10 rounded-2xl p-3 text-center group hover:border-yellow-400/30 transition-all">
          <div className="relative w-14 h-14 mx-auto">
            <svg className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="24" stroke="#1A1A2E" strokeWidth="4" fill="none"/>
              <circle 
                cx="28" cy="28" r="24" 
                stroke="#FFD700" 
                strokeWidth="4" 
                fill="none"
                strokeDasharray="150.8"
                strokeDashoffset={150.8 - (Math.min(porcentajeEntrenamientos, 100) / 100) * 150.8}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white font-black text-sm">
              {Math.min(porcentajeEntrenamientos, 100)}%
            </span>
          </div>
          <p className="text-[#9A9AA0] text-[8px] font-mono mt-0.5 flex items-center justify-center gap-0.5">
            <Target className="w-3 h-3 text-yellow-400" /> Meta
          </p>
        </div>

        <div className="bg-[#111625]/50 backdrop-blur-md border border-purple-400/10 rounded-2xl p-3 text-center group hover:border-purple-400/30 transition-all">
          <div className="relative w-14 h-14 mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <p className="text-[#9A9AA0] text-[8px] font-mono mt-0.5 flex items-center justify-center gap-0.5">
            <Crown className="w-3 h-3 text-purple-400" /> Récord
          </p>
          <p className="text-white font-black text-sm">{mejorRacha} días</p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* RUTINA DE HOY */}
      {/* ============================================================ */}
      {rutinaHoy && rutinaHoy.ejercicios && rutinaHoy.ejercicios.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-orange-400/10 bg-[#111625]/30 p-4">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-5"
            style={{ backgroundImage: `url(${IMAGENES.fondo})` }}
          />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                <h3 className="text-white text-sm font-bold">Entrenamiento de Hoy</h3>
                <span className="bg-orange-400/20 text-orange-400 text-[8px] px-2 py-0.5 rounded-full font-mono">{rutinaHoy.ejercicios.length} ejercicios</span>
              </div>
              <button 
                onClick={() => navigate('/cliente/rutinas')}
                className="text-orange-400 text-xs font-mono hover:underline flex items-center gap-1"
              >
                Ver todo <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-2">
              {rutinaHoy.ejercicios.slice(0, 3).map((ej, index) => {
                const imagenesEjercicio = [
                  IMAGENES.mujer1, IMAGENES.mujer2, IMAGENES.mujer3, 
                  IMAGENES.hombre1, IMAGENES.hombre2, IMAGENES.hombre3,
                  IMAGENES.mujer4, IMAGENES.mujer5, IMAGENES.mujer6,
                  IMAGENES.hombre4
                ];
                const imagenRandom = imagenesEjercicio[Math.floor(Math.random() * imagenesEjercicio.length)];
                const progreso = Math.min((index + 1) / 3 * 100, 100);
                
                return (
                  <div key={index} className="flex items-center gap-3 p-2 rounded-xl bg-[#0A0A0B]/60 border border-orange-400/5 hover:border-orange-400/20 transition-all group">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-orange-400/20 group-hover:border-orange-400/50 transition-all">
                      <img src={imagenRandom} alt="Ejercicio" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {ej.ejercicio?.nombre || 'Ejercicio'}
                      </p>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#9A9AA0]">
                        <span>{ej.series} series</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-[#5C5C60]"></span>
                        <span>{ej.repeticiones} reps</span>
                        {ej.pesosugerido > 0 && (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-[#5C5C60]"></span>
                            <span>{ej.pesosugerido} kg</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="w-16 h-1.5 bg-[#1A1A2E] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-1000"
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                      <span className="text-[#9A9AA0] text-[8px] font-mono">{Math.round(progreso)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {rutinaHoy.ejercicios.length > 3 && (
              <p className="text-[#9A9AA0] text-[10px] font-mono text-center mt-2">
                +{rutinaHoy.ejercicios.length - 3} ejercicios más
              </p>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ACCESO RÁPIDO */}
      {/* ============================================================ */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => navigate('/cliente/qr')}
          className="relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-[#00F2FE]/10 to-[#00F2FE]/5 border border-[#00F2FE]/20 hover:border-[#00F2FE]/50 transition-all group text-center"
        >
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-[#00F2FE]/5 blur-xl"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-[#00F2FE]/20 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5 text-[#00F2FE]" />
            </div>
            <span className="block text-[9px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">QR</span>
          </div>
        </button>
        
        <button
          onClick={() => navigate('/cliente/rutinas')}
          className="relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-orange-400/10 to-orange-400/5 border border-orange-400/20 hover:border-orange-400/50 transition-all group text-center"
        >
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-orange-400/5 blur-xl"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-orange-400/20 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-5 h-5 text-orange-400" />
            </div>
            <span className="block text-[9px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">Rutina</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/cliente/pagos')}
          className="relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border border-yellow-400/20 hover:border-yellow-400/50 transition-all group text-center"
        >
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-yellow-400/5 blur-xl"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-yellow-400/20 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5 text-yellow-400" />
            </div>
            <span className="block text-[9px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">Pagos</span>
          </div>
        </button>

        <button
          onClick={() => setShowCarnet(true)}
          className="relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-purple-400/10 to-purple-400/5 border border-purple-400/20 hover:border-purple-400/50 transition-all group text-center"
        >
          <div className="absolute -top-8 -right-8 w-16 h-16 rounded-full bg-purple-400/5 blur-xl"></div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-full bg-purple-400/20 flex items-center justify-center mx-auto mb-1 group-hover:scale-110 transition-transform">
              <BadgeCheck className="w-5 h-5 text-purple-400" />
            </div>
            <span className="block text-[9px] font-mono text-[#9A9AA0] group-hover:text-white transition-colors">Carnet</span>
          </div>
        </button>
      </div>

      {/* ============================================================ */}
      {/* ÚLTIMOS ACCESOS */}
      {/* ============================================================ */}
      {accesos && accesos.length > 0 && (
        <div className="bg-[#111625]/30 border border-orange-400/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              Últimos Accesos
            </h3>
            <span className="text-[#9A9AA0] text-[10px] font-mono">{accesos.length} total</span>
          </div>
          <div className="space-y-1.5">
            {accesos.slice(0, 3).map((acceso, index) => {
              const imagenesAcceso = [IMAGENES.mujer1, IMAGENES.mujer2, IMAGENES.hombre1, IMAGENES.hombre2];
              const imgAcceso = imagenesAcceso[Math.floor(Math.random() * imagenesAcceso.length)];
              
              return (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-[#0A0A0B]/50 border border-orange-400/5">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-orange-400/20">
                    <img src={imgAcceso} alt="Perfil" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {new Date(acceso.fechaentrada).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[#9A9AA0] text-xs font-mono">
                      {new Date(acceso.fechaentrada).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!acceso.fechasalida && (
                      <span className="text-green-400 text-[10px] font-mono flex items-center gap-0.5">
                        <Activity className="w-3 h-3" /> Dentro
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL CARNET */}
      {/* ============================================================ */}
      <CarnetModal
        isOpen={showCarnet}
        onClose={() => setShowCarnet(false)}
        user={user}
        gymName="GYM FITNESS"
      />
    </div>
  );
};

export default DashboardCliente;