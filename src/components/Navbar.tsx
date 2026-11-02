import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/hooks/useAuth';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import { Icons } from './Icons';
import { maskPath, plainPath } from '../routes/routeMap';

export default function Navbar() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleOpenRegister = () => {
      setIsLoginOpen(false);
      setIsRegisterOpen(true);
    };
    window.addEventListener('openRegisterModal', handleOpenRegister);
    return () => window.removeEventListener('openRegisterModal', handleOpenRegister);
  }, []);

  const handleAuthAction = (action: 'login' | 'register') => {
    if (isAuthenticated && user) {
      // Si ya está logueado, redirigir al dashboard
      if (user.rol === 'admin') {
        navigate(maskPath('/dashboard/admin-tokens'));
      } else {
        navigate(maskPath('/dashboard/inicio'));
      }
    } else {
      // Si no, abrir modales
      setIsMenuOpen(false);
      if (action === 'login') {
        setIsRegisterOpen(false);
        setIsLoginOpen(true);
      } else {
        setIsLoginOpen(false);
        setIsRegisterOpen(true);
      }
    }
  };

  const openLogin = () => handleAuthAction('login');
  const openRegister = () => handleAuthAction('register');

  const current = plainPath(location.pathname);
  const isActive = (path: string) => current === path || (path !== '/' && current.startsWith(path + '/'));

  const navLinks = [
    { name: 'Inicio', path: '/', Icon: Icons.Home },
    { name: 'Catálogo', path: '/catalogo', Icon: Icons.Info },
  ];

  return (
    <>
      <nav className="nav">
        <div className="nav-mobile-left">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <Icons.X size={24} /> : <Icons.Menu size={24} />}
          </button>
        </div>

        <ul className="nav-links">
          {navLinks.map(link => (
            <li key={link.path}>
              <Link to={maskPath(link.path)} className={isActive(link.path) ? 'active' : ''}>
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-right" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn-ghost" onClick={openLogin}>
            {isAuthenticated ? 'Ir al Dashboard' : 'Iniciar sesión'}
          </button>
          <button className="btn-solid" onClick={openRegister}>
            {isAuthenticated ? 'Mi Cuenta' : 'Cotiza por Telegram'}
          </button>
        </div>
      </nav>

      {/* Sidebar Mobile */}
      <div className={`mobile-sidebar-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <aside className={`mobile-sidebar ${isMenuOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="sidebar-header-mobile">
            <span className="logo-text">MENÚ</span>
            <button className="close-sidebar" onClick={() => setIsMenuOpen(false)}>
              <Icons.X size={24} />
            </button>
          </div>

          <ul className="mobile-nav-list">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link
                  to={maskPath(link.path)}
                  className={isActive(link.path) ? 'active' : ''}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.Icon size={20} className="nav-icon-svg" />
                  <span>{link.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="sidebar-footer-mobile">
            <button className="btn-sidebar-login" onClick={openLogin}>Iniciar sesión</button>
            <button className="btn-sidebar-register" onClick={openRegister}>Regístrate aquí</button>
          </div>
        </aside>
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={openRegister}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={openLogin}
      />
    </>
  );
}