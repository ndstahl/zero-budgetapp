import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, Platform, Alert, StyleSheet, TextInput, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Calendar } from 'react-native-calendars';
import { useTransactions } from '../../src/hooks/useTransactions';
import { useBudget } from '../../src/hooks/useBudget';
import type { TransactionType } from '../../src/types/transaction';
import { Calendar as CalendarIcon, Plus } from 'lucide-react-native';

export default function AddTransactionScreen() {
  const { type: initialType } = useLocalSearchParams<{ type?: string }>();

  // If a type is passed, lock to that type and hide the toggle
  const lockedType = initialType === 'income' || initialType === 'expense' ? initialType : null;

  const [amount, setAmount] = useState('');
  const [merchantName, setMerchantName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>(lockedType ?? 'expense');
  const [date, setDate] = useState(new Date());
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showNewSourceModal, setShowNewSourceModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');

  const { createTransaction, isCreating } = useTransactions();
  const { budget, addLineItem } = useBudget();

  const handleSave = () => {
    const amountCents = Math.round(parseFloat(amount || '0') * 100);
    if (amountCents === 0) {
      Alert.alert('Amount required', 'Enter a transaction amount');
      return;
    }

    // Require income source for income transactions
    if (type === 'income' && !selectedLineItemId) {
      Alert.alert('Income Source Required', 'Please select or create an income source for this transaction');
      return;
    }

    const dateString = date.toISOString().split('T')[0];

    createTransaction(
      {
        amount: amountCents,
        merchant_name: merchantName || undefined,
        description: description || undefined,
        date: dateString,
        type,
        line_item_id: selectedLineItemId ?? undefined,
        budget_id: budget?.id,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Transaction added', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        },
        onError: (err: Error) => {
          Alert.alert('Error', err.message);
        },
      }
    );
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

  // Reset selected line item when switching transaction type
  useEffect(() => {
    setSelectedLineItemId(null);
  }, [type]);

  // Get the income category group for adding new sources
  const incomeGroup = budget?.category_groups?.find((g) => g.is_income);

  // Get line items for category picker based on transaction type
  const lineItems = budget?.category_groups
    ?.filter((g) => (type === 'income' ? g.is_income : !g.is_income))
    ?.flatMap((g) =>
      (g.line_items || []).map((item) => ({
        ...item,
        groupName: g.name,
      }))
    ) ?? [];

  const handleAddNewSource = () => {
    if (!newSourceName.trim()) {
      Alert.alert('Name required', 'Please enter a name for the income source');
      return;
    }
    if (!incomeGroup) {
      Alert.alert('Error', 'No income category found. Please create a budget first.');
      return;
    }

    addLineItem(
      {
        categoryGroupId: incomeGroup.id,
        name: newSourceName.trim(),
        plannedAmount: 0,
      },
      {
        onSuccess: (newItem: any) => {
          setSelectedLineItemId(newItem.id);
          setNewSourceName('');
          setShowNewSourceModal(false);
        },
        onError: (err: Error) => {
          Alert.alert('Error', err.message);
        },
      }
    );
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
        {/* Type Selector - only show if type is not locked */}
        {!lockedType && (
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
        )}

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

        {/* Category Picker */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            {type === 'income' ? 'Income Source (Required)' : 'Category'}
          </Text>
          {lineItems.length > 0 ? (
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
              {type === 'income' && (
                <Pressable
                  onPress={() => setShowNewSourceModal(true)}
                  style={styles.addNewSourceButton}
                >
                  <Plus color="#4F46E5" size={18} />
                  <Text style={styles.addNewSourceText}>Add New Income Source</Text>
                </Pressable>
              )}
            </View>
          ) : type === 'income' ? (
            <View style={styles.categoryList}>
              <Pressable
                onPress={() => setShowNewSourceModal(true)}
                style={styles.addNewSourceButton}
              >
                <Plus color="#4F46E5" size={18} />
                <Text style={styles.addNewSourceText}>Add New Income Source</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        {/* New Income Source Modal */}
        <Modal
          visible={showNewSourceModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowNewSourceModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowNewSourceModal(false)}
          >
            <Pressable style={styles.newSourceContainer}>
              <Text style={styles.newSourceTitle}>New Income Source</Text>
              <Text style={styles.newSourceDescription}>
                Enter a name for this income source (e.g., "Freelance", "Rental Income")
              </Text>
              <TextInput
                style={styles.newSourceInput}
                value={newSourceName}
                onChangeText={setNewSourceName}
                placeholder="Income source name"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
              <View style={styles.newSourceButtons}>
                <Pressable
                  onPress={() => {
                    setNewSourceName('');
                    setShowNewSourceModal(false);
                  }}
                  style={styles.newSourceCancelButton}
                >
                  <Text style={styles.newSourceCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddNewSource}
                  style={styles.newSourceSaveButton}
                >
                  <Text style={styles.newSourceSaveText}>Add</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={isCreating}
          style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
        >
          <Text style={styles.saveButtonText}>
            {isCreating ? 'Saving...' : 'Save Transaction'}
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
  addNewSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addNewSourceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginLeft: 8,
  },
  newSourceContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  newSourceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  newSourceDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  newSourceInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
  },
  newSourceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  newSourceCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  newSourceCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  newSourceSaveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  newSourceSaveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
