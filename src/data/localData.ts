/**
 * Datos locales (mock) de Comercial Flores del Campo.
 * Fuente única para la fase de pruebas offline: catálogo y cotizaciones.
 */

export type CategoriaMineduc =
  | 'Útiles Escolares'
  | 'Papelería'
  | 'Material Didáctico'
  | 'Limpieza'
  | 'Mobiliario'
  | 'Tecnología Educativa';

export interface Producto {
  /** Identificador interno; nunca se expone en URLs (usar encodeId). */
  id: number;
  codigo_mercadoria: string;
  nombre: string;
  categoria_mineduc: CategoriaMineduc;
  unidad_medida: string;
  /** Precio unitario en Quetzales (GTQ) */
  precio_q: number;
  stock_actual: number;
}

export interface CotizacionItem {
  producto_id: number;
  cantidad: number;
}

export interface Cotizacion {
  id: number;
  numero: string;
  cliente: string;
  fecha: string;
  estado: 'Borrador' | 'Enviada' | 'Aprobada' | 'Rechazada';
  items: CotizacionItem[];
}

export const PRODUCTOS: Producto[] = [
  { id: 1, codigo_mercadoria: 'FDC-0001', nombre: 'Cuaderno espiral 100 hojas rayado', categoria_mineduc: 'Útiles Escolares', unidad_medida: 'Unidad', precio_q: 8.5, stock_actual: 420 },
  { id: 2, codigo_mercadoria: 'FDC-0002', nombre: 'Lápiz grafito No. 2', categoria_mineduc: 'Útiles Escolares', unidad_medida: 'Caja x12', precio_q: 14.0, stock_actual: 260 },
  { id: 3, codigo_mercadoria: 'FDC-0003', nombre: 'Crayones triangulares x12 colores', categoria_mineduc: 'Útiles Escolares', unidad_medida: 'Caja', precio_q: 11.75, stock_actual: 180 },
  { id: 4, codigo_mercadoria: 'FDC-0004', nombre: 'Resma de papel bond carta 75g', categoria_mineduc: 'Papelería', unidad_medida: 'Resma', precio_q: 42.0, stock_actual: 95 },
  { id: 5, codigo_mercadoria: 'FDC-0005', nombre: 'Marcador para pizarra negro', categoria_mineduc: 'Papelería', unidad_medida: 'Unidad', precio_q: 6.25, stock_actual: 8 },
  { id: 6, codigo_mercadoria: 'FDC-0006', nombre: 'Pegamento blanco escolar 120 ml', categoria_mineduc: 'Papelería', unidad_medida: 'Frasco', precio_q: 5.5, stock_actual: 140 },
  { id: 7, codigo_mercadoria: 'FDC-0007', nombre: 'Mapa de Guatemala laminado', categoria_mineduc: 'Material Didáctico', unidad_medida: 'Unidad', precio_q: 35.0, stock_actual: 40 },
  { id: 8, codigo_mercadoria: 'FDC-0008', nombre: 'Juego de bloques de conteo', categoria_mineduc: 'Material Didáctico', unidad_medida: 'Set', precio_q: 68.0, stock_actual: 25 },
  { id: 9, codigo_mercadoria: 'FDC-0009', nombre: 'Desinfectante multiusos 1 galón', categoria_mineduc: 'Limpieza', unidad_medida: 'Galón', precio_q: 38.0, stock_actual: 60 },
  { id: 10, codigo_mercadoria: 'FDC-0010', nombre: 'Escritorio unipersonal escolar', categoria_mineduc: 'Mobiliario', unidad_medida: 'Unidad', precio_q: 385.0, stock_actual: 12 },
  { id: 11, codigo_mercadoria: 'FDC-0011', nombre: 'Calculadora científica básica', categoria_mineduc: 'Tecnología Educativa', unidad_medida: 'Unidad', precio_q: 95.0, stock_actual: 0 },
];

export const COTIZACIONES: Cotizacion[] = [
  { id: 101, numero: 'COT-2026-0101', cliente: 'Escuela Oficial Rural Mixta El Progreso', fecha: '2026-10-20', estado: 'Enviada', items: [{ producto_id: 1, cantidad: 100 }, { producto_id: 2, cantidad: 20 }, { producto_id: 7, cantidad: 4 }] },
  { id: 102, numero: 'COT-2026-0102', cliente: 'Instituto Básico por Cooperativa Cobán', fecha: '2026-10-28', estado: 'Borrador', items: [{ producto_id: 4, cantidad: 30 }, { producto_id: 5, cantidad: 50 }, { producto_id: 10, cantidad: 10 }] },
];

export const formatQuetzales = (value: number): string =>
  `Q. ${value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// --- Accesores locales (simulan una API asíncrona) ---
const delay = <T,>(v: T): Promise<T> => Promise.resolve(v);

export const getProductosLocal = () => delay([...PRODUCTOS]);
export const getProductoByIdLocal = (id: number) => delay(PRODUCTOS.find((p) => p.id === id) ?? null);
export const getCotizacionesLocal = () => delay([...COTIZACIONES]);
export const getCotizacionByIdLocal = (id: number) => delay(COTIZACIONES.find((c) => c.id === id) ?? null);

export const totalCotizacion = (c: Cotizacion): number =>
  c.items.reduce((sum, it) => {
    const p = PRODUCTOS.find((x) => x.id === it.producto_id);
    return sum + (p ? p.precio_q * it.cantidad : 0);
  }, 0);
