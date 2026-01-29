import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: 'brand' | 'success' | 'warning' | 'danger';
  height?: 'sm' | 'md' | 'lg';
}

const colors = {
  brand: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

const heights = {
  sm: 6,
  md: 10,
  lg: 16,
};

export function ProgressBar({
  progress,
  color = 'brand',
  height = 'md',
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const widthPercent = `${Math.round(clampedProgress * 100)}%`;
  const barHeight = heights[height];

  return (
    <View style={[styles.track, { height: barHeight }]}>
      <View
        style={[
          styles.fill,
          {
            height: barHeight,
            width: widthPercent as any,
            backgroundColor: colors[color],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
});
