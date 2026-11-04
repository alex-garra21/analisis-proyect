import { useEffect } from 'react';
import { maskPath, plainPath } from '../routes/routeMap';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../api/hooks/useAuth';
import { useDashboardTitle } from '../utils/DashboardTitleContext';
import AdminBadge from './ui/AdminBadge';
import { Icons } from './Icons';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user, session, isLoading, isError, refetchProfile } = useAuth();
  const { title } = useDashboardTitle();
  const location = useLocation();

  useEffect(() => {
    // 1. Redirigir al home si no hay sesión activa
    if (!isLoading && !session) {
      navigate('/');
      return;
    }

    // 2. Control de Acceso por Módulos y Roles:
    // roles: 'sistemas', 'administrador', 'colaborador'
    if (!isLoading && user) {
      const path = plainPath(location.pathname);
      const isSistemasPath = path.includes('/usuarios');
      const isAdminPath = path.includes('/inventario') || path.includes('/categorias');

      const isSistemasUser = user.rol === 'sistemas' || user.correo === 'salexanderr2@gmail.com';
      const isAdminUser = user.rol === 'administrador';

      // Acceso a /usuarios solo para 'sistemas'
      if (isSistemasPath && !isSistemasUser) {
        navigate(maskPath('/dashboard/inicio'));
        return;
      }

      // Acceso a /inventario y /categorias solo para 'sistemas' y 'administrador'
      if (isAdminPath && !isSistemasUser && !isAdminUser) {
        navigate(maskPath('/dashboard/inicio'));
        return;
      }
    }
  }, [session, user, isLoading, navigate, location.pathname]);

  if (isError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '1.5rem' }}><Icons.AlertTriangle size={48} /></div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'Source Sans 3' }}>Error de Conexión</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '340px' }}>No se pudo conectar con Supabase. Verifica tu red o credenciales.</p>
        <button
          onClick={() => refetchProfile()}
          style={{ padding: '0.8rem 2rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
        >
          Reintentar sincronización
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', gap: '15px' }}>
        <div className="loader-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 179, 237, 0.2)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Sincronizando sesión y rol...</div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  const roleLabel = user.rol === 'sistemas'
    ? 'SISTEMAS'
    : user.rol === 'administrador'
    ? 'ADMINISTRADOR'
    : 'COLABORADOR';

  const logicalPath = plainPath(location.pathname);
  const ROUTE_TITLES: Record<string, string> = {
    '/dashboard': 'Inicio',
    '/dashboard/inicio': 'Inicio',
    '/dashboard/perfil': 'Mi Perfil',
    '/dashboard/catalogo-admin': 'Catálogo de Mercaderías',
    '/dashboard/bandeja-cotizaciones': 'Bandeja de Cotizaciones',
    '/dashboard/inventario': 'Gestión de Inventario',
    '/dashboard/categorias': 'Gestión de Categorías',
    '/dashboard/clientes': 'Gestión de Clientes',
    '/dashboard/usuarios': 'Gestión de Usuarios y Roles',
  };
  const activeTitle = ROUTE_TITLES[logicalPath] || title;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="module-title">{activeTitle}</h1>
          </div>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AdminBadge variant={user.rol === 'sistemas' ? 'info' : user.rol === 'administrador' ? 'success' : 'neutral'} dot>
              {roleLabel}
            </AdminBadge>
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
        <footer className="dashboard-footer">
          <span className="footer-copyright">© 2026 Comercial Flores del Campo — Gestión de Inventario y Cotizaciones</span>
        </footer>
      </main>
    </div>
  );
}
