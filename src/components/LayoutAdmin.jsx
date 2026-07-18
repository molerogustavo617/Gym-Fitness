// src/components/LayoutAdmin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const LayoutAdmin = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 1) {
      navigate('/dashboard');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin/dashboard') setActiveMenu('dashboard');
    else if (path === '/admin/usuarios') setActiveMenu('usuarios');
    else if (path === '/admin/maquinas') setActiveMenu('maquinas');
    else if (path === '/admin/ejercicios') setActiveMenu('ejercicios');
    else if (path === '/admin/rutinas') setActiveMenu('rutinas');
    else if (path === '/admin/accesos') setActiveMenu('accesos');
    else if (path === '/admin/entrenamientos') setActiveMenu('entrenamientos');
    else if (path === '/admin/entrenados') setActiveMenu('entrenados');
    else if (path === '/admin/roles') setActiveMenu('roles');
    else if (path === '/admin/evolucion') setActiveMenu('evolucion');
    else if (path === '/admin/qr') setActiveMenu('qr');
    else if (path === '/admin/configuracion') setActiveMenu('configuracion');
    else if (path === '/admin/notificaciones') setActiveMenu('notificaciones');
    else if (path === '/admin/historial-cambios') setActiveMenu('historial-cambios');
    else if (path === '/admin/membresias') setActiveMenu('membresias');
    else if (path === '/admin/pagos') setActiveMenu('pagos');
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    if (isMobile) setSidebarOpen(false);
    
    switch (menuId) {
      case 'dashboard':
        navigate('/admin/dashboard');
        break;
      case 'usuarios':
        navigate('/admin/usuarios');
        break;
      case 'maquinas':
        navigate('/admin/maquinas');
        break;
      case 'ejercicios':
        navigate('/admin/ejercicios');
        break;
      case 'rutinas':
        navigate('/admin/rutinas');
        break;
      case 'accesos':
        navigate('/admin/accesos');
        break;
      case 'entrenamientos':
        navigate('/admin/entrenamientos');
        break;
      case 'entrenados':
        navigate('/admin/entrenados');
        break;
      case 'roles':
        navigate('/admin/roles');
        break;
      case 'evolucion':
        navigate('/admin/evolucion');
        break;
      case 'qr':
        navigate('/admin/qr');
        break;
      case 'configuracion':
        navigate('/admin/configuracion');
        break;
      case 'notificaciones':
        navigate('/admin/notificaciones');
        break;
      case 'historial-cambios':
        navigate('/admin/historial-cambios');
        break;
      case 'membresias':
        navigate('/admin/membresias');
        break;
      case 'pagos':
        navigate('/admin/pagos');
        break;
      default:
        console.log(`Navegando a: ${menuId}`);
    }
  };

  const goToProfile = () => {
    navigate('/perfil');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const icons = {
    dashboard: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    users: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    machines: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    ejercicios: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    rutinas: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    access: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
      </svg>
    ),
    training: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    trainers: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    roles: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    evolution: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3m0 0l3 3m-3-3v12M3 21h18M9 21v-4m3 4v-8m3 8v-6" />
      </svg>
    ),
    qr: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    settings: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    notificaciones: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    historialCambios: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    membresias: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    pagos: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
    { id: 'usuarios', label: 'Usuarios', icon: icons.users },
    { id: 'maquinas', label: 'Máquinas', icon: icons.machines },
    { id: 'ejercicios', label: 'Ejercicios', icon: icons.ejercicios },
    { id: 'rutinas', label: 'Rutinas', icon: icons.rutinas },
    { id: 'entrenamientos', label: 'Entrenamientos', icon: icons.training },
    { id: 'entrenados', label: 'Entrenados', icon: icons.trainers },
    { id: 'accesos', label: 'Accesos', icon: icons.access },
    { id: 'qr', label: 'QR', icon: icons.qr },
    { id: 'membresias', label: 'Membresías', icon: icons.membresias },
    { id: 'pagos', label: 'Pagos', icon: icons.pagos },
    { id: 'notificaciones', label: 'Notificaciones', icon: icons.notificaciones },
    { id: 'configuracion', label: 'Configuración', icon: icons.settings },
    { id: 'historial-cambios', label: 'Historial', icon: icons.historialCambios },
  ];

  return (
    <div className="min-h-screen bg-gym-dark flex flex-col md:flex-row text-gym-white">
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black/70 z-40 backdrop-blur-xs" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:sticky top-0 left-0 z-50 w-72 bg-gym-dark-secondary border-r border-gym-gray/10 h-screen transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between h-16 px-6 border-b border-gym-gray/10">
              <span className="text-xl font-black bg-gradient-to-r from-gym-neon to-gym-neon/70 bg-clip-text text-transparent tracking-wide">
                GYM-FITNESS
              </span>
              {isMobile && (
                <button onClick={() => setSidebarOpen(false)} className="text-gym-gray-light hover:text-gym-neon transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <nav className="px-3 py-4 overflow-y-auto max-h-[calc(100vh-160px)]">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mb-1 ${activeMenu === item.id ? 'bg-gym-neon/10 text-gym-neon border border-gym-neon/20 shadow-[0_0_15px_rgba(33,241,168,0.03)]' : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-neon'}`}
                >
                  <span className={`flex-shrink-0 ${activeMenu === item.id ? 'text-gym-neon' : 'text-gym-gray-light'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="px-3 py-4 border-t border-gym-gray/10 bg-gym-dark-secondary">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gym-gray-light hover:bg-gym-danger/10 hover:text-gym-danger font-bold transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 z-30 bg-gym-dark-secondary/90 backdrop-blur-md border-b border-gym-gray/10 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            <div className="flex items-center gap-3">
              <button onClick={toggleSidebar} className="md:hidden text-gym-gray-light hover:text-gym-neon transition-colors p-2 -ml-2" aria-label="Abrir menu">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-gym-white font-black text-lg tracking-tight truncate">
                {menuItems.find(item => item.id === activeMenu)?.label || 'Dashboard'}
              </h2>
            </div>

            <button onClick={goToProfile} className="flex items-center gap-2 text-gym-gray-light hover:text-gym-neon transition-colors text-sm font-semibold">
              <span className="hidden sm:inline">Mi Perfil</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gym-dark">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutAdmin;