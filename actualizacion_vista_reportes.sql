-- ============================================================================
-- SCRIPT DE ACTUALIZACIÓN: VISTA VW_REPORTES_INTELIGENTES_GERENCIA
-- Objetivo: Clasificación ejecutiva limpia de operaciones comerciales para IA y Gerencia
--           (Ingreso/Devolución de mercadería, Nueva Mercadería, Modificación de Precios, etc.)
-- ============================================================================

DROP VIEW IF EXISTS public.vw_reportes_inteligentes_gerencia CASCADE;

CREATE OR REPLACE VIEW public.vw_reportes_inteligentes_gerencia AS
SELECT 
    a.id,
    a.created_at,
    
    -- 1. CLASIFICACIÓN DE ÁREA / OPERACIÓN COMERCIAL
    CASE
        -- A. INGRESO DE MERCADERÍA / DEVOLUCIÓN / RETIRO (Modal 'Ajuste de Stock e Inventario')
        WHEN LOWER(a.modulo) IN ('inventario', 'mercaderias') AND (
            LOWER(a.accion) IN ('ajuste_stock', 'ingreso', 'devolucion', 'retiro', 'ajuste')
            OR LOWER(a.descripcion) LIKE '%ajuste de stock%'
            OR LOWER(a.descripcion) LIKE '%ingreso%'
            OR LOWER(a.descripcion) LIKE '%devoluci%'
            OR LOWER(a.descripcion) LIKE '%retiro%'
            OR (a.detalles ? 'stock_actual' AND NOT (a.detalles ? 'precio_unitario'))
        ) THEN 'AJUSTE DE STOCK'

        -- B. NUEVA MERCADERÍA (Botón 'Nueva Mercadería' en Catálogo)
        WHEN LOWER(a.modulo) = 'mercaderias' AND (
            LOWER(a.accion) IN ('insert', 'nueva_mercaderia', 'alta')
            OR LOWER(a.descripcion) LIKE '%nueva mercader%'
            OR LOWER(a.descripcion) LIKE '%nuevo producto%'
            OR LOWER(a.descripcion) LIKE '%alta de mercader%'
        ) THEN 'NUEVA MERCADERÍA'

        -- C. MODIFICACIÓN DE PRECIOS (Precios unitarios en catálogo o inventario)
        WHEN (LOWER(a.modulo) IN ('mercaderias', 'inventario', 'catalogo')) AND (
            LOWER(a.accion) IN ('precio', 'cambio_precio', 'modificacion_precio')
            OR LOWER(a.descripcion) LIKE '%precio%'
            OR (a.detalles ? 'precio_unitario')
        ) THEN 'MODIFICACIÓN DE PRECIOS'

        -- D. COTIZACIONES Y CIERRES COMERCIALES
        WHEN LOWER(a.modulo) = 'cotizaciones' THEN 'COTIZACIONES'

        -- E. CARTERA DE CLIENTES
        WHEN LOWER(a.modulo) = 'clientes' THEN 'CLIENTES'

        -- F. OTROS MÓDULOS DE SOPORTE
        WHEN LOWER(a.modulo) = 'categorias' THEN 'CATEGORÍAS'
        WHEN LOWER(a.modulo) = 'unidades_medida' THEN 'UNIDADES DE MEDIDA'
        ELSE UPPER(COALESCE(a.modulo, 'GENERAL'))
    END AS modulo,

    -- 2. NOMBRE REAL DEL USUARIO RESPONSABLE MEDIANTE JOIN
    COALESCE(
        NULLIF(TRIM(CONCAT(u.nombre, ' ', COALESCE(u.apellido, ''))), ''),
        u.correo,
        'Equipo Comercial'
    ) AS usuario_responsable,

    -- 3. DETALLE COMERCIAL AMIGABLE (CERO TECNICISMOS DE INSERT/UPDATE/DELETE)
    CASE
        -- A. Ingreso de Mercadería (Ajuste de Stock: Recepción de inventario)
        WHEN (LOWER(a.modulo) IN ('inventario', 'mercaderias') OR LOWER(a.accion) IN ('ingreso', 'ajuste_stock'))
             AND (LOWER(a.descripcion) LIKE '%ingreso%' OR LOWER(a.accion) = 'ingreso') THEN
            'Ingreso de Mercadería: Recepción y suma de stock al inventario en almacén.'

        -- B. Devolución / Retiro de Stock (Ajuste de Stock: Salida/Merma)
        WHEN (LOWER(a.modulo) IN ('inventario', 'mercaderias'))
             AND (LOWER(a.descripcion) LIKE '%devoluci%' OR LOWER(a.descripcion) LIKE '%retiro%' OR LOWER(a.accion) IN ('devolucion', 'retiro')) THEN
            'Ajuste de Inventario: Devolución o retiro de mercadería registrado en stock.'

        -- C. Ajuste general de existencias
        WHEN LOWER(a.modulo) = 'inventario' OR LOWER(a.accion) = 'ajuste_stock' OR LOWER(a.descripcion) LIKE '%stock%' THEN
            'Ajuste de Stock: Actualización de existencias físicas disponibles en almacén.'

        -- D. Nueva Mercadería (Alta en Catálogo)
        WHEN LOWER(a.modulo) = 'mercaderias' AND (LOWER(a.accion) = 'insert' OR LOWER(a.descripcion) LIKE '%nueva%' OR LOWER(a.descripcion) LIKE '%alta%') THEN
            'Nueva Mercadería: Alta de nuevo producto o suministro registrado en el catálogo.'

        -- E. Modificación de Precios
        WHEN LOWER(a.descripcion) LIKE '%precio%' OR (a.detalles ? 'precio_unitario') THEN
            'Modificación de Precios: Actualización de precio unitario en catálogo comercial.'

        -- F. Cotizaciones Aprobadas (Ventas Concretadas)
        WHEN LOWER(a.modulo) = 'cotizaciones' AND (LOWER(a.descripcion) LIKE '%aprob%' OR LOWER(a.accion) = 'aprobar') THEN
            'Venta Concretada: Cierre comercial efectivo y cotización aprobada para despacho.'

        -- G. Cotizaciones Rechazadas / Oportunidades No Concretadas
        WHEN LOWER(a.modulo) = 'cotizaciones' AND (LOWER(a.descripcion) LIKE '%rechaz%' OR LOWER(a.descripcion) LIKE '%anul%') THEN
            'Oportunidad No Concretada: Cotización descartada o no concretada por el cliente.'
        WHEN LOWER(a.modulo) = 'cotizaciones' THEN
            'Propuesta Comercial: Emisión de presupuesto/cotización en proceso de negociación.'

        -- H. Clientes
        WHEN LOWER(a.modulo) = 'clientes' AND (LOWER(a.accion) = 'insert' OR LOWER(a.descripcion) LIKE '%nuevo%') THEN
            'Cartera de Clientes: Alta de nuevo cliente institucional o particular.'
        WHEN LOWER(a.modulo) = 'clientes' THEN
            'Cartera de Clientes: Actualización de datos de contacto o dirección del cliente.'

        -- Limpieza de tecnicismos por defecto
        ELSE 
            REGEXP_REPLACE(
                REGEXP_REPLACE(a.descripcion, '(?i)\b(insert|update|delete|select|table|trigger|uuid|id_\w+)\b', '', 'g'),
                '\s+', ' ', 'g'
            )
    END AS detalle_comercial_amigable,

    a.accion,
    a.descripcion,
    a.detalles
FROM public.auditoria_sistema a
LEFT JOIN public.usuarios u ON a.usuario_id = u.id
ORDER BY a.created_at DESC;

-- Otorgar permisos de consulta a usuarios autenticados
GRANT SELECT ON public.vw_reportes_inteligentes_gerencia TO authenticated;
