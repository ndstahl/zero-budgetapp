import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert, StyleSheet, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useBudget } from '../../src/hooks/useBudget';
import type { TransactionType } from '../../src/types/transaction';

export default function AddTransactionScreen() {
  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { createTransaction } = useTransactions();
  const { budget } = useBudget();

  const handleSave = async () => {
    const amountCents = Math.round(parseFloat(amount || '0') * 100);
    if (amountCents === 0) {
      Alert.alert('Amount required', 'Enter a transaction amount');
      return;
    }

    setLoading(true);
    try {
      createTransaction(
        {
          amount: amountCents,
          merchant_name: merchantName || undefined,
          description: description || undefined,
          date,
          type,
          line_item_id: selectedLineItemId ?? undefined,
          budget_id: budget?.id,
        },
        {
          onSuccess: () => {
            Alert.alert('Success', 'Transaction added');
            router.back();
          },
          onError: (err: any) => {
            Alert.alert('Error', err.message);
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset selected line item when switching transaction type
  useEffect(() => {
    setSelectedLineItemId(null);
  }, [type]);

  // Get line items for category picker based on transaction type
  const lineItems = budget?.category_groups
    ?.filter((g) => (type === 'income' ? g.is_income : !g.is_income))
    ?.flatMap((g) =>
      (g.line_items || []).map((item) => ({
        ...item,
        groupName: g.name,
      }))
    ) ?? [];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type Selector */}
        <View style={styles.typeSelector}>
          <Pressable
            onPress={() => setType('expense')}
            style={[styles.typeButton, type === 'expense' && styles.typeButtonActive]}
          >
            <Text style={[styles.typeText, type === 'expense' && styles.typeTextActive]}>
              Expense
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setType('income')}
            style={[styles.typeButton, type === 'income' && styles.typeButtonActive]}
          >
            <Text style={[styles.typeText, type === 'income' && styles.typeTextActive]}>
              Income
            </Text>
          </Pressable>
        </View>

        {/* Amount */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Merchant Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Merchant / Payee</Text>
          <TextInput
            style={styles.textInput}
            value={merchantName}
            onChangeText={setMerchantName}
            placeholder="e.g. Walmart, Starbucks"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={styles.textInput}
            value={description}
            onChangeText={setDescription}
            placeholder="What was this for?"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.textInput}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Category Picker */}
        {lineItems.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {type === 'income' ? 'Income Source' : 'Category'}
            </Text>
            <View style={styles.categoryList}>
              {lineItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    setSelectedLineItemId(
                      selectedLineItemId === item.id ? null : item.id
                    )
                  }
                  style={[
                    styles.categoryItem,
                    selectedLineItemId === item.id && styles.categoryItemActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryName,
                      selectedLineItemId === item.id && styles.categoryNameActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.categoryGroup}>{item.groupName}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={loading}
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Transaction'}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  typeButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  typeTextActive: {
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  categoryList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  categoryItemActive: {
    backgroundColor: '#EEF2FF',
  },
  categoryName: {
    fontSize: 14,
    color: '#374151',
  },
  categoryNameActive: {
    fontWeight: '600',
    color: '#4F46E5',
  },
  categoryGroup: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
