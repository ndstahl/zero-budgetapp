import { View, Text, Pressable } from 'react-native';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import {
  Building2,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import type { PlaidAccount } from '../../types/plaid';

interface LinkedAccountCardProps {
  account: PlaidAccount;
  onToggleVisibility?: (accountId: string, isHidden: boolean) => void;
}

export function LinkedAccountCard({ account, onToggleVisibility }: LinkedAccountCardProps) {
  const typeLabel = account.subtype
    ? `${account.type} — ${account.subtype}`
    : account.type;

  return (
    <View className="flex-row items-center px-4 py-3">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <Building2 color="#6B7280" size={18} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-900">
          {account.name}
          {account.mask ? ` ••${account.mask}` : ''}
        </Text>
        <Text className="text-xs capitalize text-gray-400">{typeLabel}</Text>
      </View>
      {account.current_balance !== null && (
        <Text className="mr-2 text-sm font-semibold text-gray-900">
          {formatCurrency(account.current_balance)}
        </Text>
      )}
      {onToggleVisibility && (
        <Pressable
          onPress={() => onToggleVisibility(account.id, !account.is_hidden)}
          className="p-1"
        >
          {account.is_hidden ? (
            <EyeOff color="#9CA3AF" size={16} />
          ) : (
            <Eye color="#6B7280" size={16} />
          )}
        </Pressable>
      )}
    </View>
  );
}

interface PlaidItemCardProps {
  institutionName: string | null;
  status: string;
  lastSynced: string | null;
  accounts: PlaidAccount[];
  onSync?: () => void;
  onReconnect?: () => void;
  onDisconnect?: () => void;
  onToggleAccountVisibility?: (accountId: string, isHidden: boolean) => void;
  isSyncing?: boolean;
}

export function PlaidItemCard({
  institutionName,
  status,
  lastSynced,
  accounts,
  onSync,
  onReconnect,
  onDisconnect,
  onToggleAccountVisibility,
  isSyncing,
}: PlaidItemCardProps) {
  const isError = status === 'error' || status === 'login_required';

  return (
    <Card className="mb-3" padding="none">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-50">
        <View className="flex-row items-center flex-1">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-brand-50">
            <Building2 color="#4F46E5" size={18} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-semibold text-gray-900">
              {institutionName ?? 'Linked Account'}
            </Text>
            {lastSynced && (
              <Text className="text-xs text-gray-400">
                Last synced: {new Date(lastSynced).toLocaleDateString()}
              </Text>
            )}
          </View>
          {isError ? (
            <Badge label={status === 'login_required' ? 'Reconnect' : 'Error'} variant="danger" />
          ) : (
            <Badge label="Connected" variant="success" />
          )}
        </View>
      </View>

      {/* Accounts */}
      {accounts.map((account, idx) => (
        <View key={account.id}>
          <LinkedAccountCard
            account={account}
            onToggleVisibility={onToggleAccountVisibility}
          />
          {idx < accounts.length - 1 && <View className="h-px bg-gray-50 ml-16" />}
        </View>
      ))}

      {/* Actions */}
      <View className="flex-row border-t border-gray-100 px-4 py-2">
        {isError && onReconnect && (
          <Pressable
            onPress={onReconnect}
            className="mr-4 flex-row items-center py-1"
          >
            <AlertTriangle color="#F59E0B" size={14} />
            <Text className="ml-1 text-sm font-medium text-warning-600">Reconnect</Text>
          </Pressable>
        )}
        {onSync && (
          <Pressable
            onPress={onSync}
            disabled={isSyncing}
            className="mr-4 flex-row items-center py-1"
          >
            <RefreshCw color="#4F46E5" size={14} />
            <Text className="ml-1 text-sm font-medium text-brand-500">
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Text>
          </Pressable>
        )}
        {onDisconnect && (
          <Pressable
            onPress={onDisconnect}
            className="flex-row items-center py-1"
          >
            <Text className="text-sm font-medium text-gray-400">Disconnect</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}
