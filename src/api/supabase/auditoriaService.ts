import { supabase } from '../../utils/supabase';
import type { AuditoriaRegistro } from '../../types/database';

export interface RegistrarAuditoriaInput {
  usuario_id?: string | null;
  modulo: string;
  accion: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'APROBAR' | 'RECHAZAR' | string;
  descripcion: string;
  detalles?: Record<string, any> | null;
}

/**
 * Consulta directa a public.auditoria_sistema ordenada por fecha descendente.
 * Intenta enriquecer con la información del usuario de forma relacional limpia.
 */
export async function getAuditoriaQuery(): Promise<AuditoriaRegistro[]> {
  try {
    const { data, error } = await supabase
      .from('auditoria_sistema')
      .select(`
        id,
        usuario_id,
        modulo,
        accion,
        descripcion,
        detalles,
        created_at,
        usuarios:usuario_id (
          id,
          nombre,
          apellido,
          correo
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback en caso de que la clave foránea no tenga el alias relacional o apunte directo a auth.users
      console.warn('Consultando auditoria_sistema sin join de usuario:', error.message);
      const { data: flatData, error: flatError } = await supabase
        .from('auditoria_sistema')
        .select('*')
        .order('created_at', { ascending: false });

      if (flatError) {
        console.error('Error al consultar auditoria_sistema:', flatError);
        throw new Error(flatError.message);
      }
      return (flatData || []) as AuditoriaRegistro[];
    }

    return (data || []) as AuditoriaRegistro[];
  } catch (err: any) {
    console.error('Error inesperado en getAuditoriaQuery:', err);
    throw err;
  }
}

/**
 * Helper auxiliar para registrar eventos de auditoría desde el frontend
 * sin utilizar triggers de PostgreSQL ni tipos compuestos.
 */
export async function registrarAuditoria(input: RegistrarAuditoriaInput): Promise<boolean> {
  try {
    let uid = input.usuario_id;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      uid = user?.id || null;
    }

    const { error } = await supabase
      .from('auditoria_sistema')
      .insert({
        usuario_id: uid,
        modulo: String(input.modulo).trim().toLowerCase(),
        accion: String(input.accion).trim().toUpperCase(),
        descripcion: String(input.descripcion).trim(),
        detalles: input.detalles ?? null,
      });

    if (error) {
      console.error('Error al registrar auditoría:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error inesperado en registrarAuditoria:', err);
    return false;
  }
}
