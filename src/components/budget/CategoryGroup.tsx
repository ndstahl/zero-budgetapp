import { View, Text, Pressable } from 'react-native';
import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import { LineItemRow } from './LineItemRow';
import { formatCurrency } from '../../utils/formatters';
import { calculateGroupTotals } from '../../utils/budgetCalculations';
import type { CategoryGroupWithItems } from '../../types/budget';

interface CategoryGroupProps {
  group: CategoryGroupWithItems;
  onPressLineItem: (lineItemId: string) => void;
  onUpdatePlanned: (lineItemId: string, amount: number) => void;
  onAddLineItem: (categoryGroupId: string) => void;
}

export function CategoryGroup({
  group,
  onPressLineItem,
  onUpdatePlanned,
  onAddLineItem,
}: CategoryGroupProps) {
  const [expanded, setExpanded] = useState(true);
  const totals = calculateGroupTotals(group.line_items);

  return (
    <View className="mb-2">
      {/* Group Header */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-3"
      >
        <View className="flex-1 flex-row items-center">
          {expanded ? (
            <ChevronDown color="#9CA3AF" size={18} />
          ) : (
            <ChevronUp color="#9CA3AF" size={18} />
          )}
          <Text className="ml-2 text-sm font-bold uppercase tracking-wide text-gray-600 dark:text-gray-300">
            {group.name}
          </Text>
        </View>
        <View className="flex-row">
          <Text className="w-24 text-right text-xs font-medium text-gray-400 dark:text-gray-500">
            Planned
          </Text>
          <Text className="w-24 text-right text-xs font-medium text-gray-400 dark:text-gray-500">
            Spent
          </Text>
          <Text className="w-24 text-right text-xs font-medium text-gray-400 dark:text-gray-500">
            Remaining
          </Text>
        </View>
      </Pressable>

      {/* Line Items */}
      {expanded && (
        <View>
          {group.line_items.map((item) => (
            <LineItemRow
              key={item.id}
              item={item}
              onPress={() => onPressLineItem(item.id)}
              onUpdatePlanned={(amount) => onUpdatePlanned(item.id, amount)}
            />
          ))}

          {/* Group Totals */}
          <View className="flex-row items-center justify-between border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2">
            <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total</Text>
            <View className="flex-row">
              <Text className="w-24 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                {formatCurrency(totals.totalPlanned)}
              </Text>
              <Text className="w-24 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                {formatCurrency(totals.totalSpent)}
              </Text>
              <Text className="w-24 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">
                {formatCurrency(totals.totalRemaining)}
              </Text>
            </View>
          </View>

          {/* Add Line Item */}
          <Pressable
            onPress={() => onAddLineItem(group.id)}
            className="flex-row items-center px-4 py-2 active:bg-gray-50 dark:active:bg-gray-700"
          >
            <Plus color="#4F46E5" size={16} />
            <Text className="ml-1 text-sm font-medium text-brand-500">
              Add Item
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
