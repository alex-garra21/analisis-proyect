import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAuditoriaQuery } from '../supabase/auditoriaService';
import { supabase } from '../../utils/supabase';

export function useAuditoria() {
  const queryClient = useQueryClient();
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);

  const query = useQuery({
    queryKey: ['auditoria_sistema'],
    queryFn: getAuditoriaQuery,
    staleTime: 1000 * 5, // 5 segundos
    refetchOnMount: 'always', // Carga siempre al montar el componente
    refetchOnWindowFocus: true, // Recarga automática al enfocar la ventana
  });

  useEffect(() => {
    // Configurar canal de suscripción en tiempo real con Supabase Realtime
    const channel = supabase
      .channel('auditoria_sistema_realtime_channel')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuchar INSERT y cualquier cambio en auditoria_sistema
          schema: 'public',
          table: 'auditoria_sistema',
        },
        () => {
          // Refrescar automáticamente la consulta de auditoría al instante
          queryClient.invalidateQueries({ queryKey: ['auditoria_sistema'] });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsRealtimeActive(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setIsRealtimeActive(false);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    ...query,
    isRealtimeActive,
  };
}
