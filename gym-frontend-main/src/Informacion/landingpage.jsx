import { useState, useEffect, useRef } from "react";
import {Dumbbell, Flame, HeartPulse, Users, Clock, MapPin,Phone,Mail, Menu, X, ChevronRight, CheckCircle2, Activity, Timer, Zap, Sparkles, MessageCircle, ArrowRight, Star, User,
  Calendar, Award, Play, Quote,ChevronLeft
} from "lucide-react";

// ---- IMÁGENES (Unsplash - Deportes y Fitness) ----
const IMG_HERO = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80"; // Hombre levantando pesas
const IMG_HERO_2 = "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=80"; // Mujer haciendo ejercicio
const IMG_SQUAT = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1920&q=80"; // Sentadilla
const IMG_GROUP = "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=1920&q=80"; // Clase grupal
const IMG_RACK = "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1920&q=80"; // Pesas rusas
const IMG_ENTRENADOR = "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80"; // Entrenador
const IMG_ENTRENADORA = "https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&w=800&q=80"; // Entrenadora
const IMG_CLIENTE = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80"; // Cliente

// ---- DATOS ----
const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#programas", label: "Programas" },
  { href: "#entrenadores", label: "Equipo" },
  { href: "#planes", label: "Planes" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#contacto", label: "Contacto" },
];

const SERVICIOS = [
  { icon: Dumbbell, color: "lime", title: "Sala de Musculación", desc: "Equipo de fuerza renovado, zona de peso libre y máquinas guiadas para todos los niveles." },
  { icon: Flame, color: "ember", title: "Clases Grupales", desc: "HIIT, funcional y cardio en sesiones de 45 minutos, todos los días de la semana." },
  { icon: HeartPulse, color: "violet", title: "Seguimiento Personalizado", desc: "Tu entrenador registra tu rutina y tu evolución, y la consultas desde tu cuenta." },
  { icon: Users, color: "pink", title: "Entrenamiento con Coach", desc: "Sesiones uno a uno o en grupos reducidos, con plan ajustado a tu objetivo." },
];

const PROGRAMAS = [
  { n: "01", title: "Fuerza", detail: "Ganancia de masa muscular con progresión de carga controlada.", color: "lime" },
  { n: "02", title: "Pérdida de Grasa", detail: "Combinación de fuerza y cardio metabólico de alta densidad.", color: "ember" },
  { n: "03", title: "Movilidad", detail: "Trabajo articular y de control motor para entrenar sin dolor.", color: "violet" },
  { n: "04", title: "Rendimiento", detail: "Preparación física para deporte y exigencia competitiva.", color: "pink" },
];

const ENTRENADORES = [
  { name: "CHRISTOPHER MEDINA", spec: "Fuerza y Powerlifting", tag: "CM", color: "lime", img: IMG_ENTRENADOR },
  { name: "HANDRY PEROZO", spec: "Funcional y HIIT", tag: "HP", color: "ember", img: IMG_ENTRENADOR },
  { name: "DANIEL GUERRA", spec: "Movilidad y Rehab", tag: "DG", color: "violet", img: IMG_ENTRENADORA },
  { name: "GUSTAVO MOLERO", spec: "Cardio y Resistencia", tag: "GM", color: "pink", img: IMG_ENTRENADOR },
];

const PLANES = [
  {
    name: "Básico",
    price: "20",
    period: "/mes",
    items: ["Acceso a sala de musculación", "Horario completo", "Casillero incluido"],
    color: "violet",
    grad: "linear-gradient(160deg, rgba(139,92,246,0.18), rgba(10,10,11,0.4))",
    icon: User,
  },
  {
    name: "Full Training",
    price: "35",
    period: "/mes",
    items: ["Todo lo del plan Básico", "Clases grupales ilimitadas", "Plan de entrenamiento con coach", "Seguimiento de evolución"],
    color: "lime",
    grad: "linear-gradient(160deg, rgba(215,255,61,0.22), rgba(10,10,11,0.4))",
    highlight: true,
    icon: Zap,
  },
  {
    name: "Elite",
    price: "55",
    period: "/mes",
    items: ["Todo lo del Full Training", "Sesiones 1 a 1 con entrenador", "Plan de alimentación", "Acceso prioritario a clases"],
    color: "ember",
    grad: "linear-gradient(160deg, rgba(255,90,54,0.2), rgba(10,10,11,0.4))",
    icon: Award,
  },
];

