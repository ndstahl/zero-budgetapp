import { View, Text, Pressable, StyleSheet } from 'react-native';
import { formatCurrency, formatDate } from '../../utils/formatters';
import type { Transaction } from '../../types/transaction';

interface TransactionCardProps {
  transaction: Transaction;
  onPress: () => void;
  isDark?: boolean;
}

export function TransactionCard({ transaction, onPress, isDark = false }: TransactionCardProps) {
  const isIncome = transaction.type === 'income';
  const displayAmount = Math.abs(transaction.amount);
  const amountPrefix = isIncome ? '+' : '-';
  const initial = (transaction.merchant_name ?? transaction.description ?? '?')[0]?.toUpperCase() ?? '?';

  const dynamicStyles = createStyles(isDark);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        dynamicStyles.card,
        pressed && dynamicStyles.cardPressed,
      ]}
    >
      <View style={dynamicStyles.innerContent}>
        {/* Avatar */}
        <View style={[
          dynamicStyles.avatar,
          isIncome ? dynamicStyles.avatarIncome : dynamicStyles.avatarExpense
        ]}>
          <Text style={[dynamicStyles.avatarText, isIncome ? dynamicStyles.avatarTextIncome : dynamicStyles.avatarTextExpense]}>
            {initial}
          </Text>
        </View>

        {/* Middle Section - Name and Date */}
        <View style={dynamicStyles.middle}>
          <Text
            style={dynamicStyles.merchantName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {transaction.merchant_name ?? transaction.description ?? 'Transaction'}
          </Text>
          <Text style={dynamicStyles.date}>
            {formatDate(transaction.date)}
            {transaction.line_item_name && ` • ${transaction.line_item_name}`}
          </Text>
        </View>

        {/* Amount */}
        <Text style={[
          dynamicStyles.amount,
          isIncome ? dynamicStyles.amountIncome : dynamicStyles.amountExpense
        ]}>
          {amountPrefix}{formatCurrency(displayAmount)}
        </Text>
      </View>
    </Pressable>
  );
}

const createStyles = (isDark: boolean) => StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 14,
    backgroundColor: isDark ? '#283548' : '#F5F6F8',
  },
  cardPressed: {
    backgroundColor: isDark ? '#374151' : '#EBEDF0',
  },
  innerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 16,
    paddingRight: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarIncome: {
    backgroundColor: isDark ? '#064E3B' : '#D1FAE5',
  },
  avatarExpense: {
    backgroundColor: isDark ? '#374151' : '#E5E7EB',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
  },
  avatarTextIncome: {
    color: '#10B981',
  },
  avatarTextExpense: {
    color: isDark ? '#9CA3AF' : '#6B7280',
  },
  middle: {
    flex: 1,
    marginRight: 12,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? '#FFFFFF' : '#111827',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
    color: isDark ? '#9CA3AF' : '#6B7280',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  amountIncome: {
    color: '#10B981',
  },
  amountExpense: {
    color: isDark ? '#FFFFFF' : '#111827',
  },
});
