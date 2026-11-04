import { supabase } from '../../utils/supabase';
import type { Mercaderia, Cliente, Cotizacion, CanalOrigen } from '../../types/database';

export interface CreateMercaderiaInput {
  codigo_mercaderia: string;
  nombre: string;
  categoria_id?: number | null;
  nueva_categoria?: string;
  precio_unitario: number;
  stock_actual: number;
}

/**
 * 0. Crear nueva categoría de mercadería
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
 * 0.1 Actualizar categoría existente
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
 * 0.2 Eliminar categoría de forma segura
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
 * 0.3 Verificar si un código de mercadería ya existe en public.mercaderias
 */
export async function checkCodigoMercaderiaExists(codigo: string): Promise<boolean> {
  const { data } = await supabase
    .from('mercaderias')
    .select('id')
    .eq('codigo_mercaderia', codigo.trim().toUpperCase())
    .maybeSingle();

  return Boolean(data);
}

/**
 * 1. Crear nueva mercadería en el catálogo
 */
export async function createMercaderiaMutation(
  input: CreateMercaderiaInput
): Promise<Mercaderia> {
  let targetCategoriaId = input.categoria_id;

  if (input.nueva_categoria && input.nueva_categoria.trim()) {
    targetCategoriaId = await createCategoriaMutation(input.nueva_categoria.trim());
  }

  const { data, error } = await supabase
    .from('mercaderias')
    .insert({
      codigo_mercaderia: input.codigo_mercaderia.trim().toUpperCase(),
      nombre: input.nombre.trim(),
      categoria_id: targetCategoriaId || null,
      precio_unitario: Number(input.precio_unitario),
      stock_actual: Number(input.stock_actual) || 0,
    })
    .select('*, categorias:categoria_id(id, nombre, descripcion)')
    .single();

  if (error) {
    console.error('Error al crear mercadería:', error);
    throw new Error(`Error al registrar mercadería: ${error.message}`);
  }

  return data;
}

/**
 * 2. Actualizar stock de mercadería (Ingreso o Devolución)
 */

export interface UpdateMercaderiaDatosGeneralesInput {
  id: number;
  nombre: string;
  categoria_id?: number | null;
  nueva_categoria?: string;
  codigo_mercaderia?: string;
}

/**
 * 1.1 Actualizar datos generales de mercadería (Excluye precio y stock)
 */
export async function updateMercaderiaGeneralMutation(
  input: UpdateMercaderiaDatosGeneralesInput
): Promise<Mercaderia> {
  let targetCategoriaId = input.categoria_id;

  if (input.nueva_categoria && input.nueva_categoria.trim()) {
    targetCategoriaId = await createCategoriaMutation(input.nueva_categoria.trim());
  }

  const updatePayload: Record<string, any> = {
    nombre: input.nombre.trim(),
    categoria_id: targetCategoriaId || null,
  };

  if (input.codigo_mercaderia && input.codigo_mercaderia.trim()) {
    updatePayload.codigo_mercaderia = input.codigo_mercaderia.trim().toUpperCase();
  }

  const { data, error } = await supabase
    .from('mercaderias')
    .update(updatePayload)
    .eq('id', input.id)
    .select('*, categorias:categoria_id(id, nombre, descripcion)')
    .single();

  if (error) {
    console.error('Error al actualizar datos de mercadería:', error);
    throw new Error('Error al actualizar mercaderia');
  }

  return data;
}

export async function updateMercaderiaStockMutation(
  id: number,
  nuevoStock: number
): Promise<Mercaderia> {
  const { data, error } = await supabase
    .from('mercaderias')
    .update({ stock_actual: Math.max(0, nuevoStock) })
    .eq('id', id)
    .select('*, categorias:categoria_id(id, nombre, descripcion)')
    .single();

  if (error) {
    console.error('Error al actualizar stock:', error);
    throw new Error(`Error al actualizar inventario: ${error.message}`);
  }

  return data;
}

export interface CreateClienteInput {
  nombre_institucion: string;
  contacto_persona?: string | null;
  nit?: string | null;
  telefono?: string | null;
  direccion?: string | null;
}

/**
 * 3. Crear cliente
 */
export async function createClienteMutation(input: CreateClienteInput): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .insert({
      nombre_institucion: input.nombre_institucion.trim(),
      contacto_persona: input.contacto_persona?.trim() || null,
      nit: input.nit?.trim() || null,
      telefono: input.telefono?.trim() || null,
      direccion: input.direccion?.trim() || null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error al registrar cliente:', error);
    throw new Error(`Error al crear cliente: ${error.message}`);
  }

  return data;
}

/**
 * 3.1 Actualizar cliente existente
 */
export async function updateClienteMutation(id: number, input: CreateClienteInput): Promise<Cliente> {
  const { data, error } = await supabase
    .from('clientes')
    .update({
      nombre_institucion: input.nombre_institucion.trim(),
      contacto_persona: input.contacto_persona?.trim() || null,
      nit: input.nit?.trim() || null,
      telefono: input.telefono?.trim() || null,
      direccion: input.direccion?.trim() || null,
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    console.error('Error al actualizar cliente:', error);
    throw new Error(`Error al actualizar cliente: ${error.message}`);
  }

  return data;
}

/**
 * 3.2 Eliminar cliente de forma segura
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
 * 4. Registrar cotización manual y sus detalles en Supabase
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

  // Calcular total
  const total_quetzales = input.items.reduce(
    (acc, it) => acc + Number(it.cantidad) * Number(it.precio_aplicado),
    0
  );

  // 1. Insertar encabezado de cotización
  const { data: cotizacion, error: cotizacionError } = await supabase
    .from('cotizaciones')
    .insert({
      codigo_cotizacion,
      cliente_id: targetClienteId,
      colaborador_id: input.colaborador_id || null,
      canal_origen: input.canal_origen || 'web',
      total_quetzales,
      estado: 'Pendiente',
    })
    .select(`
      *,
      clientes:cliente_id(id, nombre_institucion, contacto_persona, nit, telefono, direccion),
      usuarios:colaborador_id(id, nombre, correo)
    `)
    .single();

  if (cotizacionError || !cotizacion) {
    console.error('Error insertando cotización:', cotizacionError);
    throw new Error(`Error al crear la cotización: ${cotizacionError?.message}`);
  }

  // 2. Insertar los detalles de cotización
  const detallesToInsert = input.items.map((it) => ({
    cotizacion_id: cotizacion.id,
    mercaderia_id: it.mercaderia_id,
    cantidad: Number(it.cantidad),
    precio_aplicado: Number(it.precio_aplicado),
  }));

  const { error: detalleError } = await supabase
    .from('detalle_cotizacion')
    .insert(detallesToInsert);

  if (detalleError) {
    console.error('Error insertando detalle_cotizacion:', detalleError);
    // Limpieza de rollback en caso de fallo
    await supabase.from('cotizaciones').delete().eq('id', cotizacion.id);
    throw new Error(`Error al registrar el detalle de la cotización: ${detalleError.message}`);
  }

  return cotizacion;
}
