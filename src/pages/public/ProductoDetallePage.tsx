import { useParams, Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routeMap';
import PublicContainer from '../../components/layout/PublicContainer';
import { useMercaderia, useUnidadesMedida } from '../../api/hooks/useComercial';
import { formatQuetzales } from '../../types/database';
import { decodeId } from '../../utils/routerHasher';
import { Icons } from '../../components/Icons';

export default function ProductoDetallePage() {
  const { maskedId } = useParams();
  const rawId = decodeId(maskedId);
  const numericId = rawId ? parseInt(rawId, 10) : null;

  const { data: mercaderia, isLoading } = useMercaderia(numericId);
  const { data: unidades = [] } = useUnidadesMedida();

  if (isLoading) {
    return (
      <PublicContainer badge="Catálogo Oficial" title="Cargando producto..." description="Consultando información en la base de datos.">
        <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Icons.RefreshCw size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: '#C85A32' }} />
          <div>Cargando detalles de la mercadería...</div>
        </div>
      </PublicContainer>
    );
  }

  if (!mercaderia) {
    return (
      <PublicContainer badge="Catálogo Oficial" title="Producto no encontrado" description="El enlace es inválido o el insumo no existe en el catálogo.">
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link
            to={ROUTES.catalogo}
            className="btn-solid"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
          >
            <Icons.ArrowLeft size={16} />
            <span>Volver al Catálogo</span>
          </Link>
        </div>
      </PublicContainer>
    );
  }

  const stockActual = Number(mercaderia.stock_actual) || 0;
  const isOutOfStock = stockActual <= 0;
  const isLowStock = !isOutOfStock && stockActual <= 10;

  // Extracción de unidad desde el código de mercadería
  const codeParts = mercaderia.codigo_mercaderia ? mercaderia.codigo_mercaderia.split('-') : [];
  const unidadAbrev = codeParts.length >= 3 ? codeParts[codeParts.length - 1].toUpperCase() : 'UND';

  // Obtener el nombre completo de la unidad de medida relacionada
  const matchingUnit = unidades.find(
    (u) =>
      (u.abreviatura && u.abreviatura.toUpperCase() === unidadAbrev) ||
      u.nombre.toUpperCase() === unidadAbrev
  );
  const unidadNombreCompleto = matchingUnit?.nombre || (unidadAbrev === 'UND' ? 'Unidades' : unidadAbrev);

  const categoriaNombre = mercaderia.categorias?.nombre || 'General';

  return (
    <PublicContainer
      badge="Catálogo Oficial"
      title="Ficha Informativa de Insumo"
      description="Consulta las especificaciones comerciales y la disponibilidad actual para pedidos institucionales."
      maxWidth="860px"
      padding="4rem 2rem 5rem"
    >
      {/* Botón Superior para volver al catálogo */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={ROUTES.catalogo}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#C85A32',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(200, 90, 50, 0.08)',
            border: '1px solid rgba(200, 90, 50, 0.18)',
            transition: 'background-color 0.2s',
          }}
        >
          <Icons.ArrowLeft size={16} />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      {/* Tarjeta Principal de la Ficha Técnica Pública */}
      <div
        style={{
          backgroundColor: '#FDFBF7',
          border: '1px solid #E6DFD5',
          borderRadius: '12px',
          padding: '2.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          boxShadow: '0 2px 8px rgba(44, 34, 30, 0.04)',
        }}
      >
        {/* Cabecera de la Tarjeta: Categoría y Disponibilidad Comercial */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid #E6DFD5',
          }}
        >
          {/* Categoría */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#7C6E67',
                letterSpacing: '0.5px',
              }}
            >
              Categoría:
            </span>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: 'rgba(200, 90, 50, 0.1)',
                color: '#C85A32',
                border: '1px solid rgba(200, 90, 50, 0.2)',
              }}
            >
              {categoriaNombre}
            </span>
          </div>

          {/* Estado de Disponibilidad (Lógica comercial con abreviatura compacta) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isOutOfStock ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  color: '#dc2626',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626' }} />
                <span>Agotado</span>
              </span>
            ) : isLowStock ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(245, 158, 11, 0.14)',
                  color: '#d97706',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#d97706' }} />
                <span>¡Stock bajo! Quedan {stockActual} {unidadAbrev}</span>
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: 'rgba(22, 163, 74, 0.12)',
                  color: '#16a34a',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#16a34a' }} />
                <span>Disponible</span>
              </span>
            )}
          </div>
        </div>

        {/* Título Principal del Producto */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: '#2C221E',
              margin: 0,
              lineHeight: 1.25,
              letterSpacing: '-0.5px',
            }}
          >
            {mercaderia.nombre}
          </h1>
          <span
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '14px',
              fontWeight: 700,
              color: '#7C6E67',
              letterSpacing: '0.5px',
            }}
          >
            Código Oficial: {mercaderia.codigo_mercaderia}
          </span>
        </div>

        {/* Bloque Destacado de Precio Unitario y Disponibilidad */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            padding: '1.5rem',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E6DFD5',
            borderRadius: '10px',
          }}
        >
          {/* Bloque Precio */}
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#7C6E67',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Precio Unitario
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontSize: '32px',
                  fontWeight: 900,
                  color: '#C85A32',
                  letterSpacing: '-0.5px',
                  lineHeight: 1,
                }}
              >
                {formatQuetzales(mercaderia.precio_unitario)}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#7C6E67' }}>
                / {unidadAbrev}
              </span>
            </div>
          </div>

          {/* Bloque Estado de Inventario */}
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#7C6E67',
                letterSpacing: '0.5px',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Estado de Inventario
            </span>
            <div style={{ marginTop: '4px' }}>
              {isOutOfStock ? (
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#dc2626' }}>
                  Sin existencias actualmente
                </div>
              ) : isLowStock ? (
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#d97706' }}>
                  ¡Últimas unidades! ({stockActual} {unidadAbrev} disponibles)
                </div>
              ) : (
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>
                  En existencia para pedidos
                </div>
              )}
              <span style={{ fontSize: '12px', color: '#7C6E67', display: 'block', marginTop: '4px' }}>
                {isOutOfStock
                  ? 'Consulta reposición con nuestro equipo.'
                  : isLowStock
                  ? 'Asegura tu pedido antes de que se agote.'
                  : 'Listo para cotización y despacho inmediato.'}
              </span>
            </div>
          </div>
        </div>

        {/* Sección de Especificaciones del Insumo */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: '#2C221E',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Especificaciones del Insumo
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              fontSize: '13px',
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E6DFD5',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#7C6E67', display: 'block' }}>
                Código de Mercadería
              </span>
              <strong style={{ fontFamily: 'ui-monospace, monospace', color: '#2C221E', fontSize: '14px', marginTop: '4px', display: 'block' }}>
                {mercaderia.codigo_mercaderia}
              </strong>
            </div>

            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E6DFD5',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#7C6E67', display: 'block' }}>
                Categoría
              </span>
              <strong style={{ color: '#2C221E', fontSize: '14px', marginTop: '4px', display: 'block' }}>
                {categoriaNombre}
              </strong>
            </div>

            {/* Tarjeta de Unidad de Medida con Nombre Completo */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E6DFD5',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#7C6E67', display: 'block' }}>
                Unidad de Medida
              </span>
              <strong style={{ color: '#2C221E', fontSize: '14px', marginTop: '4px', display: 'block' }}>
                {unidadNombreCompleto}
              </strong>
            </div>

            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E6DFD5',
                borderRadius: '8px',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#7C6E67', display: 'block' }}>
                Disponibilidad Comercial
              </span>
              <strong style={{ color: isOutOfStock ? '#dc2626' : isLowStock ? '#d97706' : '#16a34a', fontSize: '14px', marginTop: '4px', display: 'block' }}>
                {isOutOfStock ? 'Agotado' : isLowStock ? `Limitada (${stockActual} ${unidadAbrev})` : 'En existencia para pedidos'}
              </strong>
            </div>
          </div>
        </div>

        {/* Enlace Inferior para Explorar Otros Productos */}
        <div style={{ paddingTop: '1rem', borderTop: '1px solid #E6DFD5', textAlign: 'left' }}>
          <Link
            to={ROUTES.catalogo}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#C85A32',
              fontSize: '13px',
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <Icons.ArrowLeft size={14} />
            <span>Explorar otros productos del catálogo</span>
          </Link>
        </div>
      </div>
    </PublicContainer>
  );
}
