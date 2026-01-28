import { View, TextInput, Text, type TextInputProps } from 'react-native';
import { forwardRef, useState } from 'react';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, hint, leftIcon, rightIcon, ...props },
  ref
) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? 'border-danger-500'
    : focused
      ? 'border-brand-500'
      : 'border-gray-300';

  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-gray-700">{label}</Text>
      )}
      <View
        className={`flex-row items-center rounded-xl border bg-white px-3 py-3 ${borderColor}`}
      >
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          ref={ref}
          className="flex-1 text-base text-gray-900"
          placeholderTextColor="#9CA3AF"
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="mt-1 text-sm text-danger-500">{error}</Text>}
      {hint && !error && <Text className="mt-1 text-sm text-gray-400">{hint}</Text>}
    </View>
  );
});
