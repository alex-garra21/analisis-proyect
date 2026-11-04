import React, { useState, useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import FormField from '../../../components/ui/FormField';
import type { Mercaderia } from '../../../types/database';
import { formatQuetzales } from '../../../types/database';
import { useUpdateMercaderiaStock } from '../../../api/hooks/useComercial';
import { showToast } from '../../../utils/swal';
import { Icons } from '../../../components/Icons';

interface InventarioMovimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mercaderia: Mercaderia | null;
}

type TipoMovimiento = 'ingreso' | 'devolucion';

export default function InventarioMovimientoModal({
  isOpen,
  onClose,
  mercaderia,
}: InventarioMovimientoModalProps) {
  const updateStockMutation = useUpdateMercaderiaStock();

  const [tipo, setTipo] = useState<TipoMovimiento>('ingreso');
  const [cantidad, setCantidad] = useState<string>('1');
  const [motivo, setMotivo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTipo('ingreso');
      setCantidad('1');
      setMotivo('');
    }
  }, [isOpen]);

  if (!mercaderia) return null;

  const parsedCantidad = parseInt(cantidad, 10) || 0;
  const currentStock = mercaderia.stock_actual || 0;

  const resultingStock =
    tipo === 'ingreso'
      ? currentStock + parsedCantidad
      : Math.max(0, currentStock - parsedCantidad);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedCantidad <= 0) {
      showToast('Ingresa una cantidad mayor a cero.', 'warning');
      return;
    }

    if (tipo === 'devolucion' && parsedCantidad > currentStock) {
      showToast('La cantidad a devolver no puede exceder el stock actual disponible.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateStockMutation.mutateAsync({
        id: mercaderia.id,
        nuevoStock: resultingStock,
      });

      showToast(
        `Inventario actualizado: ${mercaderia.nombre} ahora tiene ${resultingStock} unidades.`,
        'success'
      );
      onClose();
    } catch (err: any) {
      showToast(`Error al actualizar stock: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajuste de Stock e Inventario"
      maxWidth="520px"
      padding="2rem 2.25rem"
    >
      {/* Tarjeta de Resumen del Insumo */}
      <div
        style={{
          background: 'var(--bg-app)',
          padding: '1rem 1.25rem',
          borderRadius: '10px',
          border: '1px solid var(--border-soft)',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <span
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              display: 'block',
            }}
          >
            {mercaderia.codigo_mercaderia}
          </span>
          <strong style={{ fontSize: '15px', color: '#2C221E' }}>{mercaderia.nombre}</strong>
          <span
            style={{
              display: 'block',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              marginTop: '2px',
            }}
          >
            Precio unitario: {formatQuetzales(mercaderia.precio_unitario)}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Stock Actual
          </span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: currentStock <= 10 ? '#DC2626' : '#16A34A' }}>
            {currentStock}
          </div>
        </div>
      </div>

      {/* Selector de Tipo de Movimiento: Ingreso vs Devolución */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => setTipo('ingreso')}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: tipo === 'ingreso' ? '2px solid #C85A32' : '1px solid var(--border-med)',
            background: tipo === 'ingreso' ? 'rgba(200, 90, 50, 0.1)' : 'var(--bg-card)',
            color: tipo === 'ingreso' ? '#C85A32' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Icons.Plus size={16} />
          <span>Ingreso de Mercadería</span>
        </button>

        <button
          type="button"
          onClick={() => setTipo('devolucion')}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: tipo === 'devolucion' ? '2px solid #C85A32' : '1px solid var(--border-med)',
            background: tipo === 'devolucion' ? 'rgba(200, 90, 50, 0.1)' : 'var(--bg-card)',
            color: tipo === 'devolucion' ? '#C85A32' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <Icons.RefreshCw size={15} />
          <span>Devolución</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <FormField
          label={
            tipo === 'ingreso'
              ? 'Cantidad a Ingresar (Sumar al stock existente)'
              : 'Cantidad a Devolver / Reducir (Restar al stock)'
          }
        >
          <input
            type="number"
            min="1"
            max={tipo === 'devolucion' ? currentStock : undefined}
            className="dashboard-input"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            required
            autoFocus
          />
        </FormField>

        <FormField label="Motivo o Referencia (Opcional)">
          <input
            type="text"
            className="dashboard-input"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={
              tipo === 'ingreso'
                ? 'Ej. Recepción de nuevo embarque / proveedor'
                : 'Ej. Producto defectuoso o cancelación'
            }
          />
        </FormField>

        {/* Vista Previa del Cálculo */}
        <div
          style={{
            background: tipo === 'ingreso' ? 'rgba(22, 163, 74, 0.08)' : 'rgba(220, 38, 38, 0.08)',
            border: `1px solid ${tipo === 'ingreso' ? 'rgba(22, 163, 74, 0.25)' : 'rgba(220, 38, 38, 0.25)'}`,
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '13px',
          }}
        >
          <span>
            {tipo === 'ingreso' ? 'Stock resultante tras el ingreso:' : 'Stock resultante tras la devolución:'}
          </span>
          <strong
            style={{
              fontSize: '16px',
              color: tipo === 'ingreso' ? '#16A34A' : resultingStock <= 0 ? '#DC2626' : '#2C221E',
            }}
          >
            {resultingStock} unidades
          </strong>
        </div>

        {/* Botones de Acción */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          <button
            type="button"
            className="btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ padding: '10px 18px' }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn-solid"
            disabled={isSubmitting || parsedCantidad <= 0}
            style={{
              padding: '10px 22px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isSubmitting ? (
              <>
                <Icons.RefreshCw size={16} className="animate-spin" />
                <span>Aplicando...</span>
              </>
            ) : (
              <>
                <Icons.Check size={16} />
                <span>
                  {tipo === 'ingreso'
                    ? `Confirmar Ingreso (+${parsedCantidad})`
                    : `Confirmar Devolución (-${parsedCantidad})`}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
