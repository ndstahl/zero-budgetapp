import { View, Text } from 'react-native';
import { useState } from 'react';
import { CurrencyInput } from '../shared/CurrencyInput';
import { Button } from '../ui/Button';

interface FundContributionInputProps {
  onContribute: (amount: number) => void;
  isLoading: boolean;
}

export function FundContributionInput({ onContribute, isLoading }: FundContributionInputProps) {
  const [amount, setAmount] = useState(0);

  const handleContribute = () => {
    if (amount <= 0) return;
    onContribute(amount);
    setAmount(0);
  };

  return (
    <View className="rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
      <Text className="mb-3 text-sm font-semibold text-gray-700">Add Contribution</Text>
      <View className="mb-3">
        <CurrencyInput
          value={amount}
          onChangeValue={setAmount}
          placeholder="0.00"
        />
      </View>
      <Button
        title="Contribute"
        onPress={handleContribute}
        loading={isLoading}
        disabled={amount <= 0}
        fullWidth
      />
    </View>
  );
}
