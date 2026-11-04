import { useState, useMemo } from 'react';
import { useMercaderias, useCategorias } from '../../api/hooks/useComercial';
import { useAuth } from '../../api/hooks/useAuth';
import type { Mercaderia } from '../../types/database';
import { formatQuetzales } from '../../types/database';
import AdminTable from '../../components/ui/AdminTable';
import SearchBar from '../../components/ui/SearchBar';
import { Icons } from '../../components/Icons';
import MercaderiaFormModal from '../../modules/admin/catalogo/MercaderiaFormModal';
import MercaderiaDetalleModal from '../../modules/admin/catalogo/MercaderiaDetalleModal';

/**
 * Vista Protegida del Catálogo (/dashboard/catalogo-admin):
 * Exclusiva para personal autenticado.
 * Renderiza la tabla completa con los campos exactos de public.mercaderias:
 * codigo_mercaderia, nombre, categoria, precio_unitario (Q.), stock_actual y acciones.
 */
export default function CatalogoAdminPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('Todas');

  // Modal de Creación / Edición de Mercadería
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [mercaderiaToEdit, setMercaderiaToEdit] = useState<Mercaderia | null>(null);

  // Modal de Ficha Técnica Privada
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [selectedMercaderia, setSelectedMercaderia] = useState<Mercaderia | null>(null);

  const { data: mercaderias = [], isLoading } = useMercaderias();
  const { data: categorias = [] } = useCategorias();

  // Validación de permisos administrativos
  const rawRole = (user?.rol || 'colaborador').toLowerCase().trim();
  const canManageMercaderias = rawRole === 'sistemas' || rawRole === 'administrador' || user?.correo === 'salexanderr2@gmail.com';

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

  const handleOpenCreate = () => {
    setMercaderiaToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (m: Mercaderia) => {
    setMercaderiaToEdit(m);
    setIsFormModalOpen(true);
  };

  const handleViewDetails = (m: Mercaderia) => {
    setSelectedMercaderia(m);
    setIsDetalleModalOpen(true);
  };

  const headers = [
    'Código de Mercadería',
    'Nombre del Insumo',
    'Categoría',
    'Precio Unitario',
    'Stock Actual',
    'Acciones Rápidas',
  ];

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      {/* Controles y Búsqueda */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          marginBottom: '1.5rem',
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
            placeholder="Buscar por código de mercadería, nombre o categoría..."
            style={{ maxWidth: '440px' }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              fontWeight: 600,
            }}
          >
            {canManageMercaderias && (
              <button
                type="button"
                className="btn-solid"
                onClick={handleOpenCreate}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                <Icons.Plus size={16} />
                <span>Nueva Mercadería</span>
              </button>
            )}

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '8px',
                background: 'rgba(200, 90, 50, 0.08)',
                border: '1px solid var(--border-soft)',
                color: '#C85A32',
                fontSize: '12px',
              }}
            >
              <Icons.Shield size={14} />
              Catálogo Oficial (Supabase)
            </span>
            <span>
              {filtrados.length} mercadería{filtrados.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Píldoras de Categoría */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            paddingBottom: '0.4rem',
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
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: isSelected
                    ? '1px solid #C85A32'
                    : '1px solid var(--border-soft)',
                  backgroundColor: isSelected ? 'rgba(200, 90, 50, 0.12)' : 'var(--bg-card)',
                  color: isSelected ? '#C85A32' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla de Mercaderías */}
      <AdminTable
        headers={headers}
        isLoading={isLoading}
        emptyMessage="No se encontraron mercaderías registradas con los filtros actuales."
      >
        {filtrados.map((m) => {
          const isOut = m.stock_actual <= 0;
          const isMinStock = !isOut && m.stock_actual <= 10;

          return (
            <tr
              key={m.id}
              id={`mercaderia-${m.codigo_mercaderia}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleViewDetails(m)}
            >
              <td>
                <span
                  style={{
                    fontFamily: 'ui-monospace, monospace',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}
                >
                  {m.codigo_mercaderia}
                </span>
              </td>
              <td style={{ fontWeight: 600 }}>{m.nombre}</td>
              <td>
                <span
                  style={{
                    fontSize: '12px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-soft)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {m.categorias?.nombre || 'General'}
                </span>
              </td>
              <td>
                <strong style={{ color: '#C85A32', fontSize: '15px' }}>
                  {formatQuetzales(m.precio_unitario)}
                </strong>
              </td>
              <td>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700,
                    color: isOut ? '#94a3b8' : isMinStock ? '#dc2626' : '#16a34a',
                  }}
                >
                  {m.stock_actual}
                  {isOut ? (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626' }}>(Agotado)</span>
                  ) : isMinStock ? (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626' }}>(Mínimo)</span>
                  ) : null}
                </span>
              </td>
              <td>
                <div
                  style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Botón Editar Mercadería */}
                  {canManageMercaderias ? (
                    <button
                      type="button"
                      className="btn-card-primary"
                      style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => handleOpenEdit(m)}
                      title="Editar datos generales de la mercadería"
                    >
                      <Icons.Edit size={14} />
                      <span>Editar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-card-primary"
                      style={{ padding: '6px 14px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => handleViewDetails(m)}
                      title="Ver Ficha Técnica"
                    >
                      <Icons.Info size={14} />
                      <span>Ver Ficha</span>
                    </button>
                  )}

                  {/* Botón Ver Ficha Técnica Privada */}
                  <button
                    type="button"
                    className="btn-card-secondary-square"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => handleViewDetails(m)}
                    title="Ver Ficha Técnica Privada"
                  >
                    <Icons.ArrowRight size={15} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {/* Modal de Creación / Edición */}
      <MercaderiaFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setMercaderiaToEdit(null);
        }}
        mercaderiaToEdit={mercaderiaToEdit}
      />

      {/* Modal de Ficha Técnica Privada */}
      <MercaderiaDetalleModal
        isOpen={isDetalleModalOpen}
        onClose={() => {
          setIsDetalleModalOpen(false);
          setSelectedMercaderia(null);
        }}
        mercaderia={selectedMercaderia}
        onEdit={canManageMercaderias ? (m) => handleOpenEdit(m) : undefined}
      />
    </div>
  );
}
