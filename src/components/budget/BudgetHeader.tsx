import { View, Text, Pressable, Modal, TextInput, StyleSheet } from 'react-native';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil } from 'lucide-react-native';
import { useUIStore } from '../../stores/uiStore';
import { getMonthName } from '../../utils/formatters';
import { formatCurrency } from '../../utils/formatters';
import type { BudgetSummary } from '../../types/budget';

interface BudgetHeaderProps {
  summary: BudgetSummary | null;
  plannedIncome: number;
  onUpdatePlannedIncome: (amount: number) => void;
}

export function BudgetHeader({ summary, plannedIncome, onUpdatePlannedIncome }: BudgetHeaderProps) {
  const { selectedMonth, selectedYear, goToPreviousMonth, goToNextMonth } =
    useUIStore();
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeInput, setIncomeInput] = useState('');

  const leftToBudget = summary?.left_to_budget ?? 0;
  const leftToBudgetColor =
    leftToBudget === 0
      ? 'text-success-500'
      : leftToBudget > 0
        ? 'text-brand-500'
        : 'text-danger-500';

  const handleOpenIncomeModal = () => {
    setIncomeInput(plannedIncome > 0 ? (plannedIncome / 100).toFixed(2) : '');
    setShowIncomeModal(true);
  };

  const handleSaveIncome = () => {
    const amountCents = Math.round(parseFloat(incomeInput || '0') * 100);
    onUpdatePlannedIncome(amountCents);
    setShowIncomeModal(false);
  };

  return (
    <View className="bg-white dark:bg-gray-800 px-4 pb-4 pt-2">
      {/* Month Selector */}
      <View className="mb-4 flex-row items-center justify-center">
        <Pressable
          onPress={goToPreviousMonth}
          className="rounded-full p-2 active:bg-gray-100 dark:active:bg-gray-700"
        >
          <ChevronLeft color="#9CA3AF" size={24} />
        </Pressable>
        <Text className="mx-6 text-lg font-bold text-gray-900 dark:text-white">
          {getMonthName(selectedMonth)} {selectedYear}
        </Text>
        <Pressable
          onPress={goToNextMonth}
          className="rounded-full p-2 active:bg-gray-100 dark:active:bg-gray-700"
        >
          <ChevronRight color="#9CA3AF" size={24} />
        </Pressable>
      </View>

      {/* Zero-Based Indicator */}
      {summary && (
        <View className="rounded-xl bg-gray-50 dark:bg-gray-700 px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400">Left to Budget</Text>
              <Text className={`text-2xl font-bold ${leftToBudgetColor}`}>
                {formatCurrency(leftToBudget)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(summary.actual_income)} received
              </Text>
              <Pressable
                onPress={handleOpenIncomeModal}
                className="flex-row items-center"
              >
                <Text className="text-sm text-brand-500 font-medium">
                  {formatCurrency(summary.total_income)} planned
                </Text>
                <Pencil color="#4F46E5" size={12} style={{ marginLeft: 4 }} />
              </Pressable>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(summary.total_planned)} budgeted
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Planned Income Modal */}
      <Modal
        visible={showIncomeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIncomeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowIncomeModal(false)}
        >
          <Pressable style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Planned Income</Text>
            <Text style={styles.modalDescription}>
              Enter your expected income for this month
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.input}
                value={incomeInput}
                onChangeText={setIncomeInput}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                autoFocus
              />
            </View>
            <View style={styles.buttonRow}>
              <Pressable
                onPress={() => setShowIncomeModal(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveIncome}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#6B7280',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
