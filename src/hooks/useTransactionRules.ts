import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ruleService } from '../services/rule.service';
import type { TransactionRule } from '../types/common';

export function useTransactionRules() {
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ['transaction-rules'],
    queryFn: () => ruleService.getRules(),
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: (input: {
      match_field: TransactionRule['match_field'];
      match_type: TransactionRule['match_type'];
      match_value: string;
      line_item_id: string;
      priority?: number;
    }) => ruleService.createRule(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-rules'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ruleService.deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-rules'] });
    },
  });

  return {
    rules: rulesQuery.data ?? [],
    isLoading: rulesQuery.isLoading,
    createRule: createMutation.mutate,
    isCreating: createMutation.isPending,
    deleteRule: deleteMutation.mutate,
  };
}
