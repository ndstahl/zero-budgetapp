import { View, Text, Pressable } from 'react-native';
import { Badge } from '../ui/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Transaction } from '../../types/transaction';

interface TransactionCardProps {
  transaction: Transaction;
  onPress: () => void;
}

export function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const displayAmount = Math.abs(transaction.amount);
  const amountColor = isIncome ? 'text-success-500' : 'text-gray-900';
  const amountPrefix = isIncome ? '+' : '-';

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-white px-4 py-3 active:bg-gray-50"
    >
      {/* Icon / Avatar */}
      <View
        className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${
          isIncome ? 'bg-success-50' : 'bg-gray-100'
        }`}
      >
        <Text className={`text-lg font-bold ${isIncome ? 'text-success-500' : 'text-gray-500'}`}>
          {(transaction.merchant_name ?? transaction.description ?? '?')[0]?.toUpperCase()}
        </Text>
      </View>

      {/* Details */}
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
          {transaction.merchant_name ?? transaction.description ?? 'Transaction'}
        </Text>
        <View className="flex-row items-center mt-0.5">
          <Text className="text-xs text-gray-400">{formatDate(transaction.date)}</Text>
          {transaction.line_item_name && (
            <Badge label={transaction.line_item_name} variant="default" />
          )}
          {transaction.pending && (
            <Badge label="Pending" variant="warning" />
          )}
        </View>
      </View>

      {/* Amount */}
      <Text className={`text-sm font-semibold ${amountColor}`}>
        {amountPrefix}{formatCurrency(displayAmount)}
      </Text>
    </Pressable>
  );
}
