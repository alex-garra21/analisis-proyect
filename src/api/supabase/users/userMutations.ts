import { supabase, createIsolatedAuthClient } from '../../../utils/supabase';

/**
 * MUTATIONS - Gestión de usuarios según esquema oficial
 */

export interface CreateUserData {
  nombres: string;
  apellidos: string;
  correo: string;
  passwordTemporal: string;
  rol_id: number;
  telegram_username?: string | null;
}

export async function createUserAdminMutation(data: CreateUserData): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanNombre = data.nombres.trim();
    const cleanApellido = data.apellidos.trim();
    const fullName = `${cleanNombre} ${cleanApellido}`;
    const cleanEmail = data.correo.trim().toLowerCase();
    const cleanTelegram = data.telegram_username ? data.telegram_username.replace(/^@/, '').trim() : null;

    // 1. Usar cliente aislado para registrar credenciales en auth.users sin desloguear al admin
    const isolatedClient = createIsolatedAuthClient();
    const { data: authData, error: authError } = await isolatedClient.auth.signUp({
      email: cleanEmail,
      password: data.passwordTemporal,
      options: {
        data: {
          nombre: cleanNombre,
          apellido: cleanApellido,
          full_name: fullName,
          rol_id: data.rol_id,
          telegram_username: cleanTelegram,
        }
      }
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    if (!authData.user?.id) {
      return { success: false, error: 'No se pudo obtener el identificador del usuario creado.' };
    }

    // 2. Registrar en la tabla pública usuarios vinculando el rol_id, correo, nombre y apellido
    const usuarioPayload = {
      id: String(authData.user.id),
      nombre: cleanNombre,
      apellido: cleanApellido,
      correo: cleanEmail,
      rol_id: Number(data.rol_id),
      telegram_username: cleanTelegram || null,
      estado: true,
    };

    const { error: dbError } = await supabase
      .from('usuarios')
      .upsert(usuarioPayload, { onConflict: 'id' });

    if (dbError) {
      console.error('Error insertando en public.usuarios:', dbError);
      return { success: false, error: `Auth creado pero falló BD: ${dbError.message}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error inesperado al crear usuario' };
  }
}

export async function updateUserMutation(userId: string, data: {
  nombre?: string;
  apellido?: string | null;
  rol_id?: number | null;
  telegram_username?: string | null;
  estado?: boolean;
}): Promise<{ success: boolean; error?: any }> {
  const payload: Record<string, any> = {};

  if (data.nombre !== undefined) payload.nombre = String(data.nombre).trim();
  if (data.apellido !== undefined) payload.apellido = data.apellido ? String(data.apellido).trim() : null;
  if (data.rol_id !== undefined) payload.rol_id = data.rol_id ? Number(data.rol_id) : null;
  if (data.telegram_username !== undefined) {
    payload.telegram_username = data.telegram_username ? String(data.telegram_username).replace(/^@/, '').trim() : null;
  }
  if (data.estado !== undefined) payload.estado = Boolean(data.estado);

  const { error } = await supabase
    .from('usuarios')
    .update(payload)
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
