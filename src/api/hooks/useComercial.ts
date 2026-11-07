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
  updateMercaderiaGeneralMutation,
  updateMercaderiaStockMutation,
  createCategoriaMutation,
  updateCategoriaMutation,
  deleteCategoriaMutation,
  createClienteMutation,
  updateClienteMutation,
  deleteClienteMutation,
  createCotizacionManualMutation,
  updateCotizacionEstadoMutation,
  createUnidadMedidaMutation,
  updateUnidadMedidaMutation,
  toggleUnidadMedidaStatusMutation,
  deleteUnidadMedidaMutation,
  type UpdateMercaderiaStockInput,
} from '../supabase/comercialMutations';
import type {
  CreateMercaderiaInput,
  UpdateMercaderiaDatosGeneralesInput,
  CreateClienteInput,
  CreateCotizacionManualInput,
  CreateUnidadMedidaInput,
  UpdateUnidadMedidaInput,
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
    staleTime: 1000 * 60 * 5,
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

export function useUpdateMercaderiaGeneral() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMercaderiaDatosGeneralesInput) => updateMercaderiaGeneralMutation(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mercaderias'] });
      queryClient.invalidateQueries({ queryKey: ['mercaderia', data.id] });
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

export function useUpdateMercaderiaStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMercaderiaStockInput | { id: number; nuevoStock: number; nuevoPrecio?: number }) =>
      updateMercaderiaStockMutation(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mercaderias'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['mercaderia', data.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['auditoria_sistema'] });
      queryClient.invalidateQueries({ queryKey: ['vw_reportes_inteligentes_gerencia'] });
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

export function useUpdateCotizacionEstado() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: 'Aprobada' | 'Rechazada' }) =>
      updateCotizacionEstadoMutation(id, estado),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      queryClient.invalidateQueries({ queryKey: ['cotizacion', variables.id] });
    },
  });
}

/**
 * MUTATION HOOKS - UNIDADES DE MEDIDA
 */

export function useCreateUnidadMedida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateUnidadMedidaInput) => createUnidadMedidaMutation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades_medida'] });
    },
  });
}

export function useUpdateUnidadMedida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUnidadMedidaInput }) =>
      updateUnidadMedidaMutation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades_medida'] });
      queryClient.invalidateQueries({ queryKey: ['mercaderias'] });
    },
  });
}

export function useToggleUnidadMedidaStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activo }: { id: number; activo: boolean }) =>
      toggleUnidadMedidaStatusMutation(id, activo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades_medida'] });
      queryClient.invalidateQueries({ queryKey: ['mercaderias'] });
    },
  });
}

export function useDeleteUnidadMedida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUnidadMedidaMutation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades_medida'] });
      queryClient.invalidateQueries({ queryKey: ['mercaderias'] });
    },
  });
}
