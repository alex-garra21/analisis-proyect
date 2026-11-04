import { useState, useMemo } from 'react';
import { useMercaderias } from '../../api/hooks/useComercial';
import { formatQuetzales } from '../../types/database';
import AdminTable from '../../components/ui/AdminTable';
import SearchBar from '../../components/ui/SearchBar';

/**
 * Gestión del Inventario de Mercaderías (Ruta Protegida):
 * Consulta directa a public.mercaderias con filtrado por stock y búsqueda por código_mercaderia o nombre.
 */
export default function InventarioPage() {
  const [query, setQuery] = useState('');
  const [soloBajo, setSoloBajo] = useState(false);

  const { data: mercaderias = [], isLoading } = useMercaderias();

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mercaderias.filter((m) => {
      const matchQuery =
        !q ||
        m.codigo_mercaderia.toLowerCase().includes(q) ||
        m.nombre.toLowerCase().includes(q) ||
        (m.categorias?.nombre && m.categorias.nombre.toLowerCase().includes(q));

      const matchBajo = !soloBajo || m.stock_actual <= 10;
      return matchQuery && matchBajo;
    });
  }, [query, soloBajo, mercaderias]);

  const valorTotal = useMemo(() => {
    return items.reduce((sum, m) => sum + (Number(m.precio_unitario) || 0) * (Number(m.stock_actual) || 0), 0);
  }, [items]);

  const headers = [
    'Código de Mercadería',
    'Nombre del Insumo',
    'Categoría',
    'Precio Unitario',
    'Stock Actual',
  ];

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', flex: '1 1 320px' }}>
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Buscar por código de mercadería o nombre..."
            style={{ maxWidth: '360px' }}
          />

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              userSelect: 'none',
              color: 'var(--text-secondary)',
            }}
          >
            <input
              id="inventario-stock-bajo"
              type="checkbox"
              checked={soloBajo}
              onChange={(e) => setSoloBajo(e.target.checked)}
              style={{ accentColor: '#185FA5', width: 16, height: 16 }}
            />
            Solo stock mínimo (≤ 10)
          </label>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            padding: '8px 16px',
            borderRadius: '10px',
            border: '1px solid var(--border-soft)',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            fontSize: '13px',
          }}
        >
          <span style={{ color: 'var(--text-secondary)', marginRight: '6px' }}>Valor en existencia:</span>
          <strong style={{ color: '#185FA5', fontSize: '15px' }}>{formatQuetzales(valorTotal)}</strong>
        </div>
      </div>

      <AdminTable
        headers={headers}
        isLoading={isLoading}
        emptyMessage="No hay mercaderías registradas en el inventario."
      >
        {items.map((m) => {
          const isMinStock = m.stock_actual <= 10;
          const isOut = m.stock_actual <= 0;

          return (
            <tr key={m.id} id={`inv-${m.codigo_mercaderia}`}>
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
              <td style={{ fontWeight: 700 }}>{formatQuetzales(m.precio_unitario)}</td>
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
            </tr>
          );
        })}
      </AdminTable>
    </div>
  );
}
