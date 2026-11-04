import { supabase } from '../../../utils/supabase';
import type { UserData, UserRole } from '../../../utils/auth';

/**
 * QUERIES - Usuarios según esquema Supabase:
 * public.usuarios: id, nombre, correo, rol_id, telegram_username, estado, created_at
 * public.roles: id, nombre, descripcion
 */

export async function getAllUsersQuery(): Promise<UserData[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*, roles:rol_id(id, nombre, descripcion)')
    .order('nombre', { ascending: true });

  if (error) throw new Error(`Error al obtener usuarios: ${error.message}`);
  if (!data) return [];

  return data.map((u: any) => mapUserData(u));
}

export async function getUserProfileQuery(userId: string): Promise<UserData | null> {
  const { data: userData, error } = await supabase
    .from('usuarios')
    .select('*, roles:rol_id(id, nombre, descripcion)')
    .eq('id', userId)
    .single();

  if (error) {
    console.error(`Error al obtener perfil para usuario ${userId}:`, error.message);
    return null;
  }
  if (!userData) return null;

  return mapUserData(userData);
}

function mapUserData(raw: any): UserData {
  const roleName: UserRole = (raw.roles?.nombre || 'colaborador').toLowerCase() as UserRole;
  return {
    id: raw.id,
    nombre: raw.nombre || '',
    correo: raw.correo || '',
    rol_id: raw.rol_id,
    rol: roleName,
    rolNombre: raw.roles?.nombre || roleName,
    telegram_username: raw.telegram_username,
    estado: raw.estado !== false,
  };
}
