import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routeMap';
import PublicContainer from '../../components/layout/PublicContainer';
import { useCotizaciones } from '../../api/hooks/useComercial';
import { formatQuetzales } from '../../types/database';
import { createMaskedUrl } from '../../utils/routerHasher';
import AdminTable from '../../components/ui/AdminTable';

export default function CotizacionesPage() {
  const navigate = useNavigate();
  const { data: cotizaciones = [], isLoading } = useCotizaciones();

  const headers = ['Código Cotización', 'Institución / Cliente', 'Fecha de Emisión', 'Estado', 'Total Quetzales'];

  const getStatusBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'aprobada':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>Aprobada</span>;
      case 'pendiente':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>Pendiente</span>;
      case 'anulada':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>Anulada</span>;
      default:
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>{estado}</span>;
    }
  };

  return (
    <PublicContainer
      badge="Ventas y Cotizaciones"
      title="Cotizaciones Comerciales"
      description="Consulta de cotizaciones generadas tanto desde la plataforma Web como por bot de Telegram."
    >
      <div style={{ marginTop: '1.5rem' }}>
        <AdminTable
          headers={headers}
          isLoading={isLoading}
          emptyMessage="No se encontraron cotizaciones registradas."
        >
          {cotizaciones.map((c) => (
            <tr
              key={c.id}
              id={`cotizacion-${c.codigo_cotizacion}`}
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(createMaskedUrl(ROUTES.cotizaciones, c.id))}
            >
              <td>
                <strong style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--text-primary)' }}>
                  {c.codigo_cotizacion}
                </strong>
              </td>
              <td style={{ fontWeight: 600 }}>
                {c.clientes?.nombre_institucion || `Cliente #${c.cliente_id}`}
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>
                {new Date(c.fecha_emision).toLocaleDateString('es-GT')}
              </td>
              <td>{getStatusBadge(c.estado)}</td>
              <td style={{ fontWeight: 700 }}>{formatQuetzales(c.total_quetzales)}</td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </PublicContainer>
  );
}
