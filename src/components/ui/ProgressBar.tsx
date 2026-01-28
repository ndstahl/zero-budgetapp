import { View } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: 'brand' | 'success' | 'warning' | 'danger';
  height?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
};

const heightClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  progress,
  color = 'brand',
  height = 'md',
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  const widthPercent = `${Math.round(clampedProgress * 100)}%`;

  return (
    <View className={`w-full overflow-hidden rounded-full bg-gray-200 ${heightClasses[height]}`}>
      <View
        className={`${heightClasses[height]} rounded-full ${colorClasses[color]}`}
        style={{ width: widthPercent as any }}
      />
    </View>
  );
}
