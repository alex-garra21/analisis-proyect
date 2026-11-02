/**
 * Cliente "supabase" LOCAL (modo offline / fase de pruebas).
 *
 * Reemplaza temporalmente a `createClient` de @supabase/supabase-js para que
 * ninguna llamada intente conectarse a la red. Mantiene la misma superficie
 * de API (auth, from, storage, channel) para no tocar el resto del código.
 *
 * - Las consultas `from(...)` devuelven datos vacíos sin error.
 * - Auth usa una sesión demo guardada en localStorage.
 *
 * Para reconectar: restaurar `createClient(url, anonKey)` desde
 * '@supabase/supabase-js' (ver historial de git).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SESSION_KEY = 'fdc_local_session';

export const LOCAL_DEMO_USER = {
  id: 'local-admin-0001',
  email: 'admin@floresdelcampo.local',
  password: 'Admin123',
  profile: {
    id: 'local-admin-0001',
    nombres: 'Administrador',
    apellidos: 'Flores del Campo',
    correo: 'admin@floresdelcampo.local',
    rol: 'admin',
    desactivado: false,
    pago_validado: true,
  },
};

type Listener = (event: string, session: any) => void;
const listeners = new Set<Listener>();

const readSession = (): any => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const emit = (event: string, session: any) => listeners.forEach((l) => l(event, session));

const okResult = (data: any = null) => ({ data, error: null });

/** Query builder encadenable y "thenable": siempre resuelve vacío. */
function createQuery(table = ''): any {
  const result = { data: [], error: null, count: 0 };
  const proxy: any = new Proxy(function () {}, {
    get(_t, prop) {
      if (prop === 'then') {
        return (resolve: (v: any) => any) => Promise.resolve(result).then(resolve);
      }
      if (prop === 'single' || prop === 'maybeSingle') {
        return () =>
          Promise.resolve({
            data: table === 'usuarios' && readSession() ? LOCAL_DEMO_USER.profile : null,
            error: null,
          });
      }
      return () => proxy;
    },
    apply() {
      return proxy;
    },
  });
  return proxy;
}

function createChannel(): any {
  const channel: any = {
    state: 'closed',
    on: () => channel,
    subscribe: () => channel,
    unsubscribe: () => Promise.resolve('ok'),
  };
  return channel;
}

const localClient: any = {
  auth: {
    async getSession() {
      return { data: { session: readSession() }, error: null };
    },
    async getUser() {
      return { data: { user: readSession()?.user ?? null }, error: null };
    },
    onAuthStateChange(cb: Listener) {
      listeners.add(cb);
      return { data: { subscription: { unsubscribe: () => listeners.delete(cb) } } };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      if (email === LOCAL_DEMO_USER.email && password === LOCAL_DEMO_USER.password) {
        const session = { user: { id: LOCAL_DEMO_USER.id, email } };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        emit('SIGNED_IN', session);
        return { data: { user: session.user, session }, error: null };
      }
      return { data: { user: null, session: null }, error: new Error('Credenciales inválidas (modo local)') };
    },
    async signOut() {
      localStorage.removeItem(SESSION_KEY);
      emit('SIGNED_OUT', null);
      return { error: null };
    },
    async updateUser() {
      return okResult({ user: readSession()?.user ?? null });
    },
    async resetPasswordForEmail() {
      return okResult();
    },
    async verifyOtp() {
      return okResult();
    },
    async signUp() {
      return { data: { user: null, session: null }, error: new Error('Registro no disponible en modo local') };
    },
  },
  from: (table: string) => createQuery(table),
  rpc: () => createQuery(),
  channel: () => createChannel(),
  removeChannel: () => Promise.resolve('ok'),
  storage: {
    from: () => ({
      upload: async () => ({ data: null, error: null }),
      remove: async () => ({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } }),
    }),
  },
};

// Mock Mode: activo por defecto. Se usa Supabase real solo si VITE_USE_MOCK=false y hay credenciales.
const useMock = import.meta.env.VITE_USE_MOCK !== 'false' || !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

export const IS_MOCK_MODE = useMock;
export const supabase: SupabaseClient = useMock
  ? (localClient as SupabaseClient)
  : createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
