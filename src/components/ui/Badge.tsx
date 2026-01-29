import { View, Text, StyleSheet } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'brand';
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const containerStyle = [
    styles.container,
    variant === 'success' && styles.containerSuccess,
    variant === 'warning' && styles.containerWarning,
    variant === 'danger' && styles.containerDanger,
    variant === 'brand' && styles.containerBrand,
  ];

  const textStyle = [
    styles.text,
    variant === 'success' && styles.textSuccess,
    variant === 'warning' && styles.textWarning,
    variant === 'danger' && styles.textDanger,
    variant === 'brand' && styles.textBrand,
  ];

  return (
    <View style={containerStyle}>
      <Text style={textStyle}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 2,
    backgroundColor: '#F3F4F6',
    marginLeft: 6,
  },
  containerSuccess: {
    backgroundColor: '#ECFDF5',
  },
  containerWarning: {
    backgroundColor: '#FFFBEB',
  },
  containerDanger: {
    backgroundColor: '#FEF2F2',
  },
  containerBrand: {
    backgroundColor: '#EEF2FF',
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
  },
  textSuccess: {
    color: '#047857',
  },
  textWarning: {
    color: '#B45309',
  },
  textDanger: {
    color: '#B91C1C',
  },
  textBrand: {
    color: '#4F46E5',
  },
});
