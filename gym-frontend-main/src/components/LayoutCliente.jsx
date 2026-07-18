// src/components/LayoutCliente.jsx
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

import { 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  QrCode, 
  CreditCard,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';

const LayoutCliente = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const user = authService.getCurrentUser() || { 
    nombre: 'Usuario', 
    apellido: '', 
    rol: 'Cliente',
    plan: 'Premium'
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/cliente/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/cliente/rutinas', icon: Dumbbell, label: 'Mi Rutina' },
    { to: '/cliente/dieta', icon: Utensils, label: 'Plan Dietético' },
    { to: '/cliente/qr', icon: QrCode, label: 'QR de Acceso' },
    { to: '/cliente/pago', icon: CreditCard, label: 'Pagos' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0A0A0B] text-[#F4F4F1] font-sans">
      
      {/* ============================================================ */}
      {/* BARRA LATERAL - Desktop */}
      {/* ============================================================ */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-[#00F2FE]/10 bg-[#111625]/50 backdrop-blur-md flex flex-col justify-between p-4 hidden lg:flex z-30">
        <div className="space-y-6">
          <div className="px-2 pb-4 border-b border-[#00F2FE]/10">
            <h1 className="text-xl font-black tracking-tight text-white">
              GYM <span className="text-[#00F2FE]">FITNESS</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-[#00F2FE] uppercase tracking-widest">
                Panel de Atleta
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-pulse"></span>
            </div>
          </div>

          <div className="px-2 pb-4 border-b border-[#00F2FE]/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] font-mono text-sm flex-shrink-0">
                {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">
                  {user.nombre} {user.apellido}
                </p>
                <div className="flex flex-wrap items-center gap-1">
                  <span className="text-[10px] font-mono text-[#9A9AA0] uppercase">
                    {user.rol}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#9A9AA0]"></span>
                  <span className="text-[10px] font-mono text-[#00F2FE] uppercase">
                    {user.plan}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-1">
            <div className="px-3 py-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#5C5C60] font-bold">
                Navegación
              </span>
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30 shadow-[0_0_20px_rgba(0,242,254,0.05)]' 
                    : 'text-[#9A9AA0] hover:bg-[#1A1A2E]/50 hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {location.pathname === item.to && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] shadow-[0_0_10px_#00F2FE]"></span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="px-1 border-t border-[#00F2FE]/10 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#FF4D4D] hover:bg-[#FF4D4D]/10 transition-all border border-transparent hover:border-[#FF4D4D]/20 group"
          >
            <LogOut className="w-5 h-5 text-[#FF4D4D]/70 group-hover:text-[#FF4D4D] transition-colors" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        
        {/* HEADER - Mobile y Tablet */}
        <header className="sticky top-0 z-20 border-b border-[#00F2FE]/5 bg-[#0A0A0B]/80 backdrop-blur-md p-3 sm:p-4 flex justify-between items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-[#00F2FE] transition-colors p-1"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="flex-1 text-center">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              GYM <span className="text-[#00F2FE]">FITNESS</span>
            </h1>
          </div>

          <button 
            onClick={handleLogout}
            className="text-[#FF4D4D] text-[10px] sm:text-xs font-mono hover:bg-[#FF4D4D]/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors"
          >
            Salir
          </button>
        </header>

        {/* MENÚ MÓVIL - Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden bg-[#0A0A0B]/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 animate-in slide-in-from-left duration-300">
            <div className="flex justify-between items-center border-b border-[#00F2FE]/10 pb-4">
              <h1 className="text-xl font-black tracking-tight text-white">
                GYM <span className="text-[#00F2FE]">FITNESS</span>
              </h1>
              <button onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#00F2FE]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center gap-3 py-4 border-b border-[#00F2FE]/5">
              <div className="w-12 h-12 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] font-mono text-lg flex-shrink-0">
                {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold">{user.nombre} {user.apellido}</p>
                <p className="text-xs font-mono text-[#9A9AA0]">
                  {user.rol} · {user.plan}
                </p>
              </div>
            </div>

            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
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

        {/* CONTENIDO DE LA PÁGINA */}
        <div className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default LayoutCliente;