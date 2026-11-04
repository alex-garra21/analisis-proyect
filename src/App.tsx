import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { supabase } from './utils/supabase';

// Layout Principal
import Layout from './components/Layout';

// Páginas Públicas
const Home = lazy(() => import('./pages/public/Home'));
const CatalogoPage = lazy(() => import('./pages/public/CatalogoPage'));
const ProductoDetallePage = lazy(() => import('./pages/public/ProductoDetallePage'));
const CotizacionesPage = lazy(() => import('./pages/public/CotizacionesPage'));
const CotizacionDetallePage = lazy(() => import('./pages/public/CotizacionDetallePage'));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage'));
const DeactivatedPage = lazy(() => import('./pages/public/DeactivatedPage'));

// Páginas Privadas (Dashboard)
import DashboardLayout from './components/DashboardLayout';
const DashboardHome = lazy(() => import('./pages/private/DashboardHome'));
const ProfileModule = lazy(() => import('./modules/general/perfil/ProfileModule'));
const CatalogoAdminPage = lazy(() => import('./pages/private/CatalogoAdminPage'));
const InventarioPage = lazy(() => import('./pages/private/InventarioPage'));
const BandejaCotizacionesPage = lazy(() => import('./pages/private/BandejaCotizacionesPage'));
const UsersModule = lazy(() => import('./modules/admin/usuarios/UsersModule'));

import { DashboardTitleProvider } from './utils/DashboardTitleContext';
import { ROUTES, seg, plainPath } from './routes/routeMap';
import { useAuth, useGlobalAuthListener } from './api/hooks/useAuth';

const PageLoader = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    width: '100%',
    color: 'var(--text-secondary)'
  }}>
    <div className="loader-spinner" style={{
      width: '40px',
      height: '40px',
      border: '3px solid rgba(99, 179, 237, 0.2)',
      borderTop: '3px solid var(--accent-primary)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }} />
    <span style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>Cargando módulo...</span>
    <style>{`
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

function AuthHandler() {
  const navigate = useNavigate();
  const { user } = useAuth();
  useGlobalAuthListener();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        localStorage.setItem('is_recovering_pw', 'true');
        navigate(ROUTES.resetPassword);
      }

      if (localStorage.getItem('is_recovering_pw') === 'true' &&
          plainPath(window.location.pathname).startsWith('/dashboard')) {
        navigate(ROUTES.resetPassword);
      }
    });

    if (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token=') || window.location.search.includes('type=recovery')) {
      localStorage.setItem('is_recovering_pw', 'true');
      if (window.location.pathname !== ROUTES.resetPassword) {
        setTimeout(() => navigate(ROUTES.resetPassword), 100);
      }
    }

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Bloqueo de seguridad si el estado de usuario está inactivo (estado = false)
  useEffect(() => {
    if (user && user.estado === false) {
      if (window.location.pathname !== ROUTES.cuentaDesactivada) {
        navigate(ROUTES.cuentaDesactivada);
      }
    } else if (window.location.pathname === ROUTES.cuentaDesactivada) {
      navigate('/');
    }
  }, [user?.estado, navigate]);

  return null;
}

function NotFoundOrRedirect() {
  return (
    <div style={{ padding: '4rem 2rem', color: 'var(--text-primary)', textAlign: 'center' }}>
      <h2>Página no encontrada</h2>
      <p style={{ color: 'var(--text-secondary)' }}>El enlace solicitado no es válido.</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthHandler />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path={seg('catalogo')} element={<CatalogoPage />} />
            <Route path={`${seg('catalogo')}/:maskedId`} element={<ProductoDetallePage />} />
            <Route path={seg('cotizaciones')} element={<CotizacionesPage />} />
            <Route path={`${seg('cotizaciones')}/:maskedId`} element={<CotizacionDetallePage />} />
            <Route path="*" element={<NotFoundOrRedirect />} />
          </Route>

          <Route path={seg('reset-password')} element={<ResetPasswordPage />} />
          <Route path={seg('cuenta-desactivada')} element={<DeactivatedPage />} />

          {/* Rutas Privadas / Protegidas (Dashboard Comercial) */}
          <Route
            path={seg('dashboard')}
            element={
              <DashboardTitleProvider>
                <DashboardLayout />
              </DashboardTitleProvider>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path={seg('inicio')} element={<DashboardHome />} />
            <Route path={seg('perfil')} element={<ProfileModule />} />
            <Route path={seg('catalogo-admin')} element={<CatalogoAdminPage />} />
            <Route path={seg('inventario')} element={<InventarioPage />} />
            <Route path={seg('bandeja-cotizaciones')} element={<BandejaCotizacionesPage />} />
            <Route path={seg('usuarios')} element={<UsersModule />} />
            <Route path="*" element={<NotFoundOrRedirect />} />
          </Route>

          <Route path="*" element={<NotFoundOrRedirect />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
