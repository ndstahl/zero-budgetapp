import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useState } from 'react';
import { useAuthStore } from '../../../src/stores/authStore';
import { supabase } from '../../../src/lib/supabase';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Trash2,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { File as ExpoFile, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type ExportFormat = 'csv' | 'json';

export default function ExportDataScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const [exporting, setExporting] = useState(false);

  const exportTransactions = async (format: ExportFormat) => {
    if (!userId) return;
    setExporting(true);

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(
          'date, merchant_name, amount, type, notes, line_items(name, category_groups(name))'
        )
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        Toast.show({ type: 'info', text1: 'No transactions to export' });
        return;
      }

      let content: string;
      let filename: string;

      if (format === 'csv') {
        const header = 'Date,Merchant,Amount,Type,Category,Group,Notes';
        const rows = data.map((t: any) => {
          const category = t.line_items?.name ?? '';
          const group = t.line_items?.category_groups?.name ?? '';
          const amount = (t.amount / 100).toFixed(2);
          const merchant = `"${(t.merchant_name ?? '').replace(/"/g, '""')}"`;
          const notes = `"${(t.notes ?? '').replace(/"/g, '""')}"`;
          return `${t.date},${merchant},${amount},${t.type},${category},${group},${notes}`;
        });
        content = [header, ...rows].join('\n');
        filename = `zerobudget-transactions-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        const formatted = data.map((t: any) => ({
          date: t.date,
          merchant: t.merchant_name,
          amount: t.amount / 100,
          type: t.type,
          category: t.line_items?.name ?? null,
          group: t.line_items?.category_groups?.name ?? null,
          notes: t.notes,
        }));
        content = JSON.stringify(formatted, null, 2);
        filename = `zerobudget-transactions-${new Date().toISOString().split('T')[0]}.json`;
      }

      const file = new ExpoFile(Paths.cache, filename);
      file.create({ overwrite: true });
      file.write(content);

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(file.uri, {
          mimeType: format === 'csv' ? 'text/csv' : 'application/json',
          dialogTitle: 'Export Transactions',
        });
      }

      Toast.show({ type: 'success', text1: `Exported ${data.length} transactions` });
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Export failed', text2: err.message });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All your budgets, transactions, and data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      // Account deletion would be handled by a server-side function
                      // that cascades all user data before deleting the auth user
                      await supabase.functions.invoke('delete-account');
                      Toast.show({ type: 'success', text1: 'Account deleted' });
                    } catch (err: any) {
                      Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: err.message,
                      });
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
    >
      {/* Export */}
      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
        Export Transactions
      </Text>
      <Card className="mb-4">
        <Text className="mb-3 text-sm text-gray-500">
          Download all your transaction data. You can import this into
          spreadsheet apps or other budgeting tools.
        </Text>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Pressable
              onPress={() => exportTransactions('csv')}
              disabled={exporting}
              className="items-center rounded-xl border border-gray-200 bg-white p-4 active:bg-gray-50"
            >
              <FileSpreadsheet color="#4F46E5" size={32} />
              <Text className="mt-2 text-sm font-semibold text-gray-900">
                CSV
              </Text>
              <Text className="mt-0.5 text-xs text-gray-400">
                Spreadsheets
              </Text>
            </Pressable>
          </View>
          <View className="flex-1">
            <Pressable
              onPress={() => exportTransactions('json')}
              disabled={exporting}
              className="items-center rounded-xl border border-gray-200 bg-white p-4 active:bg-gray-50"
            >
              <FileText color="#4F46E5" size={32} />
              <Text className="mt-2 text-sm font-semibold text-gray-900">
                JSON
              </Text>
              <Text className="mt-0.5 text-xs text-gray-400">
                Developers
              </Text>
            </Pressable>
          </View>
        </View>
      </Card>

      {/* Danger Zone */}
      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-danger-400">
        Danger Zone
      </Text>
      <Card className="mb-4 border border-danger-100">
        <View className="flex-row items-center mb-3">
          <Trash2 color="#EF4444" size={20} />
          <Text className="ml-2 text-base font-semibold text-danger-600">
            Delete Account
          </Text>
        </View>
        <Text className="mb-3 text-sm text-gray-500">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </Text>
        <Button
          title="Delete My Account"
          onPress={handleDeleteAccount}
          variant="outline"
          fullWidth
        />
      </Card>

      <View className="h-16" />
    </ScrollView>
  );
}
