import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { getUserProfileQuery } from '../supabase/users/userQueries';
import { clearAppLocalStorageCache } from '../../utils/appCache';


export function useAuth() {
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['auth_session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  const userId = session?.user?.id;

  const { data: user, isLoading: isProfileLoading, isError, refetch } = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => (userId ? getUserProfileQuery(userId) : null),
    enabled: !!userId,
    staleTime: 1000 * 10, // 10 segundos
  });

  return {
    user,
    session,
    isAuthenticated: !!session,
    isLoading: isSessionLoading || (!!userId && isProfileLoading),
    isError,
    refetchProfile: refetch
  };
}

/**
 * Hook para ser usado SOLO UNA VEZ en App.tsx.
 * Maneja las suscripciones en tiempo real y actualiza el caché global.
 */
export function useGlobalAuthListener() {
  const queryClient = useQueryClient();
  const { data: session } = useQuery({
    queryKey: ['auth_session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 60 * 5,
  });

  const userId = session?.user?.id;

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      queryClient.setQueryData(['auth_session'], newSession);

      if (_event === 'SIGNED_OUT') {
        queryClient.setQueryData(['userProfile'], null);
        localStorage.removeItem('fdc_current_user');
        try {
          clearAppLocalStorageCache();
        } catch (e) {
          console.error('Error al limpiar caché tras logout:', e);
        }
      } else if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION' || _event === 'USER_UPDATED') {
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['tokens'] });
        queryClient.invalidateQueries({ queryKey: ['reports'] });
        queryClient.invalidateQueries({ queryKey: ['attendance'] });
      }
    });

    let userChannel: any = null;

    if (userId) {
      const channelName = `user_updates_${userId}`;
      userChannel = supabase.channel(channelName);

      if (userChannel.state === 'closed' || userChannel.state === 'joined') {
        userChannel
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'usuarios',
              filter: `id=eq.${userId}`,
            },
            () => {
              queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
            }
          )
          .subscribe((status: string) => {
            if (status === 'SUBSCRIPTION_ERROR') {
              console.warn('Error en suscripción Realtime, reintentando...');
            }
          });
      }
    }

    return () => {
      subscription.unsubscribe();
      if (userChannel) supabase.removeChannel(userChannel);
    };
  }, [queryClient, userId]);
}
