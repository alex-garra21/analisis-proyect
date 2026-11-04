import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMercaderiasQuery,
  getMercaderiaByIdQuery,
  getCategoriasQuery,
  getUnidadesMedidaQuery,
  getCotizacionesQuery,
  getCotizacionByIdQuery,
  getClientesQuery,
} from '../supabase/comercialQueries';
import {
  createMercaderiaMutation,
  updateMercaderiaStockMutation,
  createCategoriaMutation,
  updateCategoriaMutation,
  deleteCategoriaMutation,
  createClienteMutation,
  updateClienteMutation,
  deleteClienteMutation,
  createCotizacionManualMutation,
} from '../supabase/comercialMutations';
import type {
  CreateMercaderiaInput,
  CreateClienteInput,
  CreateCotizacionManualInput,
} from '../supabase/comercialMutations';

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

export function useUnidadesMedida() {
  return useQuery({
    queryKey: ['unidades_medida'],
    queryFn: getUnidadesMedidaQuery,
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

/**
 * MUTATION HOOKS
 */

export function useCreateMercaderia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMercaderiaInput) => createMercaderiaMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mercaderias'] });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

export function useUpdateMercaderiaStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nuevoStock }: { id: number; nuevoStock: number }) =>
      updateMercaderiaStockMutation(id, nuevoStock),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mercaderias'] });
    },
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nombre, descripcion }: { nombre: string; descripcion?: string | null }) =>
      createCategoriaMutation(nombre, descripcion),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nombre: string; descripcion?: string | null } }) =>
      updateCategoriaMutation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['mercaderias'] });
    },
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoriaMutation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      queryClient.invalidateQueries({ queryKey: ['mercaderias'] });
    },
  });
}

export function useCreateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClienteInput) => createClienteMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}

export function useUpdateCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CreateClienteInput }) =>
      updateClienteMutation(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
    },
  });
}

export function useDeleteCliente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteClienteMutation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
}

export function useCreateCotizacionManual() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCotizacionManualInput) =>
      createCotizacionManualMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      queryClient.invalidateQueries({ queryKey: ['mercaderias'] });
    },
  });
}
