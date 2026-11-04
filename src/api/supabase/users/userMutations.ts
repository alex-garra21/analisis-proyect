import { supabase } from '../../../utils/supabase';

/**
 * MUTATIONS - Gestión de usuarios según esquema oficial
 */

export async function updateUserMutation(userId: string, data: {
  nombre?: string;
  rol_id?: number | null;
  telegram_username?: string | null;
  estado?: boolean;
}): Promise<{ success: boolean; error?: any }> {
  const { error } = await supabase
    .from('usuarios')
    .update(data)
    .eq('id', userId);

  if (error) {
    console.error('Error al actualizar usuario:', error);
    return { success: false, error };
  }
  return { success: true };
}

export async function toggleUserStatusMutation(userId: string, estado: boolean): Promise<{ success: boolean; error?: any }> {
  return updateUserMutation(userId, { estado });
}
