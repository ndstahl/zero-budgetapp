import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paycheckService } from '../services/paycheck.service';

export function usePaycheckPlanner(budgetId: string | undefined) {
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ['paycheck-plans', budgetId],
    queryFn: () => paycheckService.getPaycheckPlans(budgetId!),
    staleTime: 30_000,
    enabled: !!budgetId,
  });

  const createPlanMutation = useMutation({
    mutationFn: (input: {
      name: string;
      expected_amount: number;
      expected_date?: string;
    }) => {
      if (!budgetId) throw new Error('No budget');
      return paycheckService.createPaycheckPlan({
        budget_id: budgetId,
        ...input,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paycheck-plans', budgetId] });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => paycheckService.deletePaycheckPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paycheck-plans', budgetId] });
    },
  });

  const setAllocationMutation = useMutation({
    mutationFn: ({
      paycheckPlanId,
      lineItemId,
      amount,
    }: {
      paycheckPlanId: string;
      lineItemId: string;
      amount: number;
    }) => paycheckService.setAllocation(paycheckPlanId, lineItemId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paycheck-plans', budgetId] });
    },
  });

  return {
    plans: plansQuery.data ?? [],
    isLoading: plansQuery.isLoading,
    createPlan: createPlanMutation.mutate,
    isCreating: createPlanMutation.isPending,
    deletePlan: deletePlanMutation.mutate,
    setAllocation: setAllocationMutation.mutate,
  };
}
