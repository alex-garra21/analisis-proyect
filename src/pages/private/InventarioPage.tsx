import { useState, useMemo } from 'react';
import { useMercaderias } from '../../api/hooks/useComercial';
import type { Mercaderia } from '../../types/database';
import { formatQuetzales } from '../../types/database';
import AdminTable from '../../components/ui/AdminTable';
import SearchBar from '../../components/ui/SearchBar';
import { Icons } from '../../components/Icons';
import InventarioMovimientoModal from '../../modules/admin/inventario/InventarioMovimientoModal';

/**
 * Gestión del Inventario de Mercaderías (Ruta Protegida):
 * Consulta directa a public.mercaderias con filtrado por stock, cálculo automático del Total
 * y módulo de ajustes de stock (Ingreso de Mercadería y Devolución).
 */
export default function InventarioPage() {
  const [query, setQuery] = useState('');
  const [soloBajo, setSoloBajo] = useState(false);
  const [selectedMercaderia, setSelectedMercaderia] = useState<Mercaderia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    return items.reduce(
      (sum, m) => sum + (Number(m.precio_unitario) || 0) * (Number(m.stock_actual) || 0),
      0
    );
  }, [items]);

  const headers = [
    'Código de Mercadería',
    'Nombre del Insumo',
    'Categoría',
    'Precio Unitario',
    'Stock Actual',
    'Total',
    'Acciones',
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
              style={{ accentColor: '#C85A32', width: 16, height: 16 }}
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
          <strong style={{ color: '#C85A32', fontSize: '15px' }}>{formatQuetzales(valorTotal)}</strong>
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
          const filaTotal = Number(m.precio_unitario || 0) * Number(m.stock_actual || 0);

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
              <td style={{ fontWeight: 600 }}>{formatQuetzales(m.precio_unitario)}</td>
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
              {/* Columna Total calculada automáticamente: Stock Actual * Precio Unitario */}
              <td>
                <strong style={{ color: '#C85A32', fontSize: '14px' }}>
                  {formatQuetzales(filaTotal)}
                </strong>
              </td>
              {/* Botón de acción Editar con opciones de Ingreso y Devolución */}
              <td>
                <button
                  type="button"
                  className="admin-btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    background: '#F2ECE4',
                    color: '#2C221E',
                    borderColor: '#E6DFD5',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  onClick={() => {
                    setSelectedMercaderia(m);
                    setIsModalOpen(true);
                  }}
                  title="Editar stock e inventario"
                >
                  <Icons.Edit size={14} />
                  <span>Editar</span>
                </button>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      <InventarioMovimientoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMercaderia(null);
        }}
        mercaderia={selectedMercaderia}
      />
    </div>
  );
}
