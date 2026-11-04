import { useState, useMemo } from 'react';
import { ROUTES } from '../../routes/routeMap';
import { useNavigate } from 'react-router-dom';
import PublicContainer from '../../components/layout/PublicContainer';
import { useMercaderias, useCategorias } from '../../api/hooks/useComercial';
import type { Mercaderia } from '../../types/database';
import { createMaskedUrl } from '../../utils/routerHasher';
import ProductCard from '../../components/ui/ProductCard';
import SearchBar from '../../components/ui/SearchBar';
import { Icons } from '../../components/Icons';

/**
 * Vista Pública del Catálogo (/catalogo):
 * Accesible sin inicio de sesión y renderizado estrictamente en tarjetas (cards).
 * Muestra el stock genérico ("Disponible", "Stock mínimo", "Agotado") sin cifras exactas.
 */
export default function CatalogoPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('Todas');

  const { data: mercaderias = [], isLoading } = useMercaderias();
  const { data: categorias = [] } = useCategorias();

  const categoriasList = useMemo(() => {
    return ['Todas', ...categorias.map((c) => c.nombre)];
  }, [categorias]);

  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mercaderias.filter((m) => {
      const matchQuery =
        !q ||
        m.nombre.toLowerCase().includes(q) ||
        m.codigo_mercaderia.toLowerCase().includes(q) ||
        (m.categorias?.nombre && m.categorias.nombre.toLowerCase().includes(q));

      const matchCategory =
        selectedCategoria === 'Todas' || m.categorias?.nombre === selectedCategoria;

      return matchQuery && matchCategory;
    });
  }, [query, selectedCategoria, mercaderias]);

  const handleViewDetails = (m: Mercaderia) => {
    navigate(createMaskedUrl(ROUTES.catalogo, m.id));
  };

  return (
    <PublicContainer
      badge="Catálogo Comercial"
      title="Catálogo de Mercaderías"
      description="Consulta insumos escolares y suministros organizados por categoría. Disponibilidad en tiempo real."
    >
      {/* Filtros y Búsqueda */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          margin: '2rem 0 1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar por código, insumo o categoría..."
            style={{ maxWidth: '440px' }}
          />

          <div
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {filtrados.length} producto{filtrados.length === 1 ? '' : 's'} disponible{filtrados.length === 1 ? '' : 's'}
          </div>
        </div>

        {/* Píldoras de Filtro por Categoría */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {categoriasList.map((cat) => {
            const isSelected = selectedCategoria === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategoria(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  fontSize: '12px',
                  fontWeight: isSelected ? 700 : 500,
                  border: isSelected ? '1px solid #185FA5' : '1px solid var(--border-soft)',
                  background: isSelected ? 'rgba(24, 95, 165, 0.12)' : 'var(--bg-card)',
                  color: isSelected ? '#185FA5' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Tarjetas (Cards) */}
      {isLoading ? (
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div className="loader-spinner" style={{ margin: '0 auto 1rem', width: 36, height: 36 }} />
          Cargando catálogo oficial desde Supabase...
        </div>
      ) : filtrados.length > 0 ? (
        <div className="product-grid">
          {filtrados.map((m) => (
            <ProductCard
              key={m.id}
              mercaderia={m}
              onViewDetails={handleViewDetails}
              isPublicSimple={true}
              stockMinimo={10}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            background: 'var(--bg-card)',
            borderRadius: 16,
            border: '1px dashed var(--border-med)',
            margin: '2rem 0',
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--bg-app)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--text-muted)',
            }}
          >
            <Icons.Package size={28} />
          </div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
            No se encontraron mercaderías
          </h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
            Prueba ajustando los términos de búsqueda o seleccionando otra categoría.
          </p>
        </div>
      )}
    </PublicContainer>
  );
}
