import { type Mercaderia, formatQuetzales } from '../../types/database';
import { Icons } from '../Icons';

export interface ProductCardProps {
  mercaderia: Mercaderia;
  onViewDetails?: (mercaderia: Mercaderia) => void;
  onAddToCart?: (mercaderia: Mercaderia) => void;
  actionLabel?: string;
  isAdding?: boolean;
  /** Modo simplificado para visitantes no autenticados en /catalogo */
  isPublicSimple?: boolean;
  stockMinimo?: number;
}

export default function ProductCard({
  mercaderia,
  onViewDetails,
  onAddToCart,
  actionLabel = 'Añadir a cotización',
  isAdding = false,
  isPublicSimple = false,
  stockMinimo = 10,
}: ProductCardProps) {
  const isOutOfStock = mercaderia.stock_actual <= 0;
  const isLowStock = !isOutOfStock && mercaderia.stock_actual <= stockMinimo;

  const genericStockText = isOutOfStock
    ? 'Agotado'
    : isLowStock
    ? 'Stock mínimo'
    : 'Disponible';

  const categoriaNombre = mercaderia.categorias?.nombre || 'General';

  return (
    <article
      id={`mercaderia-${mercaderia.codigo_mercaderia}`}
      className="product-card"
    >
      {/* Media / Placeholder estilizado */}
      <div
        className="product-card-media"
        onClick={() => onViewDetails?.(mercaderia)}
        style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
      >
        <span
          className={`product-card-stock-pill ${
            isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : ''
          }`}
          title={isPublicSimple ? genericStockText : 'Stock actual en inventario'}
        >
          {isPublicSimple
            ? genericStockText
            : isOutOfStock
            ? 'Agotado'
            : isLowStock
            ? `¡Solo ${mercaderia.stock_actual}!`
            : `Stock: ${mercaderia.stock_actual}`}
        </span>

        <div className="product-card-placeholder">
          <div className="product-card-placeholder-icon">
            <Icons.Package size={30} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>
            {mercaderia.codigo_mercaderia}
          </span>
        </div>
      </div>

      {/* Cuerpo de la tarjeta */}
      <div className="product-card-body">
        <span className="product-card-category">
          {categoriaNombre}
        </span>

        <h3
          className="product-card-title"
          title={mercaderia.nombre}
          onClick={() => onViewDetails?.(mercaderia)}
          style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
        >
          {mercaderia.nombre}
        </h3>

        {/* En vista pública sólo se muestra el indicador genérico de stock */}
        {isPublicSimple ? (
          <div
            style={{
              marginTop: 'auto',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: isOutOfStock ? '#94a3b8' : isLowStock ? '#ef4444' : '#10b981',
                display: 'inline-block',
              }}
            />
            <span>Estado: <strong>{genericStockText}</strong></span>
          </div>
        ) : (
          <div className="product-card-price-row">
            <div className="product-card-price">
              {formatQuetzales(mercaderia.precio_unitario)}
            </div>
            <span className="product-card-unit">/ unidad</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="product-card-actions">
          {isPublicSimple ? (
            <button
              type="button"
              className="btn-card-primary"
              onClick={() => onViewDetails?.(mercaderia)}
            >
              <span>Ver información</span>
              <Icons.ArrowRight size={15} />
            </button>
          ) : (
            <>
              <button
                type="button"
                className="btn-card-primary"
                onClick={() => onAddToCart?.(mercaderia)}
                disabled={isOutOfStock || isAdding}
                title={isOutOfStock ? 'Sin existencias disponibles' : actionLabel}
              >
                <Icons.ShoppingCart size={15} />
                <span>{isAdding ? 'Añadiendo...' : actionLabel}</span>
              </button>

              {onViewDetails && (
                <button
                  type="button"
                  className="btn-card-secondary-square"
                  onClick={() => onViewDetails(mercaderia)}
                  title="Ver detalles completos"
                  aria-label="Ver detalles"
                >
                  <Icons.ArrowRight size={17} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
