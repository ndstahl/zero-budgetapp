import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency, formatPercent } from '../../utils/formatters';

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

interface SpendingDonutChartProps {
  categories: SpendingCategory[];
  totalSpent: number;
  totalBudget: number;
  isDark?: boolean;
}

// Premium color palette for categories
export const CATEGORY_COLORS = [
  '#4F46E5', // Indigo (brand)
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#84CC16', // Lime
  '#F97316', // Orange
];

export function SpendingDonutChart({
  categories,
  totalSpent,
  totalBudget,
  isDark = false,
}: SpendingDonutChartProps) {
  // Calculate percentages and sort by amount
  const sortedCategories = [...categories]
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const segments = sortedCategories.map((category, index) => {
    const percent = totalSpent > 0 ? category.amount / totalSpent : 0;
    return {
      ...category,
      percent,
      color: category.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    };
  });

  const budgetUsedPercent = totalBudget > 0 ? Math.min(totalSpent / totalBudget, 1) : 0;

  return (
    <View style={styles.container}>
      {/* Total Spent Display */}
      <View style={styles.totalSection}>
        <Text style={[styles.totalAmount, isDark && styles.totalAmountDark]}>
          {formatCurrency(totalSpent)}
        </Text>
        <Text style={styles.totalLabel}>
          spent of {formatCurrency(totalBudget)} budgeted
        </Text>
      </View>

      {/* Budget Progress Ring */}
      <View style={styles.ringContainer}>
        <View style={[styles.ringOuter, isDark && styles.ringOuterDark]}>
          <View
            style={[
              styles.ringProgress,
              {
                width: `${budgetUsedPercent * 100}%`,
                backgroundColor: budgetUsedPercent > 0.9 ? '#EF4444' : '#4F46E5',
              }
            ]}
          />
        </View>
        <Text style={styles.ringLabel}>
          {formatPercent(budgetUsedPercent)} of budget used
        </Text>
      </View>

      {/* Spending Breakdown Bar */}
      <View style={styles.breakdownSection}>
        <Text style={[styles.breakdownTitle, isDark && styles.breakdownTitleDark]}>
          Spending by Category
        </Text>

        {/* Stacked horizontal bar */}
        <View style={[styles.stackedBar, isDark && styles.stackedBarDark]}>
          {segments.map((segment, index) => (
            <View
              key={segment.name}
              style={[
                styles.barSegment,
                {
                  flex: segment.percent,
                  backgroundColor: segment.color,
                  borderTopLeftRadius: index === 0 ? 8 : 0,
                  borderBottomLeftRadius: index === 0 ? 8 : 0,
                  borderTopRightRadius: index === segments.length - 1 ? 8 : 0,
                  borderBottomRightRadius: index === segments.length - 1 ? 8 : 0,
                },
              ]}
            />
          ))}
        </View>

        {/* Legend with amounts */}
        <View style={styles.legend}>
          {segments.slice(0, 6).map((segment) => (
            <View key={segment.name} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <View style={styles.legendContent}>
                <View style={styles.legendTop}>
                  <Text
                    style={[styles.legendName, isDark && styles.legendNameDark]}
                    numberOfLines={1}
                  >
                    {segment.name}
                  </Text>
                  <Text style={styles.legendPercent}>
                    {formatPercent(segment.percent)}
                  </Text>
                </View>
                <Text style={styles.legendAmount}>
                  {formatCurrency(segment.amount)}
                </Text>
              </View>
            </View>
          ))}
          {segments.length > 6 && (
            <Text style={styles.legendMore}>
              +{segments.length - 6} more categories
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  // Total section
  totalSection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -1,
  },
  totalAmountDark: {
    color: '#FFFFFF',
  },
  totalLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  // Ring progress
  ringContainer: {
    alignItems: 'center',
    gap: 8,
  },
  ringOuter: {
    width: '100%',
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  ringOuterDark: {
    backgroundColor: '#374151',
  },
  ringProgress: {
    height: '100%',
    borderRadius: 6,
  },
  ringLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  // Breakdown section
  breakdownSection: {
    marginTop: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  breakdownTitleDark: {
    color: '#FFFFFF',
  },
  stackedBar: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  stackedBarDark: {
    backgroundColor: '#374151',
  },
  barSegment: {
    height: '100%',
  },
  // Legend
  legend: {
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
  },
  legendContent: {
    flex: 1,
  },
  legendTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    marginRight: 8,
  },
  legendNameDark: {
    color: '#E5E7EB',
  },
  legendPercent: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  legendAmount: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },
  legendMore: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 4,
  },
});
