import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsersQuery } from '../supabase/users/userQueries';
import { updateUserMutation, toggleUserStatusMutation } from '../supabase/users/userMutations';

export function useAllUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsersQuery,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: any }) => updateUserMutation(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, estado }: { userId: string; estado: boolean }) =>
      toggleUserStatusMutation(userId, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
