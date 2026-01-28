import { View } from 'react-native';

interface DividerProps {
  className?: string;
}

export function Divider({ className = '' }: DividerProps) {
  return <View className={`h-px w-full bg-gray-200 ${className}`} />;
}
