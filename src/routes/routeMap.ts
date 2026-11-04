import { encodeId, decodeId } from '../utils/routerHasher';

/**
 * Segmentos estáticos válidos para Comercial Flores del Campo
 * según el esquema oficial (roles, usuarios, categorias, mercaderias, clientes, cotizaciones).
 */
const STATIC_SEGMENTS = [
  // Públicas
  'catalogo',
  'cotizaciones',
  'reset-password',
  'cuenta-desactivada',

  // Privadas (Dashboard)
  'dashboard',
  'inicio',
  'perfil',
  'catalogo-admin',
  'inventario',
  'bandeja-cotizaciones',
  'usuarios',
] as const;

const STATIC_SET = new Set<string>(STATIC_SEGMENTS);
const encodedCache = new Map<string, string>(
  STATIC_SEGMENTS.map((s) => [s, encodeId(s)])
);
const decodedCache = new Map<string, string>(
  [...encodedCache.entries()].map(([plain, enc]) => [enc, plain])
);

export function maskSegment(seg: string): string {
  return STATIC_SET.has(seg) ? encodedCache.get(seg)! : seg;
}

export function maskPath(path: string): string {
  const match = path.match(/^([^?#]*)(.*)$/);
  const pathname = match?.[1] ?? path;
  const rest = match?.[2] ?? '';
  return pathname.split('/').map((s) => (s ? maskSegment(s) : s)).join('/') + rest;
}

export function plainPath(path: string): string {
  const match = path.match(/^([^?#]*)(.*)$/);
  const pathname = match?.[1] ?? path;
  const rest = match?.[2] ?? '';
  return (
    pathname
      .split('/')
      .map((s) => (s && s.startsWith('m_') ? decodedCache.get(s) ?? decodeId(s) ?? s : s))
      .join('/') + rest
  );
}

export function isPlainKnownPath(path: string): boolean {
  const first = path.split(/[?#]/)[0].split('/').find(Boolean);
  return !!first && STATIC_SET.has(first);
}

export const ROUTES = {
  home: '/',
  catalogo: maskPath('/catalogo'),
  cotizaciones: maskPath('/cotizaciones'),
  resetPassword: maskPath('/reset-password'),
  cuentaDesactivada: maskPath('/cuenta-desactivada'),
  dashboard: maskPath('/dashboard'),
} as const;

export const seg = maskSegment;
