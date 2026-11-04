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

export async function getRolesQuery(): Promise<{ id: number; nombre: string; descripcion?: string | null }[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('id, nombre, descripcion')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error al obtener roles:', error);
    return [
      { id: 1, nombre: 'sistemas', descripcion: 'Superadministrador con acceso total' },
      { id: 2, nombre: 'administrador', descripcion: 'Gestión operativa general' },
      { id: 3, nombre: 'colaborador', descripcion: 'Registro de cotizaciones y operaciones' },
    ];
  }
  return data || [];
}

function mapUserData(raw: any): UserData {
  const roleName: UserRole = (raw.roles?.nombre || 'colaborador').toLowerCase() as UserRole;
  return {
    id: raw.id,
    nombre: raw.nombre || '',
    apellido: raw.apellido || '',
    correo: raw.correo || '',
    rol_id: raw.rol_id,
    rol: roleName,
    rolNombre: raw.roles?.nombre || roleName,
    telegram_username: raw.telegram_username,
    estado: raw.estado !== false,
  };
}
