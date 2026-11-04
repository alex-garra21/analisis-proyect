import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routeMap';
import PublicContainer from '../../components/layout/PublicContainer';
import { useMercaderia } from '../../api/hooks/useComercial';
import { formatQuetzales } from '../../types/database';
import { decodeId } from '../../utils/routerHasher';

export default function ProductoDetallePage() {
  const { maskedId } = useParams();
  const rawId = decodeId(maskedId);
  const numericId = rawId ? parseInt(rawId, 10) : null;

  const { data: mercaderia, isLoading } = useMercaderia(numericId);

  if (isLoading) {
    return (
      <PublicContainer badge="Catálogo" title="Cargando producto..." description="Consultando base de datos.">
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Cargando detalles de la mercadería...
        </div>
      </PublicContainer>
    );
  }

  if (!mercaderia) {
    return (
      <PublicContainer badge="Catálogo" title="Producto no encontrado" description="El enlace es inválido o el registro no existe en la base de datos.">
        <Link to={ROUTES.catalogo} className="btn-outline">Volver al catálogo</Link>
      </PublicContainer>
    );
  }

  const rows: [string, string][] = [
    ['Código de mercadería', mercaderia.codigo_mercaderia],
    ['Nombre del producto', mercaderia.nombre],
    ['Categoría', mercaderia.categorias?.nombre || 'General'],
    ['Precio unitario', formatQuetzales(mercaderia.precio_unitario)],
    ['Stock actual en inventario', `${mercaderia.stock_actual} unidades`],
  ];

  return (
    <PublicContainer
      badge="Catálogo"
      title={mercaderia.nombre}
      description={`Código: ${mercaderia.codigo_mercaderia}`}
    >
      <dl style={{ display: 'grid', gridTemplateColumns: 'max-content 1fr', gap: '0.8rem 2rem', margin: '2rem 0', color: 'var(--text-primary)' }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'contents' }}>
            <dt style={{ fontWeight: 700 }}>{k}</dt>
            <dd style={{ margin: 0 }}>{v}</dd>
          </div>
        ))}
      </dl>
      <Link to={ROUTES.catalogo} className="btn-outline">Volver al catálogo</Link>
    </PublicContainer>
  );
}
