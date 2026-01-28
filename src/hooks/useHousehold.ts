import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { householdService } from '../services/household.service';

export function useHousehold() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['household'],
    queryFn: () => householdService.getHousehold(),
  });

  const createHouseholdMutation = useMutation({
    mutationFn: (name: string) => householdService.createHousehold(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (email: string) => householdService.inviteMember(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household'] });
    },
  });

  const acceptInviteMutation = useMutation({
    mutationFn: (token: string) => householdService.acceptInvite(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => householdService.removeMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household'] });
    },
  });

  const leaveHouseholdMutation = useMutation({
    mutationFn: () => householdService.leaveHousehold(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (inviteId: string) => householdService.cancelInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['household'] });
    },
  });

  return {
    household: data?.household ?? null,
    members: data?.members ?? [],
    invites: data?.invites ?? [],
    isLoading,
    refetch,
    createHousehold: createHouseholdMutation.mutate,
    isCreating: createHouseholdMutation.isPending,
    inviteMember: inviteMemberMutation.mutate,
    isInviting: inviteMemberMutation.isPending,
    acceptInvite: acceptInviteMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    leaveHousehold: leaveHouseholdMutation.mutate,
    cancelInvite: cancelInviteMutation.mutate,
  };
}
