import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { formatCurrency } from '../../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SpendingCategory {
  name: string;
  amount: number;
  color: string;
}

interface SpendingArcChartProps {
  categories: SpendingCategory[];
  totalSpent: number;
  totalBudget: number;
  isDark?: boolean;
}

// Dollarwise-inspired pastel color palette
export const CATEGORY_COLORS = [
  '#60A5FA', // Blue
  '#34D399', // Emerald
  '#FBBF24', // Amber
  '#F472B6', // Pink
  '#A78BFA', // Purple
  '#2DD4BF', // Teal
  '#FB923C', // Orange
  '#4ADE80', // Green
  '#F87171', // Red
  '#818CF8', // Indigo
  '#22D3EE', // Cyan
  '#E879F9', // Fuchsia
];

export function SpendingArcChart({
  categories,
  totalSpent,
  totalBudget,
  isDark = false,
}: SpendingArcChartProps) {
  // Sort categories by amount and filter out zeros
  const sortedCategories = [...categories]
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Create arc segments - 13 blocks across the semicircle
  const totalBlocks = 13;
  const arcBlocks: { color: string; filled: boolean }[] = [];

  if (totalSpent > 0 && sortedCategories.length > 0) {
    let remainingBlocks = totalBlocks;

    sortedCategories.forEach((category, index) => {
      const proportion = category.amount / totalSpent;
      let blockCount = Math.round(proportion * totalBlocks);

      if (blockCount === 0 && proportion > 0) blockCount = 1;
      blockCount = Math.min(blockCount, remainingBlocks);
      remainingBlocks -= blockCount;

      const color = category.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length];
      for (let i = 0; i < blockCount; i++) {
        arcBlocks.push({ color, filled: true });
      }
    });

    // Fill remaining with last color
    if (remainingBlocks > 0 && sortedCategories.length > 0) {
      const lastColor = sortedCategories[sortedCategories.length - 1].color ||
        CATEGORY_COLORS[(sortedCategories.length - 1) % CATEGORY_COLORS.length];
      for (let i = 0; i < remainingBlocks; i++) {
        arcBlocks.push({ color: lastColor, filled: true });
      }
    }
  }

  // Fill empty blocks
  while (arcBlocks.length < totalBlocks) {
    arcBlocks.push({ color: isDark ? '#374151' : '#E5E7EB', filled: false });
  }

  // Arc configuration - make it bigger and more prominent
  const containerWidth = Math.min(SCREEN_WIDTH - 32, 360);
  const arcRadius = containerWidth * 0.38;
  const blockWidth = 22;
  const blockHeight = 36;
  const centerX = containerWidth / 2;
  const centerY = arcRadius + 30;

  const startAngle = 180;
  const angleRange = 180;
  const angleStep = angleRange / (totalBlocks - 1);

  return (
    <View style={styles.container}>
      <View style={[styles.arcContainer, { width: containerWidth, height: centerY + 90 }]}>
        {/* Arc blocks */}
        {arcBlocks.map((block, index) => {
          const angleDeg = startAngle - (index * angleStep);
          const angleRad = (angleDeg * Math.PI) / 180;

          const x = centerX + Math.cos(angleRad) * arcRadius - blockWidth / 2;
          const y = centerY - Math.sin(angleRad) * arcRadius - blockHeight / 2;
          const rotation = 90 - angleDeg;

          return (
            <View
              key={index}
              style={[
                styles.arcBlock,
                {
                  backgroundColor: block.color,
                  width: blockWidth,
                  height: blockHeight,
                  left: x,
                  top: y,
                  transform: [{ rotate: `${rotation}deg` }],
                  // Add subtle shadow for depth
                  shadowColor: block.color,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                },
              ]}
            />
          );
        })}

        {/* Center Content */}
        <View style={[styles.centerContent, { top: centerY - 5 }]}>
          <Text style={[styles.centerLabel, isDark && styles.centerLabelDark]}>Spent</Text>
          <Text style={[styles.centerAmount, isDark && styles.centerAmountDark]}>
            {formatCurrency(totalSpent)}
          </Text>
          <Text style={[styles.centerBudget, isDark && styles.centerBudgetDark]}>
            of {formatCurrency(totalBudget)} budget
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  arcContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  arcBlock: {
    position: 'absolute',
    borderRadius: 8,
    elevation: 3,
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    left: 0,
    right: 0,
  },
  centerLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  centerLabelDark: {
    color: '#9CA3AF',
  },
  centerAmount: {
    fontSize: 38,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -1,
  },
  centerAmountDark: {
    color: '#FFFFFF',
  },
  centerBudget: {
    fontSize: 15,
    color: '#6B7280',
    marginTop: 4,
  },
  centerBudgetDark: {
    color: '#9CA3AF',
  },
});
