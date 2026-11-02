import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routeMap';
import PublicContainer from '../../components/layout/PublicContainer';
import { PRODUCTOS, formatQuetzales } from '../../data/localData';
import { decodeId } from '../../utils/routerHasher';

export default function ProductoDetallePage() {
  const { maskedId } = useParams();
  // decodeId devuelve null si el ID fue manipulado (prevención IDOR)
  const rawId = decodeId(maskedId);
  const producto = rawId ? PRODUCTOS.find((p) => String(p.id) === rawId) : undefined;

  if (!producto) {
    return (
      <PublicContainer badge="Catálogo" title="Producto no encontrado" description="El enlace es inválido o fue modificado.">
        <Link to={ROUTES.catalogo} className="btn-outline">Volver al catálogo</Link>
      </PublicContainer>
    );
  }

  const rows: [string, string][] = [
    ['Código de mercadería', producto.codigo_mercadoria],
    ['Categoría MINEDUC', producto.categoria_mineduc],
    ['Unidad de medida', producto.unidad_medida],
    ['Precio', formatQuetzales(producto.precio_q)],
    ['Stock actual', String(producto.stock_actual)],
  ];

  return (
    <PublicContainer badge="Catálogo" title={producto.nombre} description={producto.codigo_mercadoria}>
      <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.6rem 2rem', margin: '1.5rem 0', color: 'var(--text-primary)' }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'contents' }}>
            <dt style={{ fontWeight: 600 }}>{k}</dt>
            <dd style={{ margin: 0 }}>{v}</dd>
          </div>
        ))}
      </dl>
      <Link to={ROUTES.catalogo} className="btn-outline">Volver al catálogo</Link>
    </PublicContainer>
  );
}
