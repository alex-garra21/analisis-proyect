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
    // 1. Redirigir al login si no hay sesión
    if (!isLoading && !session) {
      navigate('/');
      return;
    }

    // 2. Protección de rutas por ROL
    if (!isLoading && user) {
      const path = plainPath(location.pathname);
      const isAdminOnlyPath =
        path.includes('admin-usuarios') ||
        path.includes('admin-asistencia') ||
        path.includes('admin-reportes') ||
        path.includes('admin-agenda') ||
        path.includes('admin-config-agenda');

      const isStaffPath = path.includes('admin-tokens');

      // Si es ruta de Admin y no es admin -> Fuera
      if (isAdminOnlyPath && user.rol !== 'admin') {
        navigate(maskPath('/dashboard/inicio'));
      }

      // Si es ruta de Tokens y no es staff (admin o colab) -> Fuera
      if (isStaffPath && user.rol !== 'admin' && user.rol !== 'colaborador') {
        navigate(maskPath('/dashboard/inicio'));
      }
    }
  }, [session, user, isLoading, navigate, location.pathname]);

  // Si hubo un error cargando el perfil (común en conexiones inestables de móvil)
  if (isError) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', padding: '2rem', textAlign: 'center' }}>
        <div style={{ color: '#ef4444', marginBottom: '1.5rem' }}><Icons.AlertTriangle size={48} /></div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'Source Sans 3' }}>Error de Conexión</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '300px' }}>No pudimos sincronizar tu perfil. Esto puede pasar por una conexión inestable.</p>
        <button
          onClick={() => refetchProfile()}
          style={{ padding: '0.8rem 2rem', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
        >
          Reintentar ahora
        </button>
      </div>
    );
  }

  // Si está cargando, mostramos spinner
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', gap: '15px' }}>
        <div className="loader-spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 179, 237, 0.2)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Sincronizando sesión...</div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Si llegamos aquí y no hay usuario, algo falló (pero ya no devolvemos null a ciegas)
  if (!user) return null;

  const isPaid = user.pagoValidado;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <h1 className="module-title">{title}</h1>
          </div>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isPaid ? (
              <AdminBadge variant="success" dot>PAGO VALIDADO</AdminBadge>
            ) : (
              <AdminBadge variant="warning" dot>PAGO PENDIENTE</AdminBadge>
            )}
          </div>
        </header>
        <div className="dashboard-content">
          <Outlet />
        </div>
        <footer className="dashboard-footer">
          <span className="footer-copyright">© 2026 Universidad Mariano Gálvez de Guatemala</span>
        </footer>
      </main>
    </div>
  );
}
