// sconst Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'dashboard' },
    { name: 'Análisis', href: '/model-analysis', icon: 'analytics' },
    { name: 'Predicciones', href: '/predictions', icon: 'predictions' },
    { name: 'Datos', href: '/data', icon: 'data' },
    { name: 'Config', href: '/settings', icon: 'settings' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      dashboard: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      analytics: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      predictions: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      data: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      settings: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };
    return icons[iconName] || icons.dashboard;
  };ts/Navbar.js - Diseño UI/UX Profesional
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊', description: 'Vista general' },
    { name: 'Análisis', href: '/model-analysis', icon: '�', description: 'ML profundo' },
    { name: 'Predicciones', href: '/predictions', icon: '🔮', description: 'Tiempo real' },
    { name: 'Datos', href: '/data', icon: '📈', description: 'Explorar' },
    { name: 'Config', href: '/settings', icon: '⚙️', description: 'Sistema' },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo Minimalista */}
          <Link to="/" className="navbar-brand">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-900">MegaMercado</span>
            <span className="text-sm bg-primary-100 text-primary-600 px-2 py-0.5 rounded font-medium">AI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="navbar-nav hidden md:flex">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {getIcon(item.icon)}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Status & Actions */}
          <div className="flex items-center space-x-4">
            <div className="status-indicator hidden lg:flex">
              <div className="status-dot"></div>
              <span>Online</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-primary-50 text-primary-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {getIcon(item.icon)}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
            
            {/* Header principal */}
            <div className="flex items-center justify-between h-20">
              
              {/* Logo ultra premium */}
              <div className="flex items-center space-x-4 group cursor-pointer">
                <div className="relative">
                  <div className="w-14 h-14 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 transition-all duration-500">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                      <span className="text-white font-black text-xl">🏪</span>
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg">
                    <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-3xl font-black bg-gradient-to-r from-white via-white to-gray-200 bg-clip-text text-transparent tracking-tight">
                      MegaMercado
                    </h1>
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full shadow-lg">
                      AI
                    </span>
                  </div>
                  <p className="text-white/80 text-sm font-semibold tracking-wide">
                    Sistema Inteligente de Predicción
                  </p>
                </div>
              </div>

              {/* Desktop Navigation Ultra Premium */}
              <div className="hidden lg:flex items-center space-x-1 bg-white/15 backdrop-blur-2xl rounded-3xl p-2 border border-white/25 shadow-2xl">
                {navigation.map((item, index) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        relative group flex items-center space-x-3 px-5 py-4 rounded-2xl font-bold transition-all duration-500 transform
                        ${isActive 
                          ? 'bg-white/40 backdrop-blur-xl text-white shadow-xl scale-105' 
                          : 'text-white/85 hover:text-white hover:bg-white/20 hover:scale-105'
                        }
                      `}
                    >
                      {/* Efecto de fondo activo */}
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-sm"></div>
                      )}
                      
                      <div className={`
                        relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-500 group-hover:scale-110
                        ${isActive 
                          ? 'bg-white/30 shadow-lg' 
                          : 'bg-white/15 group-hover:bg-white/25'
                        }
                      `}>
                        <span className="text-xl filter drop-shadow-lg">{item.icon}</span>
                      </div>
                      
                      <div className="hidden xl:block relative z-10">
                        <div className="text-sm font-black leading-tight tracking-wide">
                          {item.name}
                        </div>
                        <div className="text-xs opacity-75 font-medium leading-tight">
                          {item.description}
                        </div>
                      </div>

                      {/* Indicador activo mejorado */}
                      {isActive && (
                        <>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg"></div>
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-1 bg-white/50 rounded-full animate-pulse"></div>
                        </>
                      )}
                      
                      {/* Efecto hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </Link>
                  );
                })}
              </div>

              {/* Indicadores Premium y mobile menu */}
              <div className="flex items-center space-x-4">
                
                {/* Desktop status premium */}
                <div className="hidden xl:flex items-center space-x-3">
                  <div className="flex items-center space-x-4 bg-white/20 backdrop-blur-2xl rounded-3xl px-6 py-3 border border-white/30 shadow-2xl">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg"></div>
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                      <span className="text-white font-bold text-sm tracking-wide">Online</span>
                    </div>
                    <div className="w-px h-5 bg-gradient-to-b from-transparent via-white/40 to-transparent"></div>
                    <div className="text-white/90 text-sm">
                      <span className="font-black text-yellow-300">94.2%</span>
                      <span className="font-semibold ml-1">Precisión</span>
                    </div>
                  </div>
                  
                  {/* Notificación badge */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/25 cursor-pointer hover:bg-white/25 transition-all duration-300 group">
                      <span className="text-white text-xl group-hover:scale-110 transition-transform duration-300">🔔</span>
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">3</div>
                    </div>
                  </div>
                </div>

                {/* Mobile menu button premium */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 text-white hover:bg-white/30 transition-all duration-300 shadow-xl group"
                >
                  <div className="w-6 h-6 flex flex-col justify-center items-center">
                    <span className={`block h-1 w-6 bg-current rounded-full transition-all duration-300 group-hover:bg-yellow-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : '-translate-y-1'}`}></span>
                    <span className={`block h-1 w-6 bg-current rounded-full transition-all duration-300 group-hover:bg-yellow-300 ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                    <span className={`block h-1 w-6 bg-current rounded-full transition-all duration-300 group-hover:bg-yellow-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : 'translate-y-1'}`}></span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Navigation Premium */}
            {isMobileMenuOpen && (
              <div className="lg:hidden pb-6 animate-fade-in">
                <div className="bg-white/20 backdrop-blur-2xl rounded-3xl p-4 border border-white/30 shadow-2xl space-y-2">
                  {navigation.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          relative flex items-center space-x-4 px-5 py-4 rounded-2xl font-semibold transition-all duration-500 transform
                          ${isActive 
                            ? 'bg-white/40 text-white scale-105 shadow-xl' 
                            : 'text-white/85 hover:text-white hover:bg-white/25 hover:scale-105'
                          }
                        `}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className={`
                          flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
                          ${isActive 
                            ? 'bg-white/30 shadow-lg' 
                            : 'bg-white/15'
                          }
                        `}>
                          <span className="text-2xl filter drop-shadow-lg">{item.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className="font-black text-lg leading-tight">{item.name}</div>
                          <div className="text-sm opacity-80 font-medium">{item.description}</div>
                        </div>
                        
                        {isActive && (
                          <div className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full shadow-lg animate-pulse"></div>
                        )}
                      </Link>
                    );
                  })}
                  
                  {/* Mobile status */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="flex items-center justify-between px-5 py-3 bg-white/15 rounded-2xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-white font-bold">Sistema Online</span>
                      </div>
                      <span className="text-yellow-300 font-black">94.2%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Línea de progreso premium animada */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-full shadow-lg"
               style={{ 
                 width: '100%',
                 background: 'linear-gradient(90deg, #fbbf24, #f97316, #ec4899, #8b5cf6)',
                 backgroundSize: '200% 100%',
                 animation: 'shimmer 3s ease-in-out infinite'
               }}>
          </div>
        </div>
        
        {/* Efecto de brillo sutil */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm"></div>
      </nav>
      
      {/* Spacer for fixed navbar */}
      <div className="h-24"></div>
    </>
  );
};

export default Navbar;