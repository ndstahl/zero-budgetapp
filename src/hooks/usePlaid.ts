import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plaidService } from '../services/plaid.service';

export function usePlaid() {
  const queryClient = useQueryClient();

  const {
    data: linkedItems = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['plaid-items'],
    queryFn: () => plaidService.getLinkedItems(),
  });

  const {
    data: accounts = [],
    isLoading: isLoadingAccounts,
  } = useQuery({
    queryKey: ['plaid-accounts'],
    queryFn: () => plaidService.getAccounts(),
  });

  const { mutateAsync: createLinkToken, isPending: isCreatingLink } = useMutation({
    mutationFn: (accessToken: string | undefined) => plaidService.createLinkToken(accessToken),
  });

  const { mutateAsync: exchangeToken, isPending: isExchanging } = useMutation({
    mutationFn: ({
      publicToken,
      institutionId,
      institutionName,
    }: {
      publicToken: string;
      institutionId?: string;
      institutionName?: string;
    }) => plaidService.exchangePublicToken(publicToken, institutionId, institutionName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plaid-items'] });
      queryClient.invalidateQueries({ queryKey: ['plaid-accounts'] });
    },
  });

  const { mutateAsync: syncTransactions, isPending: isSyncing } = useMutation({
    mutationFn: (itemId: string | undefined) => plaidService.syncTransactions(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['plaid-items'] });
      queryClient.invalidateQueries({ queryKey: ['plaid-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
    },
  });

  const { mutate: disconnectItem } = useMutation({
    mutationFn: (itemId: string) => plaidService.disconnectItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plaid-items'] });
    },
  });

  const { mutate: toggleAccountVisibility } = useMutation({
    mutationFn: ({ accountId, isHidden }: { accountId: string; isHidden: boolean }) =>
      plaidService.toggleAccountVisibility(accountId, isHidden),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plaid-accounts'] });
    },
  });

  const activeItems = linkedItems.filter((i) => i.status === 'active');
  const errorItems = linkedItems.filter(
    (i) => i.status === 'error' || i.status === 'login_required'
  );

  return {
    linkedItems,
    accounts,
    activeItems,
    errorItems,
    isLoading,
    isLoadingAccounts,
    isCreatingLink,
    isExchanging,
    isSyncing,
    createLinkToken,
    exchangeToken,
    syncTransactions,
    disconnectItem,
    toggleAccountVisibility,
    refetch,
  };
}
