import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useNetWorth } from '../../src/hooks/useNetWorth';
import { NetWorthChart } from '../../src/components/reports/NetWorthChart';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { CurrencyInput } from '../../src/components/shared/CurrencyInput';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { LoadingScreen } from '../../src/components/shared/LoadingScreen';
import { formatCurrency } from '../../src/utils/formatters';
import Toast from 'react-native-toast-message';
import {
  TrendingUp,
  Plus,
  Trash2,
  Wallet,
  CreditCard,
} from 'lucide-react-native';

type AccountFormType = 'asset' | 'liability';

export default function NetWorthScreen() {
  const {
    assets,
    liabilities,
    summary,
    isLoading,
    isCreating,
    createAccount,
    updateBalance,
    deleteAccount,
  } = useNetWorth();

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<AccountFormType>('asset');
  const [accountName, setAccountName] = useState('');
  const [accountSubtype, setAccountSubtype] = useState('');
  const [initialBalance, setInitialBalance] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState(0);

  const handleCreate = () => {
    if (!accountName.trim()) {
      Toast.show({ type: 'error', text1: 'Name required' });
      return;
    }

    createAccount(
      {
        name: accountName.trim(),
        type: formType,
        subtype: accountSubtype.trim() || undefined,
        initial_balance: initialBalance,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Account added' });
          setShowForm(false);
          setAccountName('');
          setAccountSubtype('');
          setInitialBalance(0);
        },
      }
    );
  };

  const handleUpdateBalance = (accountId: string) => {
    updateBalance(
      { accountId, balance: editBalance },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Balance updated' });
          setEditingId(null);
        },
      }
    );
  };

  const handleDelete = (accountId: string, name: string) => {
    Alert.alert('Delete Account', `Remove "${name}" and all its history?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteAccount(accountId),
      },
    ]);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Net Worth Chart */}
      {summary && <NetWorthChart summary={summary} />}

      {/* Add Account Button */}
      <View className="mt-4 mb-4 flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">Accounts</Text>
        <Button
          title="Add"
          onPress={() => setShowForm(!showForm)}
          size="sm"
          icon={<Plus color="#FFFFFF" size={14} />}
        />
      </View>

      {/* Create Form */}
      {showForm && (
        <Card className="mb-4">
          <Text className="mb-3 text-sm font-semibold text-gray-700">
            New Account
          </Text>

          {/* Asset / Liability toggle */}
          <View className="mb-3 flex-row rounded-xl bg-gray-100 p-1">
            {(['asset', 'liability'] as AccountFormType[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => setFormType(t)}
                className={`flex-1 items-center rounded-lg py-2 ${
                  formType === t ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    formType === t ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {t === 'asset' ? 'Asset' : 'Liability'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View className="mb-3">
            <Input
              label="Account Name"
              placeholder={
                formType === 'asset'
                  ? 'e.g. Savings Account, 401k'
                  : 'e.g. Mortgage, Student Loans'
              }
              value={accountName}
              onChangeText={setAccountName}
            />
          </View>

          <View className="mb-3">
            <Input
              label="Type (optional)"
              placeholder="e.g. Checking, Investment, Credit Card"
              value={accountSubtype}
              onChangeText={setAccountSubtype}
            />
          </View>

          <View className="mb-3">
            <CurrencyInput
              value={initialBalance}
              onChangeValue={setInitialBalance}
              label="Current Balance"
            />
          </View>

          <Button
            title="Add Account"
            onPress={handleCreate}
            loading={isCreating}
            fullWidth
          />
        </Card>
      )}

      {/* Empty State */}
      {assets.length === 0 && liabilities.length === 0 && !showForm && (
        <EmptyState
          title="Track Your Net Worth"
          description="Add your assets and liabilities to see your financial picture over time."
          icon={<TrendingUp color="#4F46E5" size={48} />}
          actionTitle="Add First Account"
          onAction={() => setShowForm(true)}
        />
      )}

      {/* Assets */}
      {assets.length > 0 && (
        <View className="mb-4">
          <View className="mb-2 flex-row items-center">
            <Wallet color="#10B981" size={16} />
            <Text className="ml-1 text-base font-bold text-gray-900">
              Assets
            </Text>
          </View>
          <Card padding="none">
            {assets.map((acct, idx) => (
              <View key={acct.id}>
                <View className="flex-row items-center px-4 py-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">
                      {acct.name}
                    </Text>
                    {acct.subtype && (
                      <Text className="text-xs text-gray-400">{acct.subtype}</Text>
                    )}
                  </View>

                  {editingId === acct.id ? (
                    <View className="flex-row items-center">
                      <View className="w-28 mr-2">
                        <CurrencyInput
                          value={editBalance}
                          onChangeValue={setEditBalance}
                        />
                      </View>
                      <Button
                        title="Save"
                        size="sm"
                        onPress={() => handleUpdateBalance(acct.id)}
                      />
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => {
                          setEditingId(acct.id);
                          setEditBalance(acct.latest_balance ?? 0);
                        }}
                      >
                        <Text className="text-sm font-semibold text-success-500">
                          {formatCurrency(acct.latest_balance ?? 0)}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(acct.id, acct.name)}
                        className="ml-3 p-1"
                      >
                        <Trash2 color="#EF4444" size={14} />
                      </Pressable>
                    </View>
                  )}
                </View>
                {idx < assets.length - 1 && <View className="h-px bg-gray-50" />}
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* Liabilities */}
      {liabilities.length > 0 && (
        <View className="mb-4">
          <View className="mb-2 flex-row items-center">
            <CreditCard color="#EF4444" size={16} />
            <Text className="ml-1 text-base font-bold text-gray-900">
              Liabilities
            </Text>
          </View>
          <Card padding="none">
            {liabilities.map((acct, idx) => (
              <View key={acct.id}>
                <View className="flex-row items-center px-4 py-3">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-gray-900">
                      {acct.name}
                    </Text>
                    {acct.subtype && (
                      <Text className="text-xs text-gray-400">{acct.subtype}</Text>
                    )}
                  </View>

                  {editingId === acct.id ? (
                    <View className="flex-row items-center">
                      <View className="w-28 mr-2">
                        <CurrencyInput
                          value={editBalance}
                          onChangeValue={setEditBalance}
                        />
                      </View>
                      <Button
                        title="Save"
                        size="sm"
                        onPress={() => handleUpdateBalance(acct.id)}
                      />
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <Pressable
                        onPress={() => {
                          setEditingId(acct.id);
                          setEditBalance(acct.latest_balance ?? 0);
                        }}
                      >
                        <Text className="text-sm font-semibold text-danger-500">
                          {formatCurrency(acct.latest_balance ?? 0)}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => handleDelete(acct.id, acct.name)}
                        className="ml-3 p-1"
                      >
                        <Trash2 color="#EF4444" size={14} />
                      </Pressable>
                    </View>
                  )}
                </View>
                {idx < liabilities.length - 1 && (
                  <View className="h-px bg-gray-50" />
                )}
              </View>
            ))}
          </Card>
        </View>
      )}

      <View className="h-16" />
    </ScrollView>
  );
}
