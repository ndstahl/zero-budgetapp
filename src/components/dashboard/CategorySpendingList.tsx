import { View, Text, StyleSheet, Pressable } from 'react-native';
import { formatCurrency } from '../../utils/formatters';
import { CATEGORY_COLORS } from './SpendingArcChart';
import {
  Home,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Heart,
  Gamepad2,
  GraduationCap,
  Gift,
  Wallet,
  Smartphone,
  Plane,
  Baby,
  Dog,
  Dumbbell,
  Scissors,
  type LucideIcon,
} from 'lucide-react-native';

// Map category names to icons
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Housing': Home,
  'Rent': Home,
  'Mortgage': Home,
  'Food & Dining': Utensils,
  'Food': Utensils,
  'Groceries': Utensils,
  'Restaurants': Utensils,
  'Dining': Utensils,
  'Transportation': Car,
  'Auto': Car,
  'Car': Car,
  'Gas': Car,
  'Shopping': ShoppingBag,
  'Clothing': ShoppingBag,
  'Personal': Scissors,
  'Utilities': Zap,
  'Electric': Zap,
  'Internet': Smartphone,
  'Phone': Smartphone,
  'Health': Heart,
  'Healthcare': Heart,
  'Medical': Heart,
  'Insurance': Heart,
  'Entertainment': Gamepad2,
  'Fun': Gamepad2,
  'Subscriptions': Smartphone,
  'Education': GraduationCap,
  'Giving': Gift,
  'Gifts': Gift,
  'Charity': Gift,
  'Travel': Plane,
  'Kids': Baby,
  'Pets': Dog,
  'Fitness': Dumbbell,
};

function getCategoryIcon(name: string): LucideIcon {
  if (CATEGORY_ICONS[name]) return CATEGORY_ICONS[name];

  const lowerName = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return icon;
    }
  }

  return Wallet;
}

interface CategorySpending {
  id: string;
  name: string;
  spent: number;
  planned: number;
  color: string;
}

interface CategorySpendingListProps {
  categories: CategorySpending[];
  isDark?: boolean;
  onPressCategory?: (id: string) => void;
}

export function CategorySpendingList({
  categories,
  isDark = false,
  onPressCategory,
}: CategorySpendingListProps) {
  const sortedCategories = [...categories]
    .filter((c) => c.spent > 0 || c.planned > 0)
    .sort((a, b) => b.spent - a.spent);

  if (sortedCategories.length === 0) {
    return (
      <View style={[styles.emptyContainer, isDark && styles.emptyContainerDark]}>
        <Text style={styles.emptyText}>No spending data yet</Text>
        <Text style={styles.emptySubtext}>Add transactions to see your spending breakdown</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      {/* Header */}
      <View style={[styles.headerRow, isDark && styles.headerRowDark]}>
        <Text style={styles.headerLabel}>SPENDING CATEGORIES</Text>
        <View style={styles.headerRight}>
          <Text style={styles.headerAmount}>SPEND</Text>
          <Text style={styles.headerAmount}>BUDGET</Text>
        </View>
      </View>

      {/* Category rows */}
      {sortedCategories.map((category, index) => {
        const color = category.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length];
        const Icon = getCategoryIcon(category.name);
        const isOverBudget = category.planned > 0 && category.spent > category.planned;

        return (
          <Pressable
            key={category.id}
            onPress={() => onPressCategory?.(category.id)}
            style={({ pressed }) => [
              styles.categoryRow,
              isDark && styles.categoryRowDark,
              pressed && styles.categoryRowPressed,
              index === sortedCategories.length - 1 && styles.lastRow,
            ]}
          >
            {/* Colored accent bar */}
            <View style={[styles.colorBar, { backgroundColor: color }]} />

            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Icon color={color} size={20} strokeWidth={2} />
            </View>

            {/* Category name */}
            <Text
              style={[styles.categoryName, isDark && styles.categoryNameDark]}
              numberOfLines={1}
            >
              {category.name}
            </Text>

            {/* Amounts */}
            <View style={styles.amountsContainer}>
              <Text
                style={[
                  styles.spentAmount,
                  isDark && styles.spentAmountDark,
                  isOverBudget && styles.spentAmountOver,
                ]}
              >
                {formatCurrency(category.spent)}
              </Text>
              <Text style={styles.separator}>/</Text>
              <Text style={[styles.budgetAmount, isDark && styles.budgetAmountDark]}>
                {category.planned > 0 ? formatCurrency(category.planned) : '—'}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
  },
  emptyContainerDark: {
    backgroundColor: '#1F2937',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 6,
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerRowDark: {
    backgroundColor: '#283548',
    borderBottomColor: '#374151',
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 20,
  },
  headerAmount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    width: 65,
    textAlign: 'right',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryRowDark: {
    backgroundColor: '#1F2937',
    borderBottomColor: '#374151',
  },
  categoryRowPressed: {
    backgroundColor: '#F9FAFB',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  colorBar: {
    width: 4,
    height: 48,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 14,
  },
  categoryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 14,
  },
  categoryNameDark: {
    color: '#FFFFFF',
  },
  amountsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spentAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    width: 65,
    textAlign: 'right',
  },
  spentAmountDark: {
    color: '#FFFFFF',
  },
  spentAmountOver: {
    color: '#EF4444',
  },
  separator: {
    fontSize: 14,
    color: '#D1D5DB',
    marginHorizontal: 2,
  },
  budgetAmount: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
    width: 65,
    textAlign: 'right',
  },
  budgetAmountDark: {
    color: '#6B7280',
  },
});
