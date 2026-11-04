import { useQuery } from '@tanstack/react-query';
import {
  getMercaderiasQuery,
  getMercaderiaByIdQuery,
  getCategoriasQuery,
  getCotizacionesQuery,
  getCotizacionByIdQuery,
  getClientesQuery,
} from '../supabase/comercialQueries';

export function useMercaderias() {
  return useQuery({
    queryKey: ['mercaderias'],
    queryFn: getMercaderiasQuery,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMercaderia(id: number | null | undefined) {
  return useQuery({
    queryKey: ['mercaderia', id],
    queryFn: () => (id ? getMercaderiaByIdQuery(id) : null),
    enabled: !!id,
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: ['categorias'],
    queryFn: getCategoriasQuery,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCotizaciones() {
  return useQuery({
    queryKey: ['cotizaciones'],
    queryFn: getCotizacionesQuery,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCotizacion(id: number | null | undefined) {
  return useQuery({
    queryKey: ['cotizacion', id],
    queryFn: () => (id ? getCotizacionByIdQuery(id) : null),
    enabled: !!id,
  });
}

export function useClientes() {
  return useQuery({
    queryKey: ['clientes'],
    queryFn: getClientesQuery,
    staleTime: 1000 * 60 * 10,
  });
}
