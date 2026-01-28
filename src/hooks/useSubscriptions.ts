import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionService } from '../services/subscription.service';

export function useSubscriptions() {
  const queryClient = useQueryClient();

  const {
    data: subscriptions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptionService.getSubscriptions(),
  });

  const { mutate: confirmSubscription } = useMutation({
    mutationFn: (id: string) => subscriptionService.confirmSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const { mutate: dismissSubscription } = useMutation({
    mutationFn: (id: string) => subscriptionService.dismissSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const { mutateAsync: detectSubscriptions, isPending: isDetecting } = useMutation({
    mutationFn: () => subscriptionService.detectSubscriptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });

  const confirmed = subscriptions.filter((s) => s.is_confirmed);
  const unconfirmed = subscriptions.filter((s) => !s.is_confirmed);

  const totalMonthly = confirmed.reduce((sum, s) => sum + (s.estimated_amount ?? 0), 0);

  return {
    subscriptions,
    confirmed,
    unconfirmed,
    totalMonthly,
    isLoading,
    isDetecting,
    confirmSubscription,
    dismissSubscription,
    detectSubscriptions,
    refetch,
  };
}
