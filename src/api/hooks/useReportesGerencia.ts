import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../utils/supabase';
import type { ReporteInteligenteGerenciaVista } from '../../types/database';

/**
 * Normaliza y clasifica un registro para asegurar que la tabla resumen inferior
 * y la IA reciban información estrictamente ejecutiva sin tecnicismos de base de datos.
 */
export function clasificarRegistroComercial(raw: any): ReporteInteligenteGerenciaVista {
  const modStr = String(raw.modulo || '').toLowerCase();
  const accStr = String(raw.accion || '').toLowerCase();
  const descStr = String(raw.detalle_comercial_amigable || raw.descripcion || '').toLowerCase();
  const detalles = raw.detalles || {};

  let moduloFinal = 'GENERAL';
  let detalleFinal = raw.detalle_comercial_amigable || raw.descripcion || 'Operación comercial registrada.';

  // 1. Ingreso de Mercadería / Devolución / Retiro (Modal de Ajuste de Stock e Inventario)
  const esIngreso =
    descStr.includes('ingreso') ||
    accStr.includes('ingreso') ||
    (modStr.includes('inventario') && descStr.includes('suma'));

  const esDevolucion =
    descStr.includes('devoluci') ||
    descStr.includes('retiro') ||
    accStr.includes('devolucion') ||
    accStr.includes('retiro');

  const esAjusteStock =
    esIngreso ||
    esDevolucion ||
    modStr.includes('inventario') ||
    accStr.includes('ajuste_stock') ||
    descStr.includes('ajuste de stock') ||
    (detalles.stock_actual !== undefined && detalles.precio_unitario === undefined);

  // 2. Nueva Mercadería (Alta desde botón Nueva Mercadería en catálogo)
  const esNuevaMercaderia =
    !esAjusteStock &&
    (modStr.includes('mercader') || modStr.includes('catálogo') || modStr.includes('catalogo')) &&
    (accStr === 'insert' ||
      accStr.includes('nueva') ||
      descStr.includes('nueva mercader') ||
      descStr.includes('nuevo producto') ||
      descStr.includes('alta de mercader'));

  // 3. Modificación de Precios (Precios unitarios en catálogo o inventario)
  const esModificacionPrecio =
    !esNuevaMercaderia &&
    !esAjusteStock &&
    (descStr.includes('precio') ||
      accStr.includes('precio') ||
      detalles.precio_unitario !== undefined);

  // 4. Cotizaciones
  const esCotizacion = modStr.includes('cotiza');

  // 5. Clientes
  const esCliente = modStr.includes('cliente');

  // Asignación de Módulo Ejecutivo
  if (esAjusteStock) {
    moduloFinal = 'AJUSTE DE STOCK';
    if (esIngreso) {
      detalleFinal = 'Ingreso de Mercadería: Recepción y suma de stock al inventario en almacén.';
    } else if (esDevolucion) {
      detalleFinal = 'Ajuste de Inventario: Devolución o retiro de mercadería registrado en stock.';
    } else {
      detalleFinal = 'Ajuste de Stock: Actualización de existencias físicas en inventario.';
    }
  } else if (esNuevaMercaderia) {
    moduloFinal = 'NUEVA MERCADERÍA';
    detalleFinal = 'Nueva Mercadería: Alta de nuevo producto o suministro registrado en catálogo.';
  } else if (esModificacionPrecio) {
    moduloFinal = 'MODIFICACIÓN DE PRECIOS';
    detalleFinal = 'Modificación de Precios: Actualización de precio unitario en catálogo comercial.';
  } else if (esCotizacion) {
    moduloFinal = 'COTIZACIONES';
    if (descStr.includes('aprob') || accStr.includes('aprobar')) {
      detalleFinal = 'Venta Concretada: Cierre comercial efectivo y cotización aprobada para despacho.';
    } else if (descStr.includes('rechaz') || descStr.includes('anul') || accStr.includes('rechazar')) {
      detalleFinal = 'Oportunidad No Concretada: Cotización descartada o compra no efectuada.';
    } else {
      detalleFinal = 'Propuesta Comercial: Presupuesto emitido en fase de negociación.';
    }
  } else if (esCliente) {
    moduloFinal = 'CLIENTES';
    if (accStr === 'insert' || descStr.includes('nuevo')) {
      detalleFinal = 'Cartera de Clientes: Alta y registro de nuevo cliente en la plataforma.';
    } else {
      detalleFinal = 'Cartera de Clientes: Actualización de datos comerciales del cliente.';
    }
  } else if (modStr.includes('categor')) {
    moduloFinal = 'CATEGORÍAS';
  } else if (modStr.includes('unidad')) {
    moduloFinal = 'UNIDADES DE MEDIDA';
  } else {
    moduloFinal = (raw.modulo || 'GENERAL').toUpperCase();
    // Limpieza de tecnicismos
    detalleFinal = detalleFinal
      .replace(/\b(INSERT|UPDATE|DELETE|SELECT|TABLE|TRIGGER|UUID)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Nombre amigable de usuario responsable
  let usuarioNombre = 'Equipo Comercial';
  if (raw.usuario_responsable) {
    usuarioNombre = raw.usuario_responsable;
  } else if (raw.usuarios?.nombre) {
    usuarioNombre = `${raw.usuarios.nombre} ${raw.usuarios.apellido || ''}`.trim();
  } else if (raw.usuarios?.correo) {
    usuarioNombre = raw.usuarios.correo;
  }

  return {
    id: raw.id,
    created_at: raw.created_at,
    modulo: moduloFinal,
    usuario_responsable: usuarioNombre,
    detalle_comercial_amigable: detalleFinal,
    accion: raw.accion,
    descripcion: raw.descripcion,
    detalles: raw.detalles,
  };
}

/**
 * Consulta directa a la vista de base de datos vw_reportes_inteligentes_gerencia
 * con fallback y normalización integral garantizada.
 */
export async function getReportesInteligentesGerenciaQuery(): Promise<ReporteInteligenteGerenciaVista[]> {
  try {
    const { data, error } = await supabase
      .from('vw_reportes_inteligentes_gerencia')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Advertencia al consultar vw_reportes_inteligentes_gerencia:', error.message);
      // Fallback a auditoria_sistema si la vista estuviera en proceso de migración
      const { data: fallbackData } = await supabase
        .from('auditoria_sistema')
        .select(`
          id,
          modulo,
          accion,
          created_at,
          descripcion,
          detalles,
          usuarios:usuario_id (nombre, apellido, correo)
        `)
        .order('created_at', { ascending: false });

      if (fallbackData) {
        return fallbackData.map(clasificarRegistroComercial);
      }

      throw new Error(error.message);
    }

    return (data || []).map(clasificarRegistroComercial);
  } catch (err: any) {
    console.error('Error inesperado en getReportesInteligentesGerenciaQuery:', err);
    throw err;
  }
}

export function useReportesGerencia() {
  return useQuery({
    queryKey: ['vw_reportes_inteligentes_gerencia'],
    queryFn: getReportesInteligentesGerenciaQuery,
    staleTime: 1000 * 5, // 5 segundos
    refetchOnWindowFocus: true,
  });
}
