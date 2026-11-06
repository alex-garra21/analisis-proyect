import { supabase } from '../../utils/supabase';
import type { Mercaderia, Cliente, Cotizacion, CanalOrigen } from '../../types/database';

// ============================================================================
// 0. GESTIÓN DE CATEGORÍAS (MÓDULO DE REFERENCIA)
// ============================================================================

/**
 * 0.1 Crear nueva categoría de mercadería
 */
export async function createCategoriaMutation(nombre: string, descripcion?: string | null): Promise<number> {
  const cleanNombre = nombre.trim();
  // Verificar si ya existe para reutilizar
  const { data: existing } = await supabase
    .from('categorias')
    .select('id')
    .ilike('nombre', cleanNombre)
    .maybeSingle();

  if (existing?.id) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from('categorias')
    .insert({ nombre: cleanNombre, descripcion: descripcion?.trim() || null })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error(`Error al registrar categoría: ${error?.message || 'Error desconocido'}`);
  }

  return data.id;
}

/**
 * 0.2 Actualizar categoría existente
 */
export async function updateCategoriaMutation(id: number, data: { nombre: string; descripcion?: string | null }): Promise<void> {
  const { error } = await supabase
    .from('categorias')
    .update({
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar categoría:', error);
    throw new Error(`Error al actualizar categoría: ${error.message}`);
  }
}

/**
 * 0.3 Eliminar categoría de forma segura
 */
export async function deleteCategoriaMutation(id: number): Promise<void> {
  // Verificar si existen mercaderías asociadas
  const { count, error: countError } = await supabase
    .from('mercaderias')
    .select('id', { count: 'exact', head: true })
    .eq('categoria_id', id);

  if (countError) {
    throw new Error(`Error al verificar productos asociados: ${countError.message}`);
  }

  if (count && count > 0) {
    throw new Error(`No se puede eliminar la categoría porque tiene ${count} producto(s) asociado(s).`);
  }

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar categoría:', error);
    throw new Error(`Error al eliminar categoría: ${error.message}`);
  }
}

/**
 * 0.4 Verificar si un código de mercadería ya existe en public.mercaderias
 */
export async function checkCodigoMercaderiaExists(codigo: string): Promise<boolean> {
  const { data } = await supabase
    .from('mercaderias')
    .select('id')
    .eq('codigo_mercaderia', codigo.trim().toUpperCase())
    .maybeSingle();

  return Boolean(data);
}

// ============================================================================
// 1. GESTIÓN DE CLIENTES
// ============================================================================

export interface CreateClienteInput {
  nombre_institucion: string;
  contacto_persona?: string | null;
  nit?: string | null;
  telefono?: string | null;
  direccion?: string | null;
}

/**
 * 1.1 Crear nuevo cliente
 * Inserción directa en public.clientes con objeto plano
 */
export async function createClienteMutation(input: CreateClienteInput): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .insert({
      nombre_institucion: String(input.nombre_institucion || '').trim(),
      contacto_persona: input.contacto_persona ? String(input.contacto_persona).trim() : null,
      nit: input.nit ? String(input.nit).trim() : null,
      telefono: input.telefono ? String(input.telefono).trim() : null,
      direccion: input.direccion ? String(input.direccion).trim() : null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error al registrar cliente:', error);
    throw new Error(`Error al crear cliente: ${error?.message || 'Error desconocido'}`);
  }

  return {
    id: data.id,
    nombre_institucion: String(input.nombre_institucion || '').trim(),
    contacto_persona: input.contacto_persona ? String(input.contacto_persona).trim() : null,
    nit: input.nit ? String(input.nit).trim() : null,
    telefono: input.telefono ? String(input.telefono).trim() : null,
    direccion: input.direccion ? String(input.direccion).trim() : null,
  } as Cliente;
}

/**
 * 1.2 Actualizar cliente existente
 * Actualización directa en public.clientes con objeto plano
 */
