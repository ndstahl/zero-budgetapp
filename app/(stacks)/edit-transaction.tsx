import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert, StyleSheet, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useBudget } from '../../src/hooks/useBudget';
import { formatCurrency } from '../../src/utils/formatters';
import { Trash2, Split, Calendar as CalendarIcon } from 'lucide-react-native';
import type { TransactionType } from '../../src/types/transaction';

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, updateTransaction, deleteTransaction } = useTransactions();
  const { budget } = useBudget();

  const transaction = transactions.find((t) => t.id === id);

  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date());
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount((Math.abs(transaction.amount) / 100).toFixed(2));
      setMerchantName(transaction.merchant_name ?? '');
      setDescription(transaction.description ?? '');
      setType(transaction.type);
      setDate(new Date(transaction.date + 'T12:00:00'));
      setSelectedLineItemId(transaction.line_item_id);
      setNotes(transaction.notes ?? '');
    }
  }, [transaction]);

  if (!transaction) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Transaction not found</Text>
      </View>
    );
  }

  // Filter line items based on transaction type
  const lineItems = budget?.category_groups
    ?.filter((g) => (type === 'income' ? g.is_income : !g.is_income))
    ?.flatMap((g) =>
      (g.line_items || []).map((item) => ({
        ...item,
        groupName: g.name,
      }))
    ) ?? [];

  const handleSave = () => {
    const amountCents = Math.round(parseFloat(amount || '0') * 100);
    if (amountCents === 0) {
      Alert.alert('Amount required', 'Enter a transaction amount');
      return;
    }

    const dateString = date.toISOString().split('T')[0];

    setLoading(true);
    updateTransaction(
      {
        id: transaction.id,
        updates: {
          amount: amountCents,
          merchant_name: merchantName || undefined,
          description: description || undefined,
          date: dateString,
          type,
          line_item_id: selectedLineItemId ?? undefined,
          notes: notes || undefined,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Transaction updated', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        },
        onError: (err: Error) => {
          Alert.alert('Error', err.message);
          setLoading(false);
        },
      }
    );
  };

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(transaction.id);
          router.back();
        },
      },
    ]);
  };

  const handleSplit = () => {
    router.push({
      pathname: '/(stacks)/split-transaction',
      params: {
        transactionId: transaction.id,
        totalAmount: Math.abs(transaction.amount).toString(),
      },
    });
  };

  const handleDateSelect = (day: { dateString: string }) => {
    setDate(new Date(day.dateString + 'T12:00:00'));
    setShowDatePicker(false);
  };

  const formatDisplayDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDateString = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

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

        {/* Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <CalendarIcon color="#6B7280" size={20} />
            <Text style={styles.dateText}>{formatDisplayDate(date)}</Text>
          </Pressable>
        </View>

        {/* Calendar Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <Text style={styles.calendarTitle}>Select Date</Text>
                <Pressable onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.calendarDoneText}>Done</Text>
                </Pressable>
              </View>
              <Calendar
                current={getDateString(date)}
                onDayPress={handleDateSelect}
                markedDates={{
                  [getDateString(date)]: {
                    selected: true,
                    selectedColor: '#4F46E5',
                  },
                }}
                theme={{
                  backgroundColor: '#FFFFFF',
                  calendarBackground: '#FFFFFF',
                  textSectionTitleColor: '#6B7280',
                  selectedDayBackgroundColor: '#4F46E5',
                  selectedDayTextColor: '#FFFFFF',
                  todayTextColor: '#4F46E5',
                  dayTextColor: '#111827',
                  textDisabledColor: '#D1D5DB',
                  arrowColor: '#4F46E5',
                  monthTextColor: '#111827',
                  textMonthFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 17,
                  textDayHeaderFontSize: 13,
                }}
              />
            </Pressable>
          </Pressable>
        </Modal>

        {/* Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.textInput, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Category Picker */}
        {lineItems.length > 0 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {type === 'income' ? 'Income Source' : 'Category'}
            </Text>
            <View style={styles.categoryList}>
              <Pressable
                onPress={() => setSelectedLineItemId(null)}
                style={[
                  styles.categoryItem,
                  !selectedLineItemId && styles.categoryItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryName,
                    !selectedLineItemId && styles.categoryNameActive,
                  ]}
                >
                  Uncategorized
                </Text>
              </Pressable>
              {lineItems.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedLineItemId(item.id)}
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
            {loading ? 'Saving...' : 'Save Changes'}
          </Text>
        </Pressable>

        {/* Split Transaction Button */}
        {!transaction.is_split && transaction.type === 'expense' && (
          <Pressable onPress={handleSplit} style={styles.splitButton}>
            <Split color="#374151" size={16} />
            <Text style={styles.splitButtonText}>Split Transaction</Text>
          </Pressable>
        )}

        {/* Delete Button */}
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Trash2 color="#FFFFFF" size={16} />
          <Text style={styles.deleteButtonText}>Delete Transaction</Text>
        </Pressable>

        <View style={{ height: 40 }} />
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
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  notFoundText: {
    color: '#6B7280',
    fontSize: 16,
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
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#111827',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  calendarTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  calendarDoneText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4F46E5',
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
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  splitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  splitButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
