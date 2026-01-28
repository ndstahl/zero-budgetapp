import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand';
}

const variantClasses = {
  default: { container: 'bg-gray-100', text: 'text-gray-600' },
  success: { container: 'bg-success-50', text: 'text-success-700' },
  warning: { container: 'bg-warning-50', text: 'text-warning-700' },
  danger: { container: 'bg-danger-50', text: 'text-danger-700' },
  brand: { container: 'bg-brand-50', text: 'text-brand-600' },
};

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const v = variantClasses[variant];
  return (
    <View className={`rounded-full px-2.5 py-0.5 ${v.container}`}>
      <Text className={`text-xs font-medium ${v.text}`}>{label}</Text>
    </View>
  );
}
