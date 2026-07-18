import { useState, useEffect, useRef } from "react";
import {
  Dumbbell,
  Flame,
  HeartPulse,
  Users,
  Clock,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  ChevronRight,
  CheckCircle2,
  Activity,
  Timer,
  Zap,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Star,
  User,
  Calendar,
  Award,
  Play,
  Quote,
  ChevronLeft
} from "lucide-react";

// ---- IMÁGENES ----
const IMG_HERO = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=80";
const IMG_SQUAT = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1920&q=80";
const IMG_GROUP = "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?auto=format&fit=crop&w=1920&q=80";
const IMG_RACK = "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=1920&q=80";
const IMG_CLIENTE = "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80";

// ---- CONSTANTES ----
const WHATSAPP_NUMBER = "584146416366"; // Número actualizado
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;
const INSTAGRAM_LINK = "https://www.instagram.com/netsolca.ve?igsh=NGExa29mcjF0bGxo"; // Instagram actualizado

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#programas", label: "Programas" },
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

// ---- HOOKS ----
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

  const openWhatsApp = () => {
    window.open(WHATSAPP_LINK, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F1] antialiased overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=JetBrains+Mono:wght@400;600&display=swap');
        .font-display { font-family: 'Anton', sans-serif; letter-spacing: 0.02em; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        @keyframes floatY { 0%,100% { transform: translateY(0px); opacity: 0.4; } 50% { transform: translateY(-25px); opacity: 1; } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(215,255,61,0.4); } 50% { box-shadow: 0 0 0 15px rgba(215,255,61,0); } }
        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes blob1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(80px,-60px) scale(1.3); } }
        @keyframes blob2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-80px,60px) scale(1.2); } }
        @keyframes blob3 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,50px) scale(1.1); } }
        
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
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 20px 40px -12px rgba(0,0,0,0.5); }
        
        html { scroll-behavior: smooth; }
        * { scroll-margin-top: 80px; }
        
        @media (prefers-reduced-motion: reduce) {
          .particle, .btn-glow, .blob-lime, .blob-ember, .blob-violet, .spin-slow, .shimmer-text { animation: none; }
        }
      `}</style>

      {/* --- BARRA DE PROGRESO --- */}
      <div className="fixed top-0 left-0 h-[3px] z-[60] transition-all duration-300" style={{ width: `${progress}%`, background: "linear-gradient(90deg, #D7FF3D, #FF5A36, #8B5CF6)" }} />

      {/* --- WHATSAPP FLOAT (SIEMPRE VISIBLE) --- */}
      <button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20b85a] shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></span>
      </button>

      {/* --- NAVBAR --- */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0A0A0B]/95 backdrop-blur-xl border-b border-[#232326]" : "bg-transparent"}`}>
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
      <section id="top" className="relative min-h-screen flex items-center px-6 overflow-hidden pt-20">
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

        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#D7FF3D]/20 blur-3xl blob-lime pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-[#FF5A36]/20 blur-3xl blob-ember pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] rounded-full bg-[#8B5CF6]/20 blur-3xl blob-violet pointer-events-none" />

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
              <a href="#contacto" className="inline-flex items-center gap-2 border border-white/30 bg-white/5 backdrop-blur-sm text-[#F4F4F1] font-mono text-sm uppercase tracking-wider px-8 py-4 rounded-md hover:border-[#FF5A36] hover:text-[#FF5A36] hover:bg-[#FF5A36]/10 active:scale-95 transition-all duration-300 group">
                <MessageCircle size={16} /> Consulta por WhatsApp <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

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
              <a 
                href={INSTAGRAM_LINK} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-widest text-[#9A9AA0] hover:text-[#D7FF3D] transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#D7FF3D] animate-pulse"></span>
                Síguenos en Instagram
              </a>
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
                    <button
                      onClick={openWhatsApp}
                      className="w-full py-2.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl text-sm font-medium hover:bg-[#25D366]/20 transition-all flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Consultar por WhatsApp
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- PROGRAMAS --- */}
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
                  <button
                    onClick={openWhatsApp}
                    className="mt-4 w-full py-2 bg-[#D7FF3D]/10 text-[#D7FF3D] border border-[#D7FF3D]/20 rounded-xl text-sm font-medium hover:bg-[#D7FF3D]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar este programa
                  </button>
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
                  <button
                    onClick={openWhatsApp}
                    className="mt-4 w-full py-2 bg-[#FF4FA3]/10 text-[#FF4FA3] border border-[#FF4FA3]/20 rounded-xl text-sm font-medium hover:bg-[#FF4FA3]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Comienza tu transformación
                  </button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACTO + GOOGLE MAPS --- */}
      <section id="contacto" className="relative py-32 px-6 border-b border-[#232326]">
        <SectionBg src={IMG_RACK} dim={0.88} />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-16">
            
            <Reveal>
              <div>
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#D7FF3D]">Visítanos</span>
                <h2 className="font-display text-5xl md:text-6xl uppercase mt-2 mb-10">
                  Estamos <span className="text-[#D7FF3D]">aquí</span>
                </h2>

                <div className="flex flex-col gap-4 text-sm text-[#E5E5E2]">
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#D7FF3D]/50 transition-all duration-300 group">
                    <MapPin size={22} className="text-[#D7FF3D] group-hover:scale-110 transition-transform" />
                    <span>GYM FITNESS — Maracaibo, Venezuela</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#FF5A36]/50 transition-all duration-300 group">
                    <Phone size={22} className="text-[#FF5A36] group-hover:scale-110 transition-transform" />
                    <a href="tel:+584146416366" className="hover:text-[#FF5A36]">+58 414 641 6366</a> {/* Número actualizado */}
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/10 hover:border-[#8B5CF6]/50 transition-all duration-300 group">
                    <Mail size={22} className="text-[#8B5CF6] group-hover:scale-110 transition-transform" />
                    <a href="mailto:netsolca@gmail.com" className="hover:text-[#8B5CF6]">netsolca@gmail.com</a> {/* Correo actualizado */}
                  </div>
                  <button
                    onClick={openWhatsApp}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all group"
                  >
                    <MessageCircle size={22} className="text-[#25D366] group-hover:scale-110 transition-transform" />
                    <span className="text-white group-hover:text-[#25D366] transition-colors">Escribir por WhatsApp</span>
                  </button>
                </div>

                <div className="mt-8 border border-white/15 bg-[#0A0A0B]/70 backdrop-blur-sm rounded-2xl divide-y divide-white/10 overflow-hidden">
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
              <div className="flex flex-col gap-6">
                
                <form
                  id="contactForm"
                  className="flex flex-col gap-4 bg-[#0A0A0B]/80 backdrop-blur-xl border border-white/15 rounded-2xl p-6 shadow-2xl hover:border-white/30 transition-all duration-300"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const nombre = document.getElementById('nombre')?.value || '';
                    const email = document.getElementById('email')?.value || '';
                    const telefono = document.getElementById('telefono')?.value || '';
                    const mensaje = document.getElementById('mensaje')?.value || '';
                    
                    const text = `GYM-FITNESS%0A%0ANombre: ${nombre}%0AEmail: ${email}%0ATeléfono: ${telefono || 'No especificado'}%0AMensaje: ${mensaje || 'Sin mensaje'}`;
                    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
                  }}
                >
                  <h3 className="font-display text-2xl uppercase text-center">Pide Información</h3>
                  <p className="text-sm text-[#9A9AA0] text-center">Completa el formulario y te contactaremos</p>
                  
                  <input id="nombre" type="text" placeholder="Nombre Completo" className="bg-[#0A0A0B] border border-[#232326] rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#D7FF3D] transition-all duration-300" required />
                  <input id="email" type="email" placeholder="Correo Electrónico" className="bg-[#0A0A0B] border border-[#232326] rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#D7FF3D] transition-all duration-300" required />
                  <input id="telefono" type="tel" placeholder="Teléfono" className="bg-[#0A0A0B] border border-[#232326] rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#D7FF3D] transition-all duration-300" />
                  <textarea id="mensaje" placeholder="¿Qué te gustaría saber?" rows={3} className="bg-[#0A0A0B] border border-[#232326] rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-[#D7FF3D] resize-none transition-all duration-300" />
                  
                  <button type="submit" className="btn-glow bg-[#D7FF3D] text-[#0A0A0B] font-mono text-sm uppercase tracking-wider px-6 py-4 rounded-xl hover:bg-[#c2e636] active:scale-95 transition-all duration-300 hover:shadow-[0_0_40px_#D7FF3D80] flex items-center justify-center gap-3">
                    <MessageCircle size={18} />
                    Enviar por WhatsApp <ArrowRight size={18} className="animate-pulse" />
                  </button>
                </form>

                {/* GOOGLE MAPS */}
                <div className="rounded-2xl overflow-hidden border border-white/15 hover:border-white/30 transition-all duration-300 shadow-2xl">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3913.787532672489!2d-71.6373506!3d10.6384639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e899e0b0b0b0b0b%3A0x0!2zMTAuNjM4NDYzOSw3MS42Mzc1MDY!5e0!3m2!1ses!2sve!4v1700000000000!5m2!1ses!2sve"
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ubicación del gimnasio"
                    className="w-full"
                  />
                </div>
              </div>
            </Reveal>
          </div>
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
            <button
              onClick={openWhatsApp}
              className="font-mono text-[11px] uppercase tracking-wide text-[#25D366] hover:text-[#20b85a] transition-colors flex items-center gap-2 group"
            >
              <MessageCircle size={14} /> WhatsApp
            </button>
            <a 
              href={INSTAGRAM_LINK} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-mono text-[11px] uppercase tracking-wide text-[#9A9AA0] hover:text-[#D7FF3D] transition-colors flex items-center gap-2 group"
            >
              Instagram
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}