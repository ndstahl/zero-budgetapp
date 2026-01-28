import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useFunds } from '../../src/hooks/useFunds';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { CurrencyInput } from '../../src/components/shared/CurrencyInput';
import Toast from 'react-native-toast-message';

const COLOR_OPTIONS = [
  { label: 'Indigo', value: '#4F46E5' },
  { label: 'Emerald', value: '#10B981' },
  { label: 'Rose', value: '#F43F5E' },
  { label: 'Amber', value: '#F59E0B' },
  { label: 'Cyan', value: '#06B6D4' },
  { label: 'Purple', value: '#8B5CF6' },
  { label: 'Orange', value: '#F97316' },
  { label: 'Teal', value: '#14B8A6' },
];

export default function AddFundScreen() {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#4F46E5');

  const { createFund, isCreating } = useFunds();

  const handleSave = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Name required' });
      return;
    }
    if (targetAmount <= 0) {
      Toast.show({ type: 'error', text1: 'Target amount required' });
      return;
    }

    createFund(
      { name: name.trim(), target_amount: targetAmount, color: selectedColor },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Fund created!' });
          router.back();
        },
        onError: (err: any) => {
          Toast.show({ type: 'error', text1: 'Error', text2: err.message });
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="mb-6 text-base text-gray-500">
          Create a savings fund to track progress toward a financial goal. Your balance rolls over month to month.
        </Text>

        <View className="mb-4">
          <Input
            label="Fund Name"
            placeholder="e.g. Emergency Fund, Vacation, New Car"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View className="mb-6">
          <CurrencyInput
            value={targetAmount}
            onChangeValue={setTargetAmount}
            label="Target Amount"
          />
        </View>

        {/* Color Picker */}
        <View className="mb-6">
          <Text className="mb-2 text-sm font-medium text-gray-700">Color</Text>
          <View className="flex-row flex-wrap">
            {COLOR_OPTIONS.map((c) => (
              <View key={c.value} className="mr-3 mb-3 items-center">
                <View
                  className={`h-10 w-10 rounded-full ${
                    selectedColor === c.value ? 'border-2 border-gray-900' : ''
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  <View
                    className="h-full w-full rounded-full"
                    onTouchEnd={() => setSelectedColor(c.value)}
                  />
                </View>
                <Text className="mt-1 text-xs text-gray-400">{c.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button
          title="Create Fund"
          onPress={handleSave}
          loading={isCreating}
          size="lg"
          fullWidth
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
