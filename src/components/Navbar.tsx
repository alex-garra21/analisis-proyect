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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  // Cierra el menú móvil al navegar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLoginClick = () => {
    if (isAuthenticated && user) {
      navigate(maskPath('/dashboard/inicio'));
    } else {
      setIsRegisterOpen(false);
      setIsLoginOpen(true);
    }
  };

  const handleRegisterClick = () => {
    if (isAuthenticated && user) {
      navigate(maskPath('/dashboard/perfil'));
    } else {
      setIsLoginOpen(false);
      setIsRegisterOpen(true);
    }
  };

  const handleMobileLogin = () => {
    setIsMobileMenuOpen(false);
    handleLoginClick();
  };

  const handleMobileRegister = () => {
    setIsMobileMenuOpen(false);
    handleRegisterClick();
  };

  const current = plainPath(location.pathname);
  const isActive = (path: string) => current === path || (path !== '/' && current.startsWith(path + '/'));

  const navLinks = [
    { name: 'Inicio', path: '/' },
    { name: 'Catálogo', path: '/catalogo' },
  ];

  return (
    <>
      <nav className="nav" style={{ width: '100%', position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-surface, #ffffff)', borderBottom: '1px solid var(--border-soft, #E6DFD5)' }}>
        <div className="nav-container" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          {/* Lado Izquierdo: Logotipo y Enlaces (Desktop) */}
          <div className="nav-left-group" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link
              to={maskPath('/')}
              className="nav-logo"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--accent-primary, #C85A32)',
                letterSpacing: '-0.5px',
                whiteSpace: 'nowrap'
              }}
            >
              <span className="logo-main" style={{ color: 'var(--accent-primary, #C85A32)' }}>
                COMERCIAL FLORES DEL CAMPO
              </span>
            </Link>

            <ul className="nav-links desktop-nav hidden md:flex" style={{ alignItems: 'center', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={maskPath(link.path)}
                    className={isActive(link.path) ? 'active' : ''}
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      color: isActive(link.path) ? 'var(--accent-primary, #C85A32)' : 'var(--text-secondary, #7C6E67)',
                      borderBottom: isActive(link.path) ? '2px solid var(--accent-primary, #C85A32)' : '2px solid transparent',
                      paddingBottom: '4px',
                      transition: 'color 0.2s, border-color 0.2s'
                    }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lado Derecho: Botones de Acción (Desktop) */}
          <div className="nav-right desktop-nav hidden md:flex" style={{ alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleLoginClick}
                >
                  Ir al Dashboard
                </button>
                <button
                  type="button"
                  className="btn-solid"
                  onClick={handleRegisterClick}
                >
                  Mi Cuenta
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={handleLoginClick}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  className="btn-solid"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={handleRegisterClick}
                >
                  <Icons.Telegram size={16} />
                  <span>Cotiza por Telegram</span>
                </button>
              </>
            )}
          </div>

          {/* Botón Hamburguesa Móvil (Visible solo en pantallas pequeñas) */}
          <button
            type="button"
            className="nav-mobile-toggle flex md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {isMobileMenuOpen ? <Icons.X size={22} /> : <Icons.Menu size={22} />}
          </button>
        </div>

        {/* Menú Desplegable Móvil */}
        {isMobileMenuOpen && (
          <div className="nav-mobile-dropdown md:hidden">
            <ul className="nav-mobile-links">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={maskPath(link.path)}
                    className={isActive(link.path) ? 'active' : ''}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="nav-mobile-actions">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleMobileLogin}
                  >
                    Ir al Dashboard
                  </button>
                  <button
                    type="button"
                    className="btn-solid"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleMobileRegister}
                  >
                    Mi Cuenta
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn-ghost"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={handleMobileLogin}
                  >
                    Iniciar sesión
                  </button>
                  <button
                    type="button"
                    className="btn-solid"
                    style={{ width: '100%', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    onClick={handleMobileRegister}
                  >
                    <Icons.Telegram size={16} />
                    <span>Cotiza por Telegram</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Modales de Autenticación */}
      {isLoginOpen && (
        <LoginModal
          isOpen={isLoginOpen}
          onClose={() => setIsLoginOpen(false)}
          onSwitchToRegister={() => {
            setIsLoginOpen(false);
            setIsRegisterOpen(true);
          }}
        />
      )}

      {isRegisterOpen && (
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onSwitchToLogin={() => {
            setIsRegisterOpen(false);
            setIsLoginOpen(true);
          }}
        />
      )}
    </>
  );
}
