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
  const unidadAbrev = codeParts.length >= 3 ? codeParts[codeParts.length - 1] : 'UND';

  const valorInventario = (Number(mercaderia.precio_unitario) || 0) * stockActual;

  const fechaRegistro = mercaderia.created_at
    ? new Date(mercaderia.created_at).toLocaleDateString('es-GT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mercadería: ${mercaderia.codigo_mercaderia}`}
      maxWidth="780px"
      padding="2rem 2.25rem"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: '#2C221E' }}>
        
        {/* Tarjeta Superior en 3 Columnas Distribuidas (Idéntica a Detalle de Cotización) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            backgroundColor: '#FDFBF7',
            padding: '1.25rem 1.5rem',
            borderRadius: '10px',
            border: '1px solid #E6DFD5',
            fontSize: '13px',
          }}
        >
          {/* Columna 1: Código de Mercadería */}
          <div>
            <span
              style={{
                color: '#7C6E67',
                display: 'block',
                fontSize: '11px',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}
            >
              Código de Mercadería
            </span>
            <strong
              style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '15px',
                fontWeight: 800,
                color: '#2C221E',
                letterSpacing: '0.2px',
              }}
            >
              {mercaderia.codigo_mercaderia}
            </strong>
          </div>

          {/* Columna 2: Fecha de Alta */}
          <div>
            <span
              style={{
                color: '#7C6E67',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '11px',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}
            >
              <Icons.Calendar size={13} style={{ color: '#C85A32' }} />
              <span>Fecha de Alta</span>
            </span>
            <span style={{ fontWeight: 600, color: '#2C221E', fontSize: '14px' }}>
              {fechaRegistro}
            </span>
          </div>

          {/* Columna 3: Categoría Asignada */}
          <div>
            <span
              style={{
                color: '#7C6E67',
                display: 'block',
                fontSize: '11px',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.5px',
                marginBottom: '4px',
              }}
            >
              Categoría Asignada
            </span>
            <div style={{ marginTop: '2px' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(200, 90, 50, 0.1)',
                  color: '#C85A32',
                  border: '1px solid rgba(200, 90, 50, 0.2)',
                }}
              >
                {categoriaNombre}
              </span>
            </div>
          </div>
        </div>

        {/* Nombre del Insumo / Producto (Destacado fuera de la tarjeta) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '0 4px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#7C6E67',
              letterSpacing: '0.5px',
            }}
          >
            Nombre del Insumo / Producto
          </span>
          <h3
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#2C221E',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            {mercaderia.nombre}
          </h3>
        </div>

        {/* Métricas: Precio Unitario, Stock Real y Valorización Total */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          {/* Tarjeta 1: Precio Unitario */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#FDFBF7',
              border: '1px solid #E6DFD5',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#7C6E67',
                letterSpacing: '0.5px',
              }}
            >
              Precio Unitario
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#C85A32', letterSpacing: '-0.5px' }}>
                {formatQuetzales(mercaderia.precio_unitario)}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#7C6E67' }}>
                / {unidadAbrev}
              </span>
            </div>
          </div>

          {/* Tarjeta 2: Stock Real en Almacén */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#FDFBF7',
              border: '1px solid #E6DFD5',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#7C6E67',
                letterSpacing: '0.5px',
              }}
            >
              Stock Real en Almacén
            </span>
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, color: '#2C221E' }}>
                  {stockActual}
                </span>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: isOut
                      ? 'rgba(239, 68, 68, 0.12)'
                      : isMin
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(22, 163, 74, 0.12)',
                    color: isOut ? '#dc2626' : isMin ? '#d97706' : '#16a34a',
                  }}
                >
                  {isOut ? 'Agotado' : isMin ? 'Mínimo' : 'Óptimo'}
                </span>
              </div>
              <span style={{ fontSize: '11px', color: '#7C6E67', display: 'block', marginTop: '2px' }}>
                {unidadAbrev} registradas
              </span>
            </div>
          </div>

          {/* Tarjeta 3: Valorización Total en Inventario */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: '#FDFBF7',
              border: '1px solid #E6DFD5',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#7C6E67',
                letterSpacing: '0.5px',
              }}
            >
              Valorización Total
            </span>
            <div style={{ marginTop: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 900, color: '#2C221E', letterSpacing: '-0.5px' }}>
                {formatQuetzales(valorInventario)}
              </span>
              <span style={{ fontSize: '11px', color: '#7C6E67', display: 'block', marginTop: '2px' }}>
                en inventario actual
              </span>
            </div>
          </div>
        </div>

        {/* Detalle de categoría si existe */}
        {categoriaDescripcion && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: '#FDFBF7',
              border: '1px solid #E6DFD5',
              fontSize: '13px',
              color: '#7C6E67',
              lineHeight: 1.45,
            }}
          >
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
            paddingTop: '1.25rem',
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
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
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