export async function updateClienteMutation(id: number, input: CreateClienteInput): Promise<Cliente> {
  const { error } = await supabase
    .from('clientes')
    .update({
      nombre_institucion: String(input.nombre_institucion || '').trim(),
      contacto_persona: input.contacto_persona ? String(input.contacto_persona).trim() : null,
      nit: input.nit ? String(input.nit).trim() : null,
      telefono: input.telefono ? String(input.telefono).trim() : null,
      direccion: input.direccion ? String(input.direccion).trim() : null,
    })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar cliente:', error);
    throw new Error(`Error al actualizar cliente: ${error.message}`);
  }

  return {
    id,
    nombre_institucion: String(input.nombre_institucion || '').trim(),
    contacto_persona: input.contacto_persona ? String(input.contacto_persona).trim() : null,
    nit: input.nit ? String(input.nit).trim() : null,
    telefono: input.telefono ? String(input.telefono).trim() : null,
    direccion: input.direccion ? String(input.direccion).trim() : null,
  } as Cliente;
}

/**
 * 1.3 Eliminar cliente de forma segura
 */
export async function deleteClienteMutation(id: number): Promise<void> {
  // Verificar si existen cotizaciones vinculadas
  const { count, error: countError } = await supabase
    .from('cotizaciones')
    .select('id', { count: 'exact', head: true })
    .eq('cliente_id', id);

  if (countError) {
    throw new Error(`Error al verificar cotizaciones asociadas: ${countError.message}`);
  }

  if (count && count > 0) {
    throw new Error(`No se puede eliminar el cliente porque tiene ${count} cotización(es) asociada(s).`);
  }

  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar cliente:', error);
    throw new Error(`Error al eliminar cliente: ${error.message}`);
  }
}

// ============================================================================
// 2. CATÁLOGO DE MERCADERÍAS
// ============================================================================

export interface CreateMercaderiaInput {
  codigo_mercaderia: string;
  nombre: string;
  categoria_id?: number | null;
  nueva_categoria?: string;
  precio_unitario: number;
  stock_actual: number;
  unidad_medida_id?: number | null;
}

/**
 * 2.1 Crear nueva mercadería en el catálogo
 * Inserción directa en public.mercaderias con objeto plano
 */
export async function createMercaderiaMutation(
  input: CreateMercaderiaInput
): Promise<Mercaderia> {
  let targetCategoriaId = input.categoria_id ? Number(input.categoria_id) : null;

  if (input.nueva_categoria && input.nueva_categoria.trim()) {
    targetCategoriaId = await createCategoriaMutation(input.nueva_categoria.trim());
  }

  const { data, error } = await supabase
    .from('mercaderias')
    .insert({
      codigo_mercaderia: String(input.codigo_mercaderia || '').trim().toUpperCase(),
      nombre: String(input.nombre || '').trim(),
      categoria_id: targetCategoriaId,
      precio_unitario: Number(Number(input.precio_unitario || 0).toFixed(2)),
      stock_actual: Math.floor(Number(input.stock_actual || 0)),
      unidad_medida_id: input.unidad_medida_id ? Number(input.unidad_medida_id) : null,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error al crear mercadería:', error);
    throw new Error(`Error al registrar mercadería: ${error?.message || 'Error desconocido'}`);
  }

  return {
    id: data.id,
    codigo_mercaderia: String(input.codigo_mercaderia || '').trim().toUpperCase(),
    nombre: String(input.nombre || '').trim(),
    categoria_id: targetCategoriaId,
    precio_unitario: Number(Number(input.precio_unitario || 0).toFixed(2)),
    stock_actual: Math.floor(Number(input.stock_actual || 0)),
    unidad_medida_id: input.unidad_medida_id ? Number(input.unidad_medida_id) : null,
  } as unknown as Mercaderia;
}

export interface UpdateMercaderiaDatosGeneralesInput {
  id: number;
  nombre: string;
  categoria_id?: number | null;
  nueva_categoria?: string;
  codigo_mercaderia?: string;
  unidad_medida_id?: number | null;
}

/**
 * 2.2 Actualizar datos generales de mercadería (Excluye precio y stock)
 * Actualización directa en public.mercaderias
 */
export async function updateMercaderiaGeneralMutation(
  input: UpdateMercaderiaDatosGeneralesInput
): Promise<Mercaderia> {
  let targetCategoriaId = input.categoria_id ? Number(input.categoria_id) : null;

  if (input.nueva_categoria && input.nueva_categoria.trim()) {
    targetCategoriaId = await createCategoriaMutation(input.nueva_categoria.trim());
  }

  const updateData: Record<string, any> = {
    nombre: String(input.nombre || '').trim(),
    categoria_id: targetCategoriaId,
  };

  if (input.codigo_mercaderia && input.codigo_mercaderia.trim()) {
    updateData.codigo_mercaderia = String(input.codigo_mercaderia).trim().toUpperCase();
  }

  if (input.unidad_medida_id !== undefined) {
    updateData.unidad_medida_id = input.unidad_medida_id ? Number(input.unidad_medida_id) : null;
  }

  const { error } = await supabase
    .from('mercaderias')
    .update(updateData)
    .eq('id', input.id);

  if (error) {
    console.error('Error al actualizar datos de mercadería:', error);
    throw new Error(`Error al actualizar mercadería: ${error.message}`);
  }

  return { id: input.id, ...updateData } as unknown as Mercaderia;
}

// ============================================================================
// 3. GESTIÓN DE INVENTARIO (AJUSTE DE STOCK)
// ============================================================================

/**
 * 3.1 Actualizar stock de mercadería (Ingreso o Devolución)
 * Actualización directa sobre el campo stock_actual de public.mercaderias
 */
export async function updateMercaderiaStockMutation(
  id: number,
  nuevoStock: number
): Promise<Mercaderia> {
  const stockFinal = Math.max(0, Math.floor(Number(nuevoStock) || 0));

  const { error } = await supabase
    .from('mercaderias')
    .update({ stock_actual: stockFinal })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar stock:', error);
    throw new Error(`Error al actualizar inventario: ${error.message}`);
  }

  return { id, stock_actual: stockFinal } as unknown as Mercaderia;
}

