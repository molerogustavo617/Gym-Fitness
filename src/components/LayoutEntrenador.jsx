// src/components/LayoutEntrenador.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const LayoutEntrenador = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser || currentUser.idrol !== 4) {
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
    if (path === '/entrenador/dashboard') setActiveMenu('dashboard');
    else if (path === '/entrenador/clientes' || path.startsWith('/entrenador/clientes/')) setActiveMenu('clientes');
    else if (path === '/entrenador/ejercicios') setActiveMenu('ejercicios');
    else if (path === '/entrenador/rutinas' || path.startsWith('/entrenador/rutinas/')) setActiveMenu('rutinas');
    else if (path === '/entrenador/rutina-del-dia') setActiveMenu('rutina-del-dia');
    else if (path === '/entrenador/entrenamientos') setActiveMenu('entrenamientos');
    else if (path === '/entrenador/evolucion') setActiveMenu('evolucion');
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
        navigate('/entrenador/dashboard');
        break;
      case 'clientes':
        navigate('/entrenador/clientes');
        break;
      case 'ejercicios':
        navigate('/entrenador/ejercicios');
        break;
      case 'rutinas':
        navigate('/entrenador/rutinas');
        break;
      case 'rutina-del-dia':
        navigate('/entrenador/rutina-del-dia');
        break;
      case 'entrenamientos':
        navigate('/entrenador/entrenamientos');
        break;
      case 'evolucion':
        navigate('/entrenador/evolucion');
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
    clientes: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    ejercicios: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    rutinas: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    'rutina-del-dia': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3 3 6-6" />
      </svg>
    ),
    entrenamientos: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    evolucion: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3m0 0l3 3m-3-3v12M3 21h18M9 21v-4m3 4v-8m3 8v-6" />
      </svg>
    ),
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
    { id: 'clientes', label: 'Mis Clientes', icon: icons.clientes },
    { id: 'ejercicios', label: 'Ejercicios', icon: icons.ejercicios },
    { id: 'rutinas', label: 'Rutinas', icon: icons.rutinas },
    { id: 'rutina-del-dia', label: 'Rutina del Día', icon: icons['rutina-del-dia'] },
    { id: 'entrenamientos', label: 'Entrenamientos', icon: icons.entrenamientos },
    { id: 'evolucion', label: 'Evolución', icon: icons.evolucion },
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
                ENTRENADOR
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 mb-1 ${
                    activeMenu === item.id 
                      ? 'bg-gym-neon/10 text-gym-neon border border-gym-neon/20 shadow-[0_0_15px_rgba(33,241,168,0.03)]' 
                      : 'text-gym-gray-light hover:bg-gym-card hover:text-gym-neon'
                  }`}
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

export default LayoutEntrenador;