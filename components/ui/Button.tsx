import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing, Typography } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const buttonStyle: ViewStyle[] = [styles.base, styles[variant], styles[`size_${size}`]];
  const textStyle: TextStyle[] = [styles.text, styles[`text_${variant}`], styles[`textSize_${size}`]];

  if (disabled || loading) buttonStyle.push(styles.disabled);

  return (
    <TouchableOpacity
      style={[...buttonStyle, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? Colors.accent : Colors.white} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: Colors.accent,
  },
  secondary: {
    backgroundColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.accent,
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md },
  size_md: { paddingVertical: Spacing.sm + 2, paddingHorizontal: Spacing.lg },
  size_lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
  text: { fontWeight: '600' },
  text_primary: { color: Colors.white },
  text_secondary: { color: Colors.white },
  text_danger: { color: Colors.white },
  text_ghost: { color: Colors.accent },
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 17 },
});
