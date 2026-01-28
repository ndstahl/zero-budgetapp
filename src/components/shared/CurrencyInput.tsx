import { View, TextInput, Text } from 'react-native';
import { useState, forwardRef } from 'react';
import { centsToDollars } from '../../utils/formatters';

interface CurrencyInputProps {
  value: number; // cents
  onChangeValue: (cents: number) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

export const CurrencyInput = forwardRef<TextInput, CurrencyInputProps>(
  function CurrencyInput({ value, onChangeValue, label, error, placeholder = '0.00' }, ref) {
    const [displayValue, setDisplayValue] = useState(value > 0 ? centsToDollars(value) : '');
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? 'border-danger-500'
      : focused
        ? 'border-brand-500'
        : 'border-gray-300';

    const handleChange = (text: string) => {
      // Allow only digits and one decimal point
      const cleaned = text.replace(/[^0-9.]/g, '');
      const parts = cleaned.split('.');
      if (parts.length > 2) return;
      if (parts[1] && parts[1].length > 2) return;

      setDisplayValue(cleaned);

      const dollars = parseFloat(cleaned);
      if (!isNaN(dollars)) {
        onChangeValue(Math.round(dollars * 100));
      } else {
        onChangeValue(0);
      }
    };

    return (
      <View className="w-full">
        {label && (
          <Text className="mb-1.5 text-sm font-medium text-gray-700">{label}</Text>
        )}
        <View
          className={`flex-row items-center rounded-xl border bg-white px-3 py-3 ${borderColor}`}
        >
          <Text className="mr-1 text-base text-gray-500">$</Text>
          <TextInput
            ref={ref}
            className="flex-1 text-base text-gray-900"
            keyboardType="decimal-pad"
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            value={displayValue}
            onChangeText={handleChange}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false);
              // Format on blur
              if (displayValue) {
                const dollars = parseFloat(displayValue);
                if (!isNaN(dollars)) {
                  setDisplayValue(dollars.toFixed(2));
                }
              }
            }}
          />
        </View>
        {error && <Text className="mt-1 text-sm text-danger-500">{error}</Text>}
      </View>
    );
  }
);
