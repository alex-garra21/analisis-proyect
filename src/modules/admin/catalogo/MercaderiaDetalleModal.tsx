import Modal from '../../../components/ui/Modal';
import type { Mercaderia } from '../../../types/database';
import { formatQuetzales } from '../../../types/database';
import { Icons } from '../../../components/Icons';

interface MercaderiaDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  mercaderia: Mercaderia | null;
  onEdit?: (mercaderia: Mercaderia) => void;
}

export default function MercaderiaDetalleModal({
  isOpen,
  onClose,
  mercaderia,
  onEdit,
}: MercaderiaDetalleModalProps) {
  if (!mercaderia) return null;

  const stockActual = Number(mercaderia.stock_actual) || 0;
  const isOut = stockActual <= 0;
  const isMin = !isOut && stockActual <= 10;
  const categoriaNombre = mercaderia.categorias?.nombre || 'General';
  const categoriaDescripcion = mercaderia.categorias?.descripcion;

  // Extracción de unidad si viene en el código
  const codeParts = mercaderia.codigo_mercaderia ? mercaderia.codigo_mercaderia.split('-') : [];
  const unidadAbrev = codeParts.length >= 3 ? codeParts[codeParts.length - 1] : 'Unidad';

  const valorInventario = (Number(mercaderia.precio_unitario) || 0) * stockActual;

  const fechaRegistro = mercaderia.created_at
    ? new Date(mercaderia.created_at).toLocaleDateString('es-GT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '—';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha Técnica de Mercadería"
      maxWidth="640px"
      padding="2rem 2.25rem"
    >
      <div className="ficha-tecnica-container" style={{ color: '#2C221E' }}>
        
        {/* Encabezado con Código, Categoría y Fecha de Registro */}
        <div className="ficha-header-top p-4 rounded-xl" style={{ backgroundColor: '#FDFBF7', border: '1px solid #E6DFD5' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#7C6E67', letterSpacing: '0.5px' }}>
              Código de Mercadería
            </span>
            <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: '15px', fontWeight: 800, color: '#2C221E' }}>
              {mercaderia.codigo_mercaderia}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Fecha de Alta (created_at) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'right' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#7C6E67', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                <Icons.Calendar size={13} style={{ color: '#C85A32' }} />
                <span>Fecha de Alta</span>
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#2C221E' }}>
                {fechaRegistro}
              </span>
            </div>

            {/* Categoría Asignada */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#7C6E67', letterSpacing: '0.5px' }}>
                Categoría
              </span>
              <span className="ficha-badge-cat">
                {categoriaNombre}
              </span>
            </div>
          </div>
        </div>

        {/* Nombre del Insumo / Producto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#7C6E67', letterSpacing: '0.5px' }}>
            Nombre del Insumo / Producto
          </span>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#2C221E', margin: 0, lineHeight: 1.3 }}>
            {mercaderia.nombre}
          </h3>
        </div>

        {/* Métricas de Precio, Stock y Valorización en tarjetas independientes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
          
          {/* Tarjeta 1: Precio */}
          <div className="ficha-item-especificacion" style={{ padding: '1rem' }}>
            <span className="ficha-item-etiqueta">Precio Unitario</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '4px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#C85A32' }}>
                {formatQuetzales(mercaderia.precio_unitario)}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#7C6E67' }}>
                / {unidadAbrev}
              </span>
            </div>
          </div>

          {/* Tarjeta 2: Stock Real */}
          <div className="ficha-item-especificacion" style={{ padding: '1rem' }}>
            <span className="ficha-item-etiqueta">Stock Real en Almacén</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#2C221E' }}>
                {stockActual}
              </span>
              <span
                className={`ficha-badge-stock ${
                  isOut ? 'agotado' : isMin ? 'critico' : 'disponible'
                }`}
                style={{ padding: '2px 8px', fontSize: '11px' }}
              >
                {isOut ? 'Agotado' : isMin ? 'Mínimo' : 'Óptimo'}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#7C6E67', marginTop: '2px' }}>
              {unidadAbrev} registradas
            </span>
          </div>

          {/* Tarjeta 3: Valorización Total */}
          <div className="ficha-item-especificacion" style={{ padding: '1rem' }}>
            <span className="ficha-item-etiqueta">Valorización Total</span>
            <div style={{ marginTop: '4px' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#2C221E' }}>
                {formatQuetzales(valorInventario)}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#7C6E67', marginTop: '2px' }}>
              en inventario actual
            </span>
          </div>
        </div>

        {/* Detalle de categoría si existe */}
        {categoriaDescripcion && (
          <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: '#FDFBF7', border: '1px solid #E6DFD5', fontSize: '12px', color: '#7C6E67', lineHeight: 1.45 }}>
            <strong style={{ color: '#2C221E' }}>Descripción de Categoría: </strong>
            {categoriaDescripcion}
          </div>
        )}

        {/* Pie de Acciones: Botón de Cerrar y Botón de Editar Mercadería */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '1rem',
            borderTop: '1px solid #E6DFD5',
            marginTop: '0.5rem',
          }}
        >
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onClose}
            style={{ padding: '9px 18px', fontSize: '13px' }}
          >
            Cerrar Ficha
          </button>

          {onEdit && (
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => {
                onClose();
                onEdit(mercaderia);
              }}
              style={{
                padding: '9px 20px',
                fontSize: '13px',
                backgroundColor: '#C85A32',
                color: '#FFFFFF',
              }}
            >
              <Icons.Edit size={15} />
              <span>Editar Mercadería</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
