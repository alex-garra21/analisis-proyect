import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routeMap';
import PublicContainer from '../../components/layout/PublicContainer';
import { useCotizacion } from '../../api/hooks/useComercial';
import { formatQuetzales } from '../../types/database';
import { decodeId } from '../../utils/routerHasher';

const cell = { padding: '0.7rem 1rem', textAlign: 'left' as const, borderBottom: '1px solid rgba(128,128,128,0.2)' };

export default function CotizacionDetallePage() {
  const { maskedId } = useParams();
  const rawId = decodeId(maskedId);
  const numericId = rawId ? parseInt(rawId, 10) : null;

  const { data: cot, isLoading } = useCotizacion(numericId);

  if (isLoading) {
    return (
      <PublicContainer badge="Ventas" title="Cargando cotización..." description="Consultando datos en Supabase.">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando detalles de la cotización...
        </div>
      </PublicContainer>
    );
  }

  if (!cot) {
    return (
      <PublicContainer badge="Ventas" title="Cotización no encontrada" description="El enlace es inválido o el registro no existe en la base de datos.">
        <Link to={ROUTES.cotizaciones} className="btn-outline">Volver a cotizaciones</Link>
      </PublicContainer>
    );
  }

  return (
    <PublicContainer
      badge="Ventas"
      title={`Cotización: ${cot.codigo_cotizacion}`}
      description={`Cliente: ${cot.clientes?.nombre_institucion || 'N/A'} · Emisión: ${new Date(cot.fecha_emision).toLocaleDateString('es-GT')} · Canal: ${cot.canal_origen} · Estado: ${cot.estado}`}
    >
      <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
          <thead>
            <tr>{['Código de Mercadería', 'Insumo', 'Cantidad', 'Precio Unitario Aplicado', 'Subtotal'].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {(cot.detalle_cotizacion || []).map((det) => {
              const subtotal = (Number(det.cantidad) || 0) * (Number(det.precio_aplicado) || 0);
              return (
                <tr key={det.id}>
                  <td style={cell}>
                    <strong style={{ fontFamily: 'ui-monospace, monospace' }}>
                      {det.mercaderias?.codigo_mercaderia || '—'}
                    </strong>
                  </td>
                  <td style={cell}>{det.mercaderias?.nombre || `Mercadería #${det.mercaderia_id}`}</td>
                  <td style={cell}>{det.cantidad}</td>
                  <td style={cell}>{formatQuetzales(det.precio_aplicado)}</td>
                  <td style={cell}>{formatQuetzales(subtotal)}</td>
                </tr>
              );
            })}
            <tr>
              <td style={{ ...cell, fontWeight: 700, fontSize: '15px' }} colSpan={4}>Total Quetzales</td>
              <td style={{ ...cell, fontWeight: 700, fontSize: '16px', color: '#185FA5' }}>
                {formatQuetzales(cot.total_quetzales)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <Link to={ROUTES.cotizaciones} className="btn-outline">Volver a cotizaciones</Link>
    </PublicContainer>
  );
}
