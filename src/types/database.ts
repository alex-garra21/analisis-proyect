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
  apellido?: string | null;
  correo: string;
  rol_id: number | null;
  telegram_username?: string | null;
  estado: boolean;
  created_at: string;
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

export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura?: string | null;
  activo: boolean;
  created_at?: string;
}

export interface Mercaderia {
  id: number;
  categoria_id: number | null;
  codigo_mercaderia: string;
  nombre: string;
  stock_actual: number;
  precio_unitario: number;
  unidad_medida_id?: number | null;
  activo?: boolean;
  created_at: string;
  // Relación cargada por join
  categorias?: {
    id: number;
    nombre: string;
    descripcion?: string | null;
  } | null;
  unidades_medida?: UnidadMedida | null;
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
export type EstadoCotizacion = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Anulada' | string;

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
  fecha_actualizacion?: string | null;
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
  mercaderias?: Mercaderia | null;
}

export interface AuditoriaRegistro {
  id: string; // uuid
  usuario_id: string | null;
  modulo: string;
  accion: string;
  descripcion: string;
  detalles: Record<string, any> | null;
  created_at: string;
  usuarios?: {
    id?: string;
    nombre?: string;
    apellido?: string | null;
    correo?: string;
  } | null;
}

export interface ReporteInteligenteGerenciaVista {
  id?: string | number;
  created_at: string;
  modulo: string;
  usuario_responsable: string;
  detalle_comercial_amigable: string;
  accion?: string;
  descripcion?: string;
  [key: string]: any;
}

export interface InventarioEstadoActualVista {
  id: number;
  codigo_mercaderia: string;
  nombre: string;
  stock_actual: number;
  precio_unitario: number;
  categoria?: string | null;
  categoria_nombre?: string | null;
  unidad_medida?: string | null;
  unidad_nombre?: string | null;
  activo?: boolean;
  [key: string]: any;
}

export interface ResumenComercialGlobalVista {
  id?: number | string;
  codigo_cotizacion?: string;
  cliente?: string;
  nombre_institucion?: string;
  contacto?: string;
  total_quetzales?: number;
  estado?: string;
  fecha_emision?: string;
  [key: string]: any;
}

export interface CategoriaActualVista {
  id?: number;
  nombre: string;
  descripcion?: string | null;
  [key: string]: any;
}

export interface UnidadMedidaActualVista {
  id?: number;
  nombre: string;
  abreviatura?: string | null;
  [key: string]: any;
}

export interface DatosMaestrosDistribuidora {
  inventario: InventarioEstadoActualVista[];
  resumenComercial: ResumenComercialGlobalVista[];
  categorias: CategoriaActualVista[];
  unidadesMedida: UnidadMedidaActualVista[];
}

export const formatQuetzales = (value: number | string | null | undefined): string => {
  const num = typeof value === 'string' ? parseFloat(value) : (value ?? 0);
  return `Q. ${(isNaN(num) ? 0 : num).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
