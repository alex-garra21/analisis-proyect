/**
 * Definiciones de Tipos de Datos estrictamente alineadas con el esquema oficial de Supabase:
 * - roles
 * - usuarios
 * - categorias
 * - mercaderias
 * - clientes
 * - cotizaciones
 * - detalle_cotizacion
 */

export type RoleName = 'sistemas' | 'administrador' | 'colaborador';

export interface Role {
  id: number;
  nombre: RoleName;
  descripcion?: string | null;
  created_at: string;
}

export interface Usuario {
  id: string; // uuid references auth.users(id)
  nombre: string;
  correo: string;
  rol_id: number | null;
  telegram_username?: string | null;
  estado: boolean;
  created_at: string;
  // Relación cargada por join
  roles?: {
    id: number;
    nombre: RoleName;
    descripcion?: string | null;
  } | null;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  created_at: string;
}

export interface Mercaderia {
  id: number;
  categoria_id: number | null;
  codigo_mercaderia: string;
  nombre: string;
  stock_actual: number;
  precio_unitario: number;
  created_at: string;
  // Relación cargada por join
  categorias?: {
    id: number;
    nombre: string;
    descripcion?: string | null;
  } | null;
}

export interface Cliente {
  id: number;
  nombre_institucion: string;
  contacto_persona?: string | null;
  nit?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  created_at: string;
}

export type CanalOrigen = 'web' | 'telegram';
export type EstadoCotizacion = 'Pendiente' | 'Aprobada' | 'Anulada' | string;

export interface Cotizacion {
  id: number;
  codigo_cotizacion: string;
  cliente_id: number;
  colaborador_id?: string | null;
  canal_origen: CanalOrigen;
  telegram_chat_id?: string | null;
  total_quetzales: number;
  estado: EstadoCotizacion;
  fecha_emision: string;
  // Relaciones
  clientes?: Cliente | null;
  usuarios?: Usuario | null;
  detalle_cotizacion?: DetalleCotizacion[];
}

export interface DetalleCotizacion {
  id: number;
  cotizacion_id: number;
  mercaderia_id: number;
  cantidad: number;
  precio_aplicado: number;
  created_at: string;
  // Relación
  mercaderias?: Mercaderia | null;
}

/** Formateador estándar de moneda en Quetzales (Q.) */
export const formatQuetzales = (value: number | string | null | undefined): string => {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
  return `Q. ${(isNaN(num) ? 0 : num).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
