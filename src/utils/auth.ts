import { supabase } from './supabase';
import type { RoleName } from '../types/database';

export type UserRole = RoleName;

export interface UserData {
  id: string; // UUID de auth.users
  nombre: string;
  correo: string;
  rol_id: number | null;
  rol: UserRole;
  rolNombre?: string;
  telegram_username?: string | null;
  estado: boolean;
  avatarUrl?: string;
}

export const isStaff = (rol?: string | null): boolean => {
  if (!rol) return false;
  const r = rol.toLowerCase().trim();
  return r === 'sistemas' || r === 'administrador';
};

export const isSistemas = (rol?: string | null): boolean => {
  return rol?.toLowerCase().trim() === 'sistemas';
};

export const isColaborador = (rol?: string | null): boolean => {
  return rol?.toLowerCase().trim() === 'colaborador';
};

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  message: string;
  requirements: PasswordRequirement[];
} {
  const requirements: PasswordRequirement[] = [
    { id: 'length', label: 'Mínimo 6 caracteres', met: password.length >= 6 },
    { id: 'uppercase', label: 'Una mayúscula', met: /[A-Z]/.test(password) },
    { id: 'lowercase', label: 'Una minúscula', met: /[a-z]/.test(password) },
    { id: 'number', label: 'Un número', met: /[0-9]/.test(password) },
  ];

  const isValid = requirements.every((r) => r.met);
  return {
    isValid,
    message: isValid ? 'Contraseña segura' : 'La contraseña no cumple con los requisitos mínimos',
    requirements,
  };
}

export async function loginUser(correo: string, contrasena: string): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo.trim().toLowerCase(),
      password: contrasena,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al iniciar sesión' };
  }
}

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { success: false, message: error.message, error: error.message };
    return { success: true, message: 'Correo de recuperación enviado con éxito.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error al enviar correo', error: err.message };
  }
}

export async function changePassword(newPassword: string): Promise<{ success: boolean; message: string; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, message: error.message, error: error.message };
    return { success: true, message: 'Contraseña actualizada correctamente.' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error al actualizar contraseña', error: err.message };
  }
}

export async function verifyAndChangePassword(_currentPw: string, newPassword: string): Promise<{ success: boolean; message: string; error?: string }> {
  return changePassword(newPassword);
}
