import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: 'bg-brand-500 active:bg-brand-600',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-brand-50 active:bg-brand-100',
    text: 'text-brand-600',
  },
  outline: {
    container: 'border border-gray-300 bg-white active:bg-gray-50',
    text: 'text-gray-700',
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-gray-700',
  },
  danger: {
    container: 'bg-danger-500 active:bg-danger-700',
    text: 'text-white',
  },
};

const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'px-3 py-2 rounded-lg', text: 'text-sm' },
  md: { container: 'px-4 py-3 rounded-xl', text: 'text-base' },
  lg: { container: 'px-6 py-4 rounded-xl', text: 'text-lg' },
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  {
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    fullWidth = false,
  },
  ref
) {
  const v = variantClasses[variant];
  const s = sizeClasses[size];

  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center ${s.container} ${v.container} ${
        fullWidth ? 'w-full' : ''
      } ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? '#fff' : '#4F46E5'}
          size="small"
        />
      ) : (
        <>
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={`font-semibold ${s.text} ${v.text}`}>{title}</Text>
        </>
      )}
    </Pressable>
  );
});
