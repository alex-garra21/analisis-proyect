import { supabase } from '../../utils/supabase';
import type { Categoria, Mercaderia, Cliente, Cotizacion, UnidadMedida } from '../../types/database';

/**
 * QUERIES - Módulo de Mercaderías e Inventario
 */

export async function getMercaderiasQuery(): Promise<Mercaderia[]> {
  const { data, error } = await supabase
    .from('mercaderias')
    .select('*, categorias:categoria_id(id, nombre, descripcion)')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener mercaderias:', error);
    throw new Error(`Error al obtener mercaderías: ${error.message}`);
  }
  return data || [];
}

export async function getMercaderiaByIdQuery(id: number): Promise<Mercaderia | null> {
  const { data, error } = await supabase
    .from('mercaderias')
    .select('*, categorias:categoria_id(id, nombre, descripcion)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error al obtener mercaderia #${id}:`, error);
    return null;
  }
  return data;
}

export async function getCategoriasQuery(): Promise<Categoria[]> {
  const { data, error } = await supabase
    .from('categorias')
    .select('*')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al obtener categorias:', error);
    throw new Error(`Error al obtener categorías: ${error.message}`);
  }
  return data || [];
}

export async function getUnidadesMedidaQuery(): Promise<UnidadMedida[]> {
  try {
    const { data, error } = await supabase
      .from('unidades_medida')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Error al consultar unidades_medida en Supabase:', error.message);
      return [];
    }

    if (!data) return [];

    return data.map((u) => ({
      id: Number(u.id),
      nombre: String(u.nombre || ''),
      abreviatura: u.abreviatura ? String(u.abreviatura) : null,
      activo: u.activo !== false,
      created_at: u.created_at,
    })) as UnidadMedida[];
  } catch (err) {
    console.error('Error inesperado al obtener unidades de medida:', err);
    return [];
  }
}

/**
 * QUERIES - Módulo de Cotizaciones y Clientes
 */

export async function getCotizacionesQuery(): Promise<Cotizacion[]> {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      clientes:cliente_id(id, nombre_institucion, contacto_persona, nit, telefono, direccion),
      usuarios:colaborador_id(id, nombre, correo, telegram_username)
    `)
    .order('fecha_emision', { ascending: false });

  if (error) {
    console.error('Error al obtener cotizaciones:', error);
    throw new Error(`Error al obtener cotizaciones: ${error.message}`);
  }
  return data || [];
}

export async function getCotizacionByIdQuery(id: number): Promise<Cotizacion | null> {
  const { data, error } = await supabase
    .from('cotizaciones')
    .select(`
      *,
      clientes:cliente_id(id, nombre_institucion, contacto_persona, nit, telefono, direccion),
      usuarios:colaborador_id(id, nombre, correo, telegram_username),
      detalle_cotizacion (
        id,
        cotizacion_id,
        mercaderia_id,
        cantidad,
        precio_aplicado,
        mercaderias:mercaderia_id (
          id,
          codigo_mercaderia,
          nombre,
          precio_unitario,
          stock_actual
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error al obtener cotización #${id}:`, error);
    return null;
  }
  return data;
}

export async function getClientesQuery(): Promise<Cliente[]> {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre_institucion', { ascending: true });

  if (error) {
    console.error('Error al obtener clientes:', error);
    throw new Error(`Error al obtener clientes: ${error.message}`);
  }
  return data || [];
}
