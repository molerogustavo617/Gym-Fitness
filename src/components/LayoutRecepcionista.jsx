// src/components/LayoutRecepcionista.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import {
  Home,
  Users,
  QrCode,
  DoorOpen,
  LogOut,
  Menu,
  X,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const LayoutRecepcionista = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar autenticación
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 2) {
      navigate('/dashboard');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  // Activar menú según la ruta
  useEffect(() => {
    const path = location.pathname;
    if (path === '/recepcion/dashboard') setActiveMenu('dashboard');
    else if (path === '/recepcion/usuarios') setActiveMenu('usuarios');
    else if (path === '/recepcion/qr') setActiveMenu('qr');
    else if (path === '/recepcion/accesos') setActiveMenu('accesos');
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setSidebarOpen(false);
    switch (menuId) {
      case 'dashboard': navigate('/recepcion/dashboard'); break;
      case 'usuarios': navigate('/recepcion/usuarios'); break;
      case 'qr': navigate('/recepcion/qr'); break;
      case 'accesos': navigate('/recepcion/accesos'); break;
      default: break;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'usuarios', label: 'Usuarios', icon: Users },
    { id: 'qr', label: 'Validar QR', icon: QrCode },
    { id: 'accesos', label: 'Accesos', icon: DoorOpen },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex">
      
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============================================================ */}
      {/* SIDEBAR */}
      {/* ============================================================ */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50
        w-72 h-screen bg-[#111625] border-r border-[#00F2FE]/10
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        flex flex-col
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-[#00F2FE]/10">
          <span className="text-xl font-black bg-gradient-to-r from-[#00F2FE] to-[#00F2FE]/70 bg-clip-text text-transparent">
            RECEPCIÓN
          </span>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[#9A9AA0] hover:text-[#00F2FE] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menú */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold
                  transition-all duration-200 mb-1
                  ${isActive 
                    ? 'bg-[#00F2FE]/10 text-[#00F2FE] border border-[#00F2FE]/30' 
                    : 'text-[#9A9AA0] hover:bg-[#1A1A2E] hover:text-white'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#00F2FE]' : 'text-[#9A9AA0]'}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-[#00F2FE]/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-[#9A9AA0] hover:bg-red-500/10 hover:text-red-400 transition-all font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="sticky top-0 z-30 bg-[#111625]/90 backdrop-blur-md border-b border-[#00F2FE]/10 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-[#9A9AA0] hover:text-[#00F2FE] transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-white font-black text-lg">
                {menuItems.find(item => item.id === activeMenu)?.label || 'Dashboard'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-[#9A9AA0] hidden sm:block">
                {user?.nombre || 'Recepcionista'}
              </span>
              <button
                onClick={() => navigate('/perfil')}
                className="w-9 h-9 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center text-[#00F2FE] font-bold text-sm hover:bg-[#00F2FE]/20 transition-colors"
              >
                {user?.nombre?.charAt(0) || 'R'}
              </button>
            </div>
          </div>
        </header>

        {/* CONTENIDO */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0A0A0B]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutRecepcionista;