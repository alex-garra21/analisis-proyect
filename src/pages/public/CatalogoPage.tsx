import { useState, useMemo } from 'react';
import { ROUTES } from '../../routes/routeMap';
import { useNavigate } from 'react-router-dom';
import PublicContainer from '../../components/layout/PublicContainer';
import { PRODUCTOS, formatQuetzales } from '../../data/localData';
import { createMaskedUrl } from '../../utils/routerHasher';

const cell = { padding: '0.75rem 1rem', textAlign: 'left' as const, borderBottom: '1px solid rgba(128,128,128,0.2)' };

export default function CatalogoPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const productos = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTOS.filter(
      (p) =>
        !q ||
        p.nombre.toLowerCase().includes(q) ||
        p.codigo_mercadoria.toLowerCase().includes(q) ||
        p.categoria_mineduc.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <PublicContainer
      badge="Catálogo"
      title="Catálogo de insumos"
      description="Productos por categoría MINEDUC. Datos locales de prueba."
    >
      <input
        id="catalogo-buscar"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por código, nombre o categoría..."
        style={{ width: '100%', maxWidth: 420, padding: '0.7rem 1rem', margin: '1rem 0', borderRadius: 8 }}
      />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-primary)' }}>
          <thead>
            <tr>
              {['Código', 'Insumo', 'Categoría MINEDUC', 'Unidad', 'Precio', 'Stock'].map((h) => (
                <th key={h} style={cell}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr
                key={p.id}
                id={`producto-${p.codigo_mercadoria}`}
                style={{ cursor: 'pointer' }}
                // El ID interno se enmascara: /catalogo/m_XXXX
                onClick={() => navigate(createMaskedUrl(ROUTES.catalogo, p.id))}
              >
                <td style={cell}>{p.codigo_mercadoria}</td>
                <td style={cell}>{p.nombre}</td>
                <td style={cell}>{p.categoria_mineduc}</td>
                <td style={cell}>{p.unidad_medida}</td>
                <td style={cell}>{formatQuetzales(p.precio_q)}</td>
                <td style={{ ...cell, color: p.stock_actual <= 10 ? '#e53e3e' : undefined }}>{p.stock_actual}</td>
              </tr>
            ))}
            {productos.length === 0 && (
              <tr><td style={cell} colSpan={6}>Sin resultados.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </PublicContainer>
  );
}
