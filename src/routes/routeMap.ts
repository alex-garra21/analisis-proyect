/**
 * routeMap.ts
 *
 * Enmascaramiento integral de rutas. Cada segmento ESTÁTICO de la aplicación
 * se ofusca con `encodeId` (de routerHasher) para que ninguna URL exponga
 * nombres de recursos en texto plano (p. ej. /catalogo -> /m_XXXX).
 *
 * - `maskPath('/dashboard/inicio')`  -> '/m_xxx/m_yyy'
 * - `plainPath('/m_xxx/m_yyy')`      -> '/dashboard/inicio'
 * - `ROUTES` agrupa las rutas ya enmascaradas para usar en <Route> y <Link>.
 *
 * Los segmentos dinámicos (IDs) se enmascaran en el punto de uso con
 * `createMaskedUrl` / `encodeId` y se validan con `decodeId`.
 */
import { encodeId, decodeId } from '../utils/routerHasher';

/** Segmentos estáticos conocidos del sistema (únicos que se enmascaran). */
const STATIC_SEGMENTS = [
  // públicas
  'catalogo', 'cotizaciones', 'agenda', 'ponentes', 'inscripcion', 'pago',
  'asistencia-info', 'participantes-info', 'asistencia', 'reset-password',
  'cuenta-desactivada',
  // privadas
  'dashboard', 'inicio', 'perfil', 'talleres', 'diploma', 'robots',
  'inventario', 'bandeja-cotizaciones',
  'admin', 'admin-tokens', 'admin-usuarios', 'admin-asistencia',
  'admin-reportes', 'admin-agenda', 'admin-config-agenda',
] as const;

const STATIC_SET = new Set<string>(STATIC_SEGMENTS);
const encodedCache = new Map<string, string>(
  STATIC_SEGMENTS.map((s) => [s, encodeId(s)])
);
const decodedCache = new Map<string, string>(
  [...encodedCache.entries()].map(([plain, enc]) => [enc, plain])
);

/** Enmascara un segmento estático; los demás se devuelven intactos. */
export function maskSegment(seg: string): string {
  return STATIC_SET.has(seg) ? encodedCache.get(seg)! : seg;
}

/** Enmascara todos los segmentos estáticos de una ruta (conserva ?query y #hash). */
export function maskPath(path: string): string {
  const match = path.match(/^([^?#]*)(.*)$/);
  const pathname = match?.[1] ?? path;
  const rest = match?.[2] ?? '';
  return pathname.split('/').map((s) => (s ? maskSegment(s) : s)).join('/') + rest;
}

/** Inversa de maskPath: devuelve la ruta lógica en texto plano (uso interno). */
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

/** ¿La ruta está en texto plano pero corresponde a un recurso conocido? */
export function isPlainKnownPath(path: string): boolean {
  const first = path.split(/[?#]/)[0].split('/').find(Boolean);
  return !!first && STATIC_SET.has(first);
}

export const ROUTES = {
  home: '/',
  catalogo: maskPath('/catalogo'),
  cotizaciones: maskPath('/cotizaciones'),
  agenda: maskPath('/agenda'),
  ponentes: maskPath('/ponentes'),
  inscripcion: maskPath('/inscripcion'),
  pago: maskPath('/pago'),
  asistenciaInfo: maskPath('/asistencia-info'),
  participantesInfo: maskPath('/participantes-info'),
  asistencia: maskPath('/asistencia'),
  resetPassword: maskPath('/reset-password'),
  cuentaDesactivada: maskPath('/cuenta-desactivada'),
  dashboard: maskPath('/dashboard'),
} as const;

/** Segmento hijo enmascarado para rutas anidadas del dashboard. */
export const seg = maskSegment;
