import { useAuth } from '../../api/hooks/useAuth';
import { useMercaderias, useCotizaciones } from '../../api/hooks/useComercial';
import { formatQuetzales } from '../../types/database';
import ModuleTitle from '../../components/ModuleTitle';
import StatusCard from '../../components/ui/StatusCard';
import { Icons } from '../../components/Icons';
import { useNavigate } from 'react-router-dom';
import { maskPath } from '../../routes/routeMap';

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: mercaderias = [] } = useMercaderias();
  const { data: cotizaciones = [] } = useCotizaciones();

  const totalMercaderias = mercaderias.length;
  const stockBajo = mercaderias.filter((m) => m.stock_actual <= 10).length;
  const cotizacionesPendientes = cotizaciones.filter((c) => c.estado === 'Pendiente').length;
  const totalCotizado = cotizaciones.reduce((s, c) => s + (Number(c.total_quetzales) || 0), 0);

  const isStaffMember = user?.rol === 'sistemas' || user?.rol === 'administrador';

  return (
    <div className="dashboard-home">
      <ModuleTitle title="Panel de Control Comercial" />

      {/* Tarjetas de Métricas */}
      <div className="status-grid" style={{ marginTop: '1.5rem' }}>
        <StatusCard
          label="Mercaderías en Catálogo"
          value={totalMercaderias}
          icon={<Icons.Package />}
          sub="Insumos registrados en Supabase"
          onClick={() => navigate(maskPath('/dashboard/catalogo-admin'))}
        />
        <StatusCard
          label="Stock Mínimo / Alerta"
          value={stockBajo}
          icon={<Icons.AlertTriangle />}
          sub="Mercaderías con 10 o menos unidades"
          accentColor={stockBajo > 0 ? '#ef4444' : '#228be6'}
          onClick={() => navigate(maskPath(isStaffMember ? '/dashboard/inventario' : '/dashboard/catalogo-admin'))}
        />
        <StatusCard
          label="Cotizaciones Pendientes"
          value={cotizacionesPendientes}
          icon={<Icons.CreditCard />}
          sub="Esperando aprobación o gestión"
          onClick={() => navigate(maskPath('/dashboard/bandeja-cotizaciones'))}
        />
        <StatusCard
          label="Total en Cotizaciones"
          value={formatQuetzales(totalCotizado)}
          icon={<Icons.BarChart />}
          sub="Valor total acumulado"
        />
      </div>

      {/* Acciones Rápidas */}
      <div className="dashboard-section" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Acciones y Módulos Disponibles
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div
            onClick={() => navigate(maskPath('/dashboard/catalogo-admin'))}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid var(--border-soft)',
              background: 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(200, 90, 50, 0.1)', color: '#C85A32' }}>
              <Icons.Package size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Catálogo de Mercaderías</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Consulta completa con precios y stock</div>
            </div>
          </div>

          <div
            onClick={() => navigate(maskPath('/dashboard/bandeja-cotizaciones'))}
            style={{
              padding: '1.25rem',
              borderRadius: '12px',
              border: '1px solid var(--border-soft)',
              background: 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Icons.CreditCard size={24} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>Bandeja de Cotizaciones</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Gestión de cotizaciones Web y Telegram</div>
            </div>
          </div>

          {isStaffMember && (
            <div
              onClick={() => navigate(maskPath('/dashboard/inventario'))}
              style={{
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid var(--border-soft)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>
                <Icons.Clipboard size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>Gestión de Inventario</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Control de existencias y valorizaciones</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
