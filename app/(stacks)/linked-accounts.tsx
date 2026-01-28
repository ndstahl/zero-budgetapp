import { View, Text, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { usePlaid } from '../../src/hooks/usePlaid';
import { PlaidItemCard } from '../../src/components/plaid/LinkedAccountCard';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import Toast from 'react-native-toast-message';
import { Link2, Plus } from 'lucide-react-native';

export default function LinkedAccountsScreen() {
  const {
    linkedItems,
    isLoading,
    isSyncing,
    syncTransactions,
    disconnectItem,
    toggleAccountVisibility,
  } = usePlaid();

  const handleSync = async (itemId?: string) => {
    try {
      const result = await syncTransactions(itemId);
      Toast.show({
        type: 'success',
        text1: 'Sync Complete',
        text2: `${result.added} added, ${result.modified} updated, ${result.removed} removed`,
      });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Sync Failed',
        text2: err.message,
      });
    }
  };

  const handleDisconnect = (itemId: string, name: string) => {
    Alert.alert(
      'Disconnect Account',
      `Disconnect "${name}"? Existing transactions will be kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => disconnectItem(itemId),
        },
      ]
    );
  };

  const handleReconnect = () => {
    router.push('/(stacks)/plaid-link');
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-bold text-gray-900">Linked Accounts</Text>
          <Text className="text-sm text-gray-500">
            {linkedItems.length} institution{linkedItems.length !== 1 ? 's' : ''} connected
          </Text>
        </View>
        <Button
          title="Add"
          onPress={() => router.push('/(stacks)/plaid-link')}
          size="sm"
          icon={<Plus color="#FFFFFF" size={14} />}
        />
      </View>

      {/* Sync All Button */}
      {linkedItems.length > 0 && (
        <Button
          title={isSyncing ? 'Syncing...' : 'Sync All Accounts'}
          onPress={() => handleSync()}
          variant="outline"
          loading={isSyncing}
          fullWidth
          size="md"
        />
      )}

      <View className="mt-4">
        {linkedItems.length === 0 ? (
          <EmptyState
            title="No Linked Accounts"
            description="Connect your bank to automatically import transactions and track balances."
            icon={<Link2 color="#4F46E5" size={48} />}
            actionTitle="Link Bank Account"
            onAction={() => router.push('/(stacks)/plaid-link')}
          />
        ) : (
          linkedItems.map((item) => (
            <PlaidItemCard
              key={item.id}
              institutionName={item.institution_name}
              status={item.status}
              lastSynced={item.last_synced_at}
              accounts={item.accounts}
              onSync={() => handleSync(item.id)}
              onReconnect={handleReconnect}
              onDisconnect={() =>
                handleDisconnect(item.id, item.institution_name ?? 'Account')
              }
              onToggleAccountVisibility={(accountId, isHidden) =>
                toggleAccountVisibility({ accountId, isHidden })
              }
              isSyncing={isSyncing}
            />
          ))
        )}
      </View>

      <View className="h-16" />
    </ScrollView>
  );
}
