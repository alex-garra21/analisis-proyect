import { useState } from 'react';
import { useCotizaciones } from '../../api/hooks/useComercial';
import { formatQuetzales } from '../../types/database';
import AdminTable from '../../components/ui/AdminTable';
import { Icons } from '../../components/Icons';
import CotizacionManualModal from '../../modules/operaciones/cotizaciones/CotizacionManualModal';
import CotizacionDetalleModal from '../../modules/operaciones/cotizaciones/CotizacionDetalleModal';

/**
 * Bandeja de Cotizaciones (Ruta Protegida):
 * Consulta directa a public.cotizaciones vinculada con public.clientes y public.usuarios.
 * La visualización de detalle está blindada internamente en modal sin exponer rutas públicas.
 */
export default function BandejaCotizacionesPage() {
  const { data: cotizaciones = [], isLoading } = useCotizaciones();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCotizacionId, setSelectedCotizacionId] = useState<number | null>(null);

  const pendientes = cotizaciones.filter((c) => c.estado === 'Pendiente');

  const headers = [
    'Código Cotización',
    'Institución / Cliente',
    'Canal de Origen',
    'Estado',
    'Total Quetzales',
    'Acción',
  ];

  const getStatusBadge = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case 'aprobada':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>Aprobada</span>;
      case 'rechazada':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>Rechazada</span>;
      case 'pendiente':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(245, 158, 11, 0.1)', color: '#d97706' }}>Pendiente</span>;
      case 'anulada':
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(107, 114, 128, 0.1)', color: '#4b5563' }}>Anulada</span>;
      default:
        return <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb' }}>{estado}</span>;
    }
  };

  return (
    <div className="bandeja-cotizaciones-module" style={{ color: 'var(--text-primary)' }}>
      <div
        style={{
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
          <strong>{pendientes.length}</strong> cotización(es) con estado <em>Pendiente</em> de un total de <strong>{cotizaciones.length}</strong> registradas.
        </p>

        <button
          type="button"
          className="btn-solid"
          onClick={() => setIsCreateModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Icons.Plus size={16} />
          <span>Nueva Cotización</span>
        </button>
      </div>

      <AdminTable
        headers={headers}
        isLoading={isLoading}
        emptyMessage="No hay cotizaciones registradas en la base de datos."
      >
        {cotizaciones.map((c) => (
          <tr
            key={c.id}
            id={`bandeja-${c.codigo_cotizacion}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedCotizacionId(c.id)}
          >
            <td>
              <strong style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--text-primary)' }}>
                {c.codigo_cotizacion}
              </strong>
            </td>
            <td style={{ fontWeight: 600 }}>
              {c.clientes?.nombre_institucion || `Cliente #${c.cliente_id}`}
            </td>
            <td>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: c.canal_origen === 'telegram' ? 'rgba(0, 136, 204, 0.12)' : 'rgba(200, 90, 50, 0.1)',
                  color: c.canal_origen === 'telegram' ? '#0088cc' : '#C85A32',
                }}
              >
                {c.canal_origen}
              </span>
            </td>
            <td>{getStatusBadge(c.estado)}</td>
            <td style={{ fontWeight: 700 }}>{formatQuetzales(c.total_quetzales)}</td>
            <td>
              <button
                type="button"
                className="admin-btn admin-btn-info"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCotizacionId(c.id);
                }}
              >
                Ver detalle
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      {/* Modal de Creación Manual */}
      <CotizacionManualModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Modal Interno Protegido para Ver Detalle de Cotización */}
      <CotizacionDetalleModal
        isOpen={Boolean(selectedCotizacionId)}
        onClose={() => setSelectedCotizacionId(null)}
        cotizacionId={selectedCotizacionId}
      />
    </div>
  );
}
