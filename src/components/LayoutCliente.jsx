// src/components/LayoutCliente.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { 
  Home, 
  Dumbbell, 
  QrCode, 
  CreditCard, 
  User,
  LogOut,
  Menu,
  X,
  BookOpen,
  List
} from 'lucide-react';

const LayoutCliente = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/cliente/dashboard', icon: Home, label: 'Inicio' },
    { to: '/cliente/rutinas', icon: Dumbbell, label: 'Rutina' },
    { to: '/cliente/ejercicios', icon: BookOpen, label: 'Ejercicios' },
    { to: '/cliente/qr', icon: QrCode, label: 'QR' },
    { to: '/cliente/membresias', icon: CreditCard, label: 'Membresías' },
    { to: '/cliente/pagos', icon: CreditCard, label: 'Pagos' },
    { to: '/cliente/perfil', icon: User, label: 'Perfil' },
  ];

  // Detectar si es móvil (menos de 768px)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#F4F4F1] flex flex-col">
      
      {/* ============================================================ */}
      {/* HEADER SUPERIOR (siempre visible) */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-30 border-b border-[#00F2FE]/5 bg-[#0A0A0B]/80 backdrop-blur-md px-4 py-3 flex justify-between items-center">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white hover:text-[#00F2FE] transition-colors p-1 lg:hidden"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-lg font-black tracking-tight text-white">
            GYM <span className="text-[#00F2FE]">FITNESS</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[#9A9AA0] text-xs font-mono hidden sm:inline">
            {user?.nombre || 'Usuario'}
          </span>
          <button 
            onClick={handleLogout}
            className="text-[#FF4D4D] text-xs font-mono hover:bg-[#FF4D4D]/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MENÚ MÓVIL (Overlay) - Solo en móvil cuando se abre */}
      {/* ============================================================ */}
      {mobileMenuOpen && isMobile && (
        <div className="fixed inset-0 z-40 bg-[#0A0A0B]/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-left duration-300 lg:hidden">
          <div className="flex justify-between items-center border-b border-[#00F2FE]/10 pb-4">
            <h1 className="text-xl font-black tracking-tight text-white">
              GYM <span className="text-[#00F2FE]">FITNESS</span>
            </h1>
            <button onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#00F2FE]">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-3 py-4 border-b border-[#00F2FE]/5">
            <div className="w-12 h-12 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] font-mono text-lg">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-white font-bold">{user?.nombre || 'Usuario'}</p>
              <p className="text-xs font-mono text-[#9A9AA0]">Cliente</p>
            </div>
          </div>

          <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30' 
                    : 'text-[#9A9AA0] hover:bg-[#1A1A2E]/50 hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-all border border-transparent hover:border-[#FF4D4D]/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONTENIDO PRINCIPAL + SIDEBAR (Desktop) */}
      {/* ============================================================ */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR - Solo visible en desktop (≥ 768px) */}
        {!isMobile && (
          <aside className="w-16 lg:w-20 flex-shrink-0 border-r border-[#00F2FE]/5 bg-[#0A0A0B]/30 backdrop-blur-sm flex flex-col items-center py-4 gap-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all group
                  ${isActive 
                    ? 'bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30' 
                    : 'text-[#9A9AA0] hover:bg-[#1A1A2E]/50 hover:text-white'
                  }
                `}
                title={item.label}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[7px] font-mono mt-0.5 truncate max-w-[50px]">
                  {item.label}
                </span>
              </NavLink>
            ))}
            
            <div className="flex-1"></div>
            
            <button
              onClick={handleLogout}
              className="w-12 h-12 flex flex-col items-center justify-center rounded-xl text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-colors group"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[7px] font-mono mt-0.5">Salir</span>
            </button>
          </aside>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {/* ============================================================ */}
      {/* NAVEGACIÓN INFERIOR - Solo en móvil (fija abajo) */}
      {/* ============================================================ */}
      {isMobile && (
        <nav className="sticky bottom-0 z-30 bg-[#0A0A0B]/95 backdrop-blur-md border-t border-[#00F2FE]/5 flex justify-around items-center px-2 py-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex flex-col items-center py-1 px-2 rounded-lg transition-all min-w-[44px]
                  ${isActive 
                    ? 'text-[#00F2FE]' 
                    : 'text-[#9A9AA0] hover:text-white'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-[#00F2FE]' : ''}`} />
                <span className={`text-[8px] font-mono mt-0.5 ${isActive ? 'text-[#00F2FE]' : 'text-[#9A9AA0]'}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default LayoutCliente;