// ============================================================================
// 4. BANDEJA DE COTIZACIONES
// ============================================================================

export interface ItemCotizacionInput {
  mercaderia_id: number;
  cantidad: number;
  precio_aplicado: number;
}

export interface CreateCotizacionManualInput {
  cliente_id?: number | null;
  nuevo_cliente?: CreateClienteInput;
  colaborador_id?: string | null;
  canal_origen?: CanalOrigen;
  items: ItemCotizacionInput[];
}

/**
 * 4.1 Registrar cotización manual y sus detalles en Supabase
 * Enfoque relacional limpio en dos pasos (Paso A: cabecera, Paso B: detalles individuales)
 */
export async function createCotizacionManualMutation(
  input: CreateCotizacionManualInput
): Promise<Cotizacion> {
  let targetClienteId = input.cliente_id;

  // Si se envió información para crear un nuevo cliente
  if (!targetClienteId && input.nuevo_cliente) {
    const nuevoCliente = await createClienteMutation(input.nuevo_cliente);
    targetClienteId = nuevoCliente.id;
  }

  if (!targetClienteId) {
    throw new Error('Debe especificar un cliente existente o registrar uno nuevo.');
  }

  if (!input.items || input.items.length === 0) {
    throw new Error('Debe agregar al menos un insumo/mercadería a la cotización.');
  }

  // Generar código de cotización único (ej. COT-2026-XXXX)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const year = now.getFullYear();
  const codigo_cotizacion = `COT-${year}-${randomSuffix}`;

  // Calcular total de forma numérica pura
  const total_quetzales = Number(
    input.items
      .reduce((acc, it) => acc + Number(it.cantidad) * Number(it.precio_aplicado), 0)
      .toFixed(2)
  );

  // Paso A: Insertar encabezado en public.cotizaciones y obtener id
  const { data: cotizacion, error: cotizacionError } = await supabase
    .from('cotizaciones')
    .insert({
      codigo_cotizacion: String(codigo_cotizacion),
      cliente_id: Number(targetClienteId),
      colaborador_id: input.colaborador_id ? String(input.colaborador_id) : null,
      canal_origen: String(input.canal_origen || 'web'),
      total_quetzales,
      estado: 'Pendiente',
    })
    .select('id')
    .single();

  if (cotizacionError || !cotizacion) {
    console.error('Error insertando cotización:', cotizacionError);
    throw new Error(`Error al crear la cotización: ${cotizacionError?.message || 'Error desconocido'}`);
  }

  // Paso B: Recorrer los ítems e insertarlos uno por uno en public.detalle_cotizacion
  for (const it of input.items) {
    const { error: detalleError } = await supabase
      .from('detalle_cotizacion')
      .insert({
        cotizacion_id: Number(cotizacion.id),
        mercaderia_id: Number(it.mercaderia_id),
        cantidad: Math.floor(Number(it.cantidad)),
        precio_aplicado: Number(Number(it.precio_aplicado).toFixed(2)),
      });

    if (detalleError) {
      console.error('Error insertando detalle_cotizacion:', detalleError);
      // Rollback de seguridad
      await supabase.from('detalle_cotizacion').delete().eq('cotizacion_id', cotizacion.id);
      await supabase.from('cotizaciones').delete().eq('id', cotizacion.id);
      throw new Error(`Error al registrar el detalle de la cotización: ${detalleError.message}`);
    }
  }

  return {
    id: cotizacion.id,
    codigo_cotizacion,
    cliente_id: Number(targetClienteId),
    colaborador_id: input.colaborador_id || null,
    canal_origen: input.canal_origen || 'web',
    total_quetzales,
    estado: 'Pendiente',
    fecha_emision: new Date().toISOString(),
  } as unknown as Cotizacion;
}