const TESTIMONIOS = [
  {
    name: "María González",
    quote: "Desde que entré a GYM-FITNESS, mi vida cambió. No solo he visto resultados increíbles, sino que encontré una comunidad que me motiva cada día.",
    role: "Miembro desde 2022",
    img: IMG_CLIENTE,
    rating: 5,
  },
  {
    name: "Carlos Rodríguez",
    quote: "El seguimiento personalizado y los entrenadores son de primer nivel. He logrado metas que nunca pensé posibles.",
    role: "Miembro desde 2023",
    img: IMG_CLIENTE,
    rating: 5,
  },
];

// FORMULARIO
const WHATSAPP_NUMBER = "584246773874"; 

// Función para enviar a WhatsApp
const handleSubmitWhatsApp = (e) => {
  e.preventDefault();
  
  // Obtener datos del formulario por ID
  const nombre = document.getElementById('nombre').value;
  const email = document.getElementById('email').value;
  const telefono = document.getElementById('telefono').value;
  const mensaje = document.getElementById('mensaje').value;
  
  // Validar campos obligatorios
  if (!nombre || !email) {
    mostrarEstado('Por favor completa nombre y correo', 'error');
    return;
  }
  
  
  const mensajeWhatsApp = ` GYM-FITNESS

Nombre: ${nombre}
Email: ${email}
Telefono: ${telefono || 'No especificado'}
Mensaje: ${mensaje || 'Sin mensaje adicional'}`;

  
  const mensajeCodificado = encodeURIComponent(mensajeWhatsApp);
  

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${mensajeCodificado}`;
  
  
  const btn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');
  btnText.textContent = 'Abriendo WhatsApp...';
  btnIcon.style.display = 'none';
  btn.disabled = true;
  
  
  const formData = {
    nombre,
    email,
    telefono,
    mensaje,
    fecha: new Date().toISOString()
  };
  
  try {
    const existing = JSON.parse(localStorage.getItem('gym_consultas_whatsapp') || '[]');
    existing.push(formData);
    localStorage.setItem('gym_consultas_whatsapp', JSON.stringify(existing));
  } catch (error) {
    console.error('Error al guardar localmente:', error);
  }
  
  
  window.open(whatsappLink, '_blank');
  

  mostrarEstado('Abriendo WhatsApp... Envia el mensaje para completar la consulta.', 'success');
  
  
  setTimeout(() => {
    btnText.textContent = 'Enviar Consulta';
    btnIcon.style.display = 'inline';
    btn.disabled = false;
  }, 3000);
  
  
  setTimeout(() => {
    document.getElementById('contactForm').reset();
  }, 5000);
};

const mostrarEstado = (mensaje, tipo) => {
  const status = document.getElementById('formStatus');
  status.textContent = mensaje;
  status.className = 'text-center text-sm mt-2 p-3 rounded-xl';
  
  if (tipo === 'success') {
    status.className += ' bg-[#D7FF3D]/10 text-[#D7FF3D] border border-[#D7FF3D]/20';
  } else if (tipo === 'error') {
    status.className += ' bg-[#FF5A36]/10 text-[#FF5A36] border border-[#FF5A36]/20';
  }
  
  status.classList.remove('hidden');
  
  setTimeout(() => {
    status.classList.add('hidden');
  }, 8000);
};

const HORARIOS = [
  { dia: "Lunes – Viernes", horas: "5:00 am – 10:00 pm" },
  { dia: "Sábado", horas: "7:00 am – 6:00 pm" },
  { dia: "Domingo", horas: "8:00 am – 1:00 pm" },
];

const ACCENTS = {
  lime: { text: "text-[#D7FF3D]", bg: "bg-[#D7FF3D]", border: "border-[#D7FF3D]", soft: "bg-[#D7FF3D]/15", hex: "#D7FF3D" },
  ember: { text: "text-[#FF5A36]", bg: "bg-[#FF5A36]", border: "border-[#FF5A36]", soft: "bg-[#FF5A36]/15", hex: "#FF5A36" },
  violet: { text: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]", border: "border-[#8B5CF6]", soft: "bg-[#8B5CF6]/15", hex: "#8B5CF6" },
  pink: { text: "text-[#FF4FA3]", bg: "bg-[#FF4FA3]", border: "border-[#FF4FA3]", soft: "bg-[#FF4FA3]/15", hex: "#FF4FA3" },
};

// ---- HOOKS Y UTILIDADES ----
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(40px)",
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function CountUp({ to, suffix = "" }) {
  const [ref, visible] = useReveal();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!visible) return;
    let frame;
    const duration = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [visible, to]);
  return (
    <span ref={ref} className="font-display text-5xl md:text-6xl text-[#D7FF3D]">
      {val}
      {suffix}
    </span>
  );
}

function SectionBg({ src, overlay = true, dim = 0.78 }) {
  return (
    <div className="absolute inset-0 -z-10">
      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
      {overlay && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgba(10,10,11,${dim}) 0%, rgba(10,10,11,${Math.min(0.96, dim + 0.12)}) 55%, rgba(10,10,11,0.98) 100%)`,
          }}
        />
      )}
    </div>
  );
}

