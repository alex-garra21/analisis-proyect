import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routeMap';
import PublicContainer from '../../components/layout/PublicContainer';
import { COTIZACIONES, PRODUCTOS, formatQuetzales, totalCotizacion } from '../../data/localData';
import { decodeId } from '../../utils/routerHasher';

const cell = { padding: '0.6rem 1rem', textAlign: 'left' as const, borderBottom: '1px solid rgba(128,128,128,0.2)' };

export default function CotizacionDetallePage() {
  const { maskedId } = useParams();
  const rawId = decodeId(maskedId);
  const cot = rawId ? COTIZACIONES.find((c) => String(c.id) === rawId) : undefined;

  if (!cot) {
    return (
      <PublicContainer badge="Ventas" title="Cotización no encontrada" description="El enlace es inválido o fue modificado.">
        <Link to={ROUTES.cotizaciones} className="btn-outline">Volver a cotizaciones</Link>
      </PublicContainer>
    );
  }

  return (
    <PublicContainer badge="Ventas" title={cot.numero} description={`${cot.cliente} · ${cot.fecha} · ${cot.estado}`}>
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '1.5rem 0', color: 'var(--text-primary)' }}>
        <thead>
          <tr>{['Código', 'Insumo', 'Cant.', 'P. Unit.', 'Subtotal'].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {cot.items.map((it) => {
            const p = PRODUCTOS.find((x) => x.id === it.producto_id);
            if (!p) return null;
            return (
              <tr key={it.producto_id}>
                <td style={cell}>{p.codigo_mercadoria}</td>
                <td style={cell}>{p.nombre}</td>
                <td style={cell}>{it.cantidad}</td>
                <td style={cell}>{formatQuetzales(p.precio_q)}</td>
                <td style={cell}>{formatQuetzales(p.precio_q * it.cantidad)}</td>
              </tr>
            );
          })}
          <tr>
            <td style={{ ...cell, fontWeight: 700 }} colSpan={4}>Total</td>
            <td style={{ ...cell, fontWeight: 700 }}>{formatQuetzales(totalCotizacion(cot))}</td>
          </tr>
        </tbody>
      </table>
      <Link to={ROUTES.cotizaciones} className="btn-outline">Volver a cotizaciones</Link>
    </PublicContainer>
  );
}
