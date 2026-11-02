import { useMemo, useState } from 'react';
import { PRODUCTOS, formatQuetzales } from '../../data/localData';

const cell = { padding: '0.7rem 1rem', textAlign: 'left' as const, borderBottom: '1px solid rgba(128,128,128,0.2)' };

/** Gestión de inventario identificada por "código de mercadería". */
export default function InventarioPage() {
  const [codigo, setCodigo] = useState('');
  const [soloBajo, setSoloBajo] = useState(false);

  const items = useMemo(() => {
    const q = codigo.trim().toLowerCase();
    return PRODUCTOS.filter(
      (p) =>
        (!q || p.codigo_mercadoria.toLowerCase().includes(q) || p.nombre.toLowerCase().includes(q)) &&
        (!soloBajo || p.stock_actual <= 10)
    );
  }, [codigo, soloBajo]);

  const valorTotal = items.reduce((s, p) => s + p.precio_q * p.stock_actual, 0);

  return (
    <div style={{ color: 'var(--text-primary)' }}>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <input
          id="inventario-codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Código de mercadería o nombre..."
          style={{ padding: '0.7rem 1rem', borderRadius: 8, minWidth: 280 }}
        />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input id="inventario-stock-bajo" type="checkbox" checked={soloBajo} onChange={(e) => setSoloBajo(e.target.checked)} />
          Solo stock bajo (≤ 10)
        </label>
        <strong style={{ marginLeft: 'auto' }}>Valor en existencia: {formatQuetzales(valorTotal)}</strong>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Código de mercadería', 'Insumo', 'Categoría MINEDUC', 'Unidad', 'Precio', 'Stock'].map((h) => <th key={h} style={cell}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.codigo_mercadoria} id={`inv-${p.codigo_mercadoria}`}>
                <td style={cell}><strong>{p.codigo_mercadoria}</strong></td>
                <td style={cell}>{p.nombre}</td>
                <td style={cell}>{p.categoria_mineduc}</td>
                <td style={cell}>{p.unidad_medida}</td>
                <td style={cell}>{formatQuetzales(p.precio_q)}</td>
                <td style={{ ...cell, color: p.stock_actual <= 10 ? '#e53e3e' : undefined, fontWeight: 600 }}>{p.stock_actual}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td style={cell} colSpan={6}>Sin resultados.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
