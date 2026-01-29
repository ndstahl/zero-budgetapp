import { View, Pressable, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  onPress?: () => void;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const variantClasses = {
  default: 'bg-white dark:bg-gray-800 rounded-2xl',
  outlined: 'bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 rounded-2xl shadow-sm shadow-black/5',
};

export function Card({
  children,
  onPress,
  variant = 'elevated',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  const classes = `${variantClasses[variant]} ${paddingClasses[padding]} ${className}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${classes} active:opacity-95`} {...props}>
        {children}
      </Pressable>
    );
  }

  return (
    <View className={classes} {...props}>
      {children}
    </View>
  );
}