// ---- COMPONENTE PRINCIPAL ----
export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setParallax(window.scrollY);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const particles = Array.from({ length: 24 });

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F1] antialiased overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;600&display=swap');
        .font-display { font-family: 'Anton', sans-serif; letter-spacing: 0.02em; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        /* Animaciones clave */
        @keyframes floatY { 0%,100% { transform: translateY(0px); opacity: 0.4; } 50% { transform: translateY(-25px); opacity: 1; } }
        @keyframes floatX { 0%,100% { transform: translateX(0px); } 50% { transform: translateX(20px); } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(215,255,61,0.4); } 50% { box-shadow: 0 0 0 15px rgba(215,255,61,0); } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes blob1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(80px,-60px) scale(1.3); } }
        @keyframes blob2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-80px,60px) scale(1.2); } }
        @keyframes blob3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,50px) scale(1.1); } }
        @keyframes tiltIn { 0% { opacity: 0; transform: rotate(-3deg) scale(0.95); } 100% { opacity: 1; transform: rotate(0deg) scale(1); } }
        
        .particle { animation: floatY 7s ease-in-out infinite; }
        .btn-glow { animation: pulseGlow 2.5s ease-in-out infinite; }
        .blob-lime { animation: blob1 12s ease-in-out infinite; }
        .blob-ember { animation: blob2 14s ease-in-out infinite; }
        .blob-violet { animation: blob3 16s ease-in-out infinite; }
        .spin-slow { animation: spinSlow 20s linear infinite; }
        .shimmer-text {
          background-size: 300% auto;
          animation: shimmer 5s linear infinite;
        }
        .card-hover { transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .card-hover:hover { transform: translateY(-10px) scale(1.02); }
        .plan-card { transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .plan-card:hover { transform: translateY(-15px) scale(1.03); }
        .img-zoom { transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
        .img-zoom-wrap:hover .img-zoom { transform: scale(1.1); }
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.5); }
        
        @media (prefers-reduced-motion: reduce) {
          .particle, .btn-glow, .blob-lime, .blob-ember, .blob-violet, .spin-slow, .shimmer-text { animation: none; }
        }
      `}</style>

      {/* --- BARRA DE PROGRESO --- */}
      <div className="fixed top-0 left-0 h-[3px] z-[60]" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #D7FF3D, #FF5A36, #8B5CF6)" }} />

      {/* --- NAVBAR --- */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0A0A0B]/90 backdrop-blur-xl border-b border-[#232326]" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#top" className="font-display text-2xl tracking-wide flex items-center gap-2">
            <span className="text-[#D7FF3D]">GYM</span><span className="text-white">FITNESS</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm text-[#C9C9CC]">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="relative hover:text-[#D7FF3D] transition-colors group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-gradient-to-r from-[#D7FF3D] to-[#FF5A36] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-sm text-[#C9C9CC] hover:text-white transition-colors">Iniciar Sesión</a>
            <a href="#contacto" className="btn-glow font-mono text-xs uppercase tracking-wider bg-[#D7FF3D] text-[#0A0A0B] px-5 py-2.5 rounded-md hover:bg-[#c2e636] active:scale-95 transition-all duration-300 hover:shadow-[0_0_30px_#D7FF3D66]">
              Únete Ahora
            </a>
          </div>

          <button className="md:hidden text-[#F4F4F1] transition-transform duration-300 hover:scale-110" onClick={() => setMenuOpen((v) => !v)} aria-label="Abrir menú">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-[#0A0A0B]/95 backdrop-blur-lg border-t border-[#232326] px-6 py-6 flex flex-col gap-5 animate-in slide-in-from-top-5 duration-300">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-[#C9C9CC] hover:text-[#D7FF3D] text-base font-medium transition-colors">{link.label}</a>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-[#232326]">
              <a href="/login" className="text-sm text-[#C9C9CC] hover:text-white transition-colors">Iniciar Sesión</a>
              <a href="#contacto" onClick={() => setMenuOpen(false)} className="font-mono text-xs uppercase tracking-wider bg-[#D7FF3D] text-[#0A0A0B] px-5 py-3 rounded-md text-center active:scale-95 transition-all duration-200">
                Únete Ahora
              </a>
            </div>
          </div>
        )}
      </header>

      {/* --- HERO --- */}
      <section id="top" className="relative min-h-screen flex items-center px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={IMG_HERO}
            alt="Persona entrenando en el gimnasio"
            className="w-full h-full object-cover"
            style={{ transform: `translateY(${parallax * 0.2}px) scale(1.1)` }}
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/60 to-[#0A0A0B]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/80 via-[#0A0A0B]/20 to-transparent" />
        </div>

        {/* Blobs de color */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#D7FF3D]/20 blur-3xl blob-lime pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#FF5A36]/20 blur-3xl blob-ember pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full bg-[#8B5CF6]/20 blur-3xl blob-violet pointer-events-none" />

        {/* Partículas flotantes */}
        {particles.map((_, i) => {
          const colors = ["#D7FF3D", "#FF5A36", "#8B5CF6", "#FF4FA3"];
          const left = (i * 7.2) % 100;
          const top = 15 + (i * 3.7) % 70;
          const size = 4 + (i % 6);
          const delay = (i % 10) * 0.8;
          return (
            <span
              key={i}
              className="particle absolute rounded-full pointer-events-none"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                background: colors[i % colors.length],
                animationDelay: `${delay}s`,
                opacity: 0.3 + (i % 5) * 0.1,
              }}
            />
          );
        })}

        <div className="max-w-7xl mx-auto relative w-full">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 font-mono text-xs text-[#D7FF3D] uppercase tracking-[0.25em] mb-6 animate-in slide-in-from-left-5 duration-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D7FF3D] btn-glow" />
              Abierto Ahora — 5:00 am / 10:00 pm
            </div>

            <h1 className="font-display text-[15vw] sm:text-7xl md:text-8xl leading-[0.9] uppercase">
              Entrena
              <br />
              <span
                className="shimmer-text bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #D7FF3D, #FF5A36, #8B5CF6, #D7FF3D)" }}
              >
                sin límites.
              </span>
            </h1>

            <p className="mt-8 max-w-lg text-[#E5E5E2] text-lg drop-shadow-lg leading-relaxed">
              Sala de musculación, clases grupales y entrenadores certificados que
              registran cada serie y cada avance. <span className="text-[#D7FF3D]">Tu progreso, medido de verdad.</span>
            </p>

            <div className="mt-10 flex flex-wrap gap-5">
              <a href="#contacto" className="btn-glow inline-flex items-center gap-3 bg-[#D7FF3D] text-[#0A0A0B] font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-md hover:bg-[#c2e636] active:scale-95 transition-all duration-300 hover:shadow-[0_0_40px_#D7FF3D80]">
                Agenda tu Visita <ChevronRight size={18} className="animate-pulse" />
              </a>
              <a href="#planes" className="inline-flex items-center gap-2 border border-white/30 bg-white/5 backdrop-blur-sm text-[#F4F4F1] font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-md hover:border-[#FF5A36] hover:text-[#FF5A36] hover:bg-[#FF5A36]/10 active:scale-95 transition-all duration-300 group">
                Ver Planes <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

          {/* HUD Flotante */}
          <Reveal className="mt-20 max-w-4xl">
            <div className="border border-white/10 bg-[#0A0A0B]/70 backdrop-blur-2xl rounded-2xl overflow-hidden shadow-2xl hover-lift">
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5">
                {[
                  { label: "Miembros Activos", value: 100, suffix: "+", icon: Users, color: "lime" },
                  { label: "Clases / Semana", value: 5, suffix: "", icon: Flame, color: "ember" },
                  { label: "Entrenadores", value: 9, suffix: "", icon: Dumbbell, color: "violet" },
                  { label: "Años de Trayectoria", value: 1, suffix: "", icon: Timer, color: "pink" },
                ].map((stat) => (
                  <div key={stat.label} className="p-6 flex flex-col gap-2 hover:bg-white/5 transition-colors">
                    <stat.icon size={18} className={ACCENTS[stat.color].text} />
                    <CountUp to={stat.value} suffix={stat.suffix} />
                    <span className="font-mono text-[11px] uppercase text-[#9A9AA0] tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- MARQUEE DE DISCIPLINAS --- */}
      <div className="border-y border-[#232326] bg-gradient-to-r from-[#1a140b] via-[#101012] to-[#10081a] py-4 overflow-hidden">
        <div className="flex whitespace-nowrap marquee-track font-mono text-xs uppercase tracking-[0.3em] text-[#C9C9CC]">
          {Array(3)
            .fill(["Fuerza", "Hipertrofia", "HIIT", "Funcional", "Movilidad", "Cardio", "Powerlifting", "Rehab", "Yoga", "Boxeo"])
            .flat()
            .map((item, i) => {
              const colors = ["#D7FF3D", "#FF5A36", "#8B5CF6", "#FF4FA3"];
              return (
                <span key={i} className="mx-8 flex items-center gap-6">
                  {item}
                  <Sparkles size={14} style={{ color: colors[i % colors.length] }} />
                </span>
              );
            })}
        </div>
      </div>

      {/* --- SERVICIOS --- */}
      <section id="servicios" className="relative py-32 px-6 border-b border-[#232326] overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/10 blur-3xl blob-violet pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <Reveal>
            <div className="flex items-end justify-between mb-16 flex-wrap gap-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF5A36]">Qué Ofrecemos</span>
                <h2 className="font-display text-5xl md:text-6xl uppercase mt-2">
                  Todo lo que <span className="text-[#D7FF3D]">necesitas</span>
                </h2>
              </div>
              <p className="font-mono text-xs uppercase tracking-widest text-[#9A9AA0] max-w-xs text-right">
                Entrena en serio, sin pagar por lo que no usas.
              </p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICIOS.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div
                  className="card-hover rounded-2xl p-8 flex flex-col gap-5 h-full border border-[#232326] hover:border-white/30 bg-gradient-to-br from-[#101012] to-[#0A0A0B] group"
                  style={{ background: `linear-gradient(160deg, ${ACCENTS[s.color].hex}14, #101012)` }}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${ACCENTS[s.color].soft} group-hover:scale-110 transition-transform duration-300`}>
                    <s.icon size={28} className={ACCENTS[s.color].text} />
                  </div>
                  <h3 className="font-display text-2xl uppercase group-hover:text-[#D7FF3D] transition-colors duration-300">{s.title}</h3>
                  <p className="text-sm text-[#9A9AA0] leading-relaxed">{s.desc}</p>
                  <div className="mt-auto pt-4">
                    <span className="font-mono text-xs uppercase tracking-wider text-[#D7FF3D] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                      Ver más <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- PROGRAMAS  --- */}
      <section id="programas" className="relative py-32 px-6 border-b border-[#232326]">
        <SectionBg src={IMG_SQUAT} dim={0.85} />
        <div className="max-w-7xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-16">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#D7FF3D]">Programas</span>
              <h2 className="font-display text-5xl md:text-6xl uppercase mt-2">
                Entrena por <span className="text-[#FF5A36]">objetivo</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROGRAMAS.map((p, i) => (
              <Reveal key={p.n} delay={i * 100}>
                <div
                  className="card-hover rounded-2xl p-8 h-full border border-white/15 bg-[#0A0A0B]/60 backdrop-blur-sm hover:border-white/40 hover:bg-[#0A0A0B]/80 group"
                >
                  <span className={`font-display text-6xl ${ACCENTS[p.color].text} opacity-80 group-hover:opacity-100 transition-opacity`}>{p.n}</span>
                  <h3 className="font-display text-3xl uppercase mt-4 mb-3 group-hover:text-[#D7FF3D] transition-colors">{p.title}</h3>
                  <p className="text-sm text-[#C9C9CC] leading-relaxed">{p.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- EQUIPO DE ENTRENADORES --- */}
      <section id="entrenadores" className="py-32 px-6 border-b border-[#232326] bg-gradient-to-b from-[#101012] to-[#0A0A0B]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#8B5CF6]">Equipo de Élite</span>
              <h2 className="font-display text-5xl md:text-6xl uppercase mt-2">
                Desarrollado <span className="text-[#8B5CF6]">Por</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ENTRENADORES.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="card-hover rounded-2xl overflow-hidden border border-[#232326] hover:border-white/30 bg-[#101012] group">
                  <div className="aspect-[4/3] overflow-hidden img-zoom-wrap">
                    <img src={t.img} alt={t.name} className="img-zoom w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <div className={`w-12 h-12 rounded-xl font-display text-lg flex items-center justify-center ${ACCENTS[t.color].bg} text-[#0A0A0B] mb-4 group-hover:scale-110 transition-transform`}>
                      {t.tag}
                    </div>
                    <h3 className="font-display text-xl uppercase group-hover:text-[#D7FF3D] transition-colors">{t.name}</h3>
                    <p className="font-mono text-xs text-[#9A9AA0] uppercase tracking-wide mt-1">{t.spec}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- INSTALACIONES --- */}
      <section id="instalaciones" className="relative py-32 px-6 border-b border-[#232326]">
        <SectionBg src={IMG_GROUP} dim={0.82} />
        <div className="max-w-7xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-16">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#D7FF3D]">Espacios</span>
              <h2 className="font-display text-5xl md:text-6xl uppercase mt-2">
                Nuestras <span className="text-[#D7FF3D]">instalaciones</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Sala de Pesas", color: "lime", img: IMG_RACK },
              { label: "Zona Funcional", color: "ember", img: IMG_SQUAT },
              { label: "Cardio", color: "violet", img: IMG_GROUP },
              { label: "Vestidores", color: "pink", img: IMG_HERO },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 100}>
                <div className="card-hover img-zoom-wrap relative aspect-[4/5] rounded-2xl border border-white/15 overflow-hidden hover:border-white/40 group">
                  <img src={item.img} alt={item.label} className="img-zoom absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/30 to-transparent group-hover:from-[#0A0A0B]/80 transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full ${ACCENTS[item.color].bg} group-hover:scale-150 transition-transform`} />
                    <span className="font-mono text-xs uppercase tracking-wide text-white group-hover:text-[#D7FF3D] transition-colors">{item.label}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    
  {/* --- PLANES DE MEMBRESIAS --- */}
  {/*
      <section id="planes" className="relative py-32 px-6 border-b border-[#232326] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#D7FF3D]/10 via-[#FF5A36]/10 to-[#8B5CF6]/10 blur-3xl spin-slow pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-16">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF5A36]">Membresías</span>
              <h2 className="font-display text-5xl md:text-6xl uppercase mt-2">
                Elige tu <span className="text-[#FF5A36]">plan</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {PLANES.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 120}>
                <div
                  className="plan-card relative rounded-2xl p-8 flex flex-col gap-6 h-full border-2 overflow-hidden group"
                  style={{
                    background: plan.grad,
                    borderColor: plan.highlight ? ACCENTS[plan.color].hex : "rgba(255,255,255,0.12)",
                    boxShadow: plan.highlight ? `0 0 60px -15px ${ACCENTS[plan.color].hex}80` : "none",
                  }}
                >
                  {plan.highlight && (
                    <span
                      className="absolute top-0 right-0 font-mono text-[10px] uppercase tracking-widest px-5 py-2 rounded-bl-2xl flex items-center gap-2"
                      style={{ background: ACCENTS[plan.color].hex, color: "#0A0A0B" }}
                    >
                      <Zap size={14} /> Más Elegido
                    </span>
                  )}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-3xl uppercase" style={{ color: ACCENTS[plan.color].hex }}>{plan.name}</h3>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="font-mono text-xl text-[#C9C9CC]">$</span>
                        <span className="font-display text-6xl">{plan.price}</span>
                        <span className="font-mono text-xs text-[#9A9AA0]">{plan.period}</span>
                      </div>
                    </div>
                    <plan.icon size={24} style={{ color: ACCENTS[plan.color].hex }} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <ul className="flex flex-col gap-4 text-sm text-[#E5E5E2] flex-1">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 size={18} style={{ color: ACCENTS[plan.color].hex }} className="mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#contacto"
                    className="text-center font-mono text-xs uppercase tracking-wider px-6 py-4 rounded-xl transition-all duration-300 active:scale-95 hover:brightness-110 group relative overflow-hidden"
                    style={{
                      background: plan.highlight ? ACCENTS[plan.color].hex : "transparent",
                      border: plan.highlight ? "none" : `1px solid ${ACCENTS[plan.color].hex}`,
                      color: plan.highlight ? "#0A0A0B" : ACCENTS[plan.color].hex,
                    }}
                  >
                    <span className="relative z-10">Quiero este plan</span>
                    {plan.highlight && (
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="font-mono text-[11px] text-[#5C5C60] mt-8 uppercase tracking-wide text-center">* Precios referenciales, sujetos a confirmación en recepción</p>
        </div>
      </section>
*/}
      {/* --- TESTIMONIOS --- */}
      <section id="testimonios" className="py-32 px-6 border-b border-[#232326] bg-[#101012]">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#FF4FA3]">Testimonios</span>
              <h2 className="font-display text-5xl md:text-6xl uppercase mt-2">
                Lo que dicen <span className="text-[#FF4FA3]">nuestros miembros</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8">
            {TESTIMONIOS.map((t, i) => (
              <Reveal key={t.name} delay={i * 150}>
                <div className="card-hover rounded-2xl p-8 border border-[#232326] hover:border-white/30 bg-gradient-to-br from-[#0A0A0B] to-[#101012] group">
                  <div className="flex items-center gap-4 mb-6">
                    <img src={t.img} alt={t.name} className="w-16 h-16 rounded-full object-cover border-2 border-[#D7FF3D]/50" />
                    <div>
                      <h4 className="font-display text-xl uppercase group-hover:text-[#D7FF3D] transition-colors">{t.name}</h4>
                      <p className="font-mono text-xs text-[#9A9AA0] uppercase tracking-wide">{t.role}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(t.rating)].map((_, i) => (
                          <Star key={i} size={14} className="fill-[#D7FF3D] text-[#D7FF3D]" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Quote size={24} className="text-[#D7FF3D]/30 mb-4 group-hover:text-[#D7FF3D]/60 transition-colors" />
                  <p className="text-[#C9C9CC] leading-relaxed italic">"{t.quote}"</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    {/* --- CONTACTO / UBICACIÓN (con foto de fondo) --- */}
<section id="contacto" className="relative py-32 px-6 border-b border-[#232326]">
  <SectionBg src={IMG_RACK} dim={0.88} />
  <div className="max-w-7xl mx-auto relative grid md:grid-cols-2 gap-16">
    <Reveal>
      <div>
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#D7FF3D]">Visítanos</span>
        <h2 className="font-display text-5xl md:text-6xl uppercase mt-2 mb-10">
          Estamos <span className="text-[#D7FF3D]">aquí</span>
        </h2>

        <div className="flex flex-col gap-6 text-sm text-[#E5E5E2]">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#D7FF3D]/50 transition-all duration-300 group">
            <MapPin size={22} className="text-[#D7FF3D] group-hover:scale-110 transition-transform" />
            <span>Dirección del Gimnasio — Maracaibo, Venezuela</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#FF5A36]/50 transition-all duration-300 group">
            <Phone size={22} className="text-[#FF5A36] group-hover:scale-110 transition-transform" />
            <span>+58 424 677 3874</span>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#8B5CF6]/50 transition-all duration-300 group">
            <Mail size={22} className="text-[#8B5CF6] group-hover:scale-110 transition-transform" />
            <span>contacto@gymfitness.com</span>
          </div>
        </div>

        <div className="mt-12 border border-white/15 bg-[#0A0A0B]/70 backdrop-blur-sm rounded-2xl divide-y divide-white/10 overflow-hidden">
          {HORARIOS.map((h) => (
            <div key={h.dia} className="flex justify-between px-6 py-4 text-sm hover:bg-white/5 transition-colors">
              <span className="text-[#C9C9CC] flex items-center gap-2">
                <Clock size={16} /> {h.dia}
              </span>
              <span className="font-mono text-[#D7FF3D]">{h.horas}</span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>

    <Reveal delay={150}>
      {/* CAMBIA onSubmit y agrega IDs a los inputs */}
      <form 
        id="contactForm"
        className="flex flex-col gap-5 bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-8 shadow-2xl hover:border-white/30 transition-all duration-300" 
        onSubmit={handleSubmitWhatsApp}
      >
        <h3 className="font-display text-3xl uppercase mb-2 text-center">Pide Información</h3>
        <p className="text-sm text-[#9A9AA0] text-center mb-4">Completa el formulario y te contactaremos</p>
        
        {/*  AGREGAR id="nombre" */}
        <input 
          type="text" 
          id="nombre"
          placeholder="Nombre Completo" 
          className="bg-[#0A0A0B] border border-[#232326] rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#D7FF3D] focus:shadow-[0_0_20px_#D7FF3D33] transition-all duration-300" 
          required 
        />
        
        {/*  AGREGAR id="email" */}
        <input 
          type="email" 
          id="email"
          placeholder="Correo Electrónico" 
          className="bg-[#0A0A0B] border border-[#232326] rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#D7FF3D] focus:shadow-[0_0_20px_#D7FF3D33] transition-all duration-300" 
          required 
        />
        
        {/* AGREGAR id="telefono" */}
        <input 
          type="tel" 
          id="telefono"
          placeholder="Teléfono" 
          className="bg-[#0A0A0B] border border-[#232326] rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#D7FF3D] focus:shadow-[0_0_20px_#D7FF3D33] transition-all duration-300" 
        />
        
        {/*  AGREGAR id="mensaje" */}
        <textarea 
          id="mensaje"
          placeholder="¿Qué te gustaría saber?" 
          rows={4} 
          className="bg-[#0A0A0B] border border-[#232326] rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#D7FF3D] focus:shadow-[0_0_20px_#D7FF3D33] resize-none transition-all duration-300" 
        />
        
        {/*  AGREGAR id="submitBtn", id="btnText", id="btnIcon" */}
        <button 
          type="submit" 
          id="submitBtn"
          className="btn-glow bg-[#D7FF3D] text-[#0A0A0B] font-mono text-sm uppercase tracking-wider px-6 py-4 rounded-xl hover:bg-[#c2e636] active:scale-95 transition-all duration-300 hover:shadow-[0_0_40px_#D7FF3D80] flex items-center justify-center gap-3"
        >
          <span id="btnText">Enviar Consulta</span>
          <ArrowRight size={18} className="animate-pulse" id="btnIcon" />
        </button>
        
        {/* AGREGAR este div para mostrar estado */}
        <div id="formStatus" className="text-center text-sm hidden"></div>
      </form>
    </Reveal>
  </div>
</section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-[#232326] px-6 py-10 bg-[#0A0A0B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="font-display text-2xl uppercase flex items-center gap-2">
            <span className="text-[#D7FF3D]">GYM</span><span className="text-white">FITNESS</span>
          </span>
          <p className="font-mono text-[11px] text-[#5C5C60] uppercase tracking-wide">
            © 2026 GYM FITNESS — Todos los derechos reservados
          </p>
          <div className="flex items-center gap-6">
            <a href="/login" className="font-mono text-[11px] uppercase tracking-wide text-[#9A9AA0] hover:text-[#D7FF3D] transition-colors flex items-center gap-2 group">
              Acceso al Sistema <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}