/**
 * 4.2 Actualizar estado de cotización (Aprobar / Rechazar)
 * Actualización directa en public.cotizaciones con fecha_actualizacion
 */
export async function updateCotizacionEstadoMutation(
  cotizacionId: number,
  estado: 'Aprobada' | 'Rechazada'
): Promise<void> {
  const { error } = await supabase
    .from('cotizaciones')
    .update({
      estado,
      fecha_actualizacion: new Date().toISOString(),
    })
    .eq('id', cotizacionId);

  if (error) {
    console.error(`Error al actualizar estado de cotización #${cotizacionId} a ${estado}:`, error);
    throw new Error(`Error al actualizar estado: ${error.message}`);
  }
}

// ============================================================================
// 5. GESTIÓN DE UNIDADES DE MEDIDA
// ============================================================================

export interface CreateUnidadMedidaInput {
  nombre: string;
  abreviatura?: string | null;
  activo?: boolean;
}

export interface UpdateUnidadMedidaInput {
  nombre: string;
  abreviatura?: string | null;
  activo?: boolean;
}

/**
 * 5.1 Crear nueva unidad de medida
 * Inserción directa en public.unidades_medida con objeto plano
 */
export async function createUnidadMedidaMutation(input: CreateUnidadMedidaInput): Promise<number> {
  const cleanNombre = input.nombre.trim();
  const cleanAbrev = input.abreviatura ? input.abreviatura.trim().toUpperCase() : null;

  const { data, error } = await supabase
    .from('unidades_medida')
    .insert({
      nombre: cleanNombre,
      abreviatura: cleanAbrev,
      activo: input.activo !== undefined ? input.activo : true,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('Error al registrar unidad de medida:', error);
    throw new Error(`Error al registrar unidad de medida: ${error?.message || 'Error desconocido'}`);
  }

  return data.id;
}

/**
 * 5.2 Actualizar unidad de medida existente
 */
export async function updateUnidadMedidaMutation(id: number, data: UpdateUnidadMedidaInput): Promise<void> {
  const updatePayload: Record<string, any> = {
    nombre: data.nombre.trim(),
    abreviatura: data.abreviatura ? data.abreviatura.trim().toUpperCase() : null,
  };
  if (data.activo !== undefined) {
    updatePayload.activo = Boolean(data.activo);
  }

  const { error } = await supabase
    .from('unidades_medida')
    .update(updatePayload)
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar unidad de medida:', error);
    throw new Error(`Error al actualizar unidad de medida: ${error.message}`);
  }
}

/**
 * 5.3 Cambiar estado activo/inactivo de unidad de medida
 */
export async function toggleUnidadMedidaStatusMutation(id: number, activo: boolean): Promise<void> {
  const { error } = await supabase
    .from('unidades_medida')
    .update({ activo })
    .eq('id', id);

  if (error) {
    console.error('Error al cambiar estado de unidad de medida:', error);
    throw new Error(`Error al cambiar estado: ${error.message}`);
  }
}

/**
 * 5.4 Eliminar unidad de medida de forma segura
 */
export async function deleteUnidadMedidaMutation(id: number): Promise<void> {
  const { count, error: countError } = await supabase
    .from('mercaderias')
    .select('id', { count: 'exact', head: true })
    .eq('unidad_medida_id', id);

  if (countError) {
    throw new Error(`Error al verificar productos asociados: ${countError.message}`);
  }

  if (count && count > 0) {
    throw new Error(`No se puede eliminar la unidad porque está asignada a ${count} producto(s). Puedes desactivarla en su lugar.`);
  }

  const { error } = await supabase
    .from('unidades_medida')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar unidad de medida:', error);
    throw new Error(`Error al eliminar unidad de medida: ${error.message}`);
  }
}
