import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'pill';
  style?: StyleProp<ViewStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  shape = 'rounded',
}) => {
  return (
    <View
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        styles[`shape_${shape}`],
      ]}
    >
      <Text
        style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}
      >
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Variants
  default: {
    backgroundColor: '#F3F4F6',
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  success: {
    backgroundColor: '#10B981',
  },
  warning: {
    backgroundColor: '#F59E0B',
  },
  error: {
    backgroundColor: '#EF4444',
  },
  info: {
    backgroundColor: '#06B6D4',
  },

  // Sizes
  size_sm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    minHeight: 18,
  },
  size_md: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    minHeight: 22,
  },
  size_lg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 28,
  },

  // Shapes
  shape_rounded: {
    borderRadius: 4,
  },
  shape_pill: {
    borderRadius: 999,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },

  // Text variants
  text_default: {
    color: '#374151',
  },
  text_primary: {
    color: '#FFFFFF',
  },
  text_secondary: {
    color: '#FFFFFF',
  },
  text_success: {
    color: '#FFFFFF',
  },
  text_warning: {
    color: '#FFFFFF',
  },
  text_error: {
    color: '#FFFFFF',
  },
  text_info: {
    color: '#FFFFFF',
  },

  // Text sizes
  text_sm: {
    fontSize: 10,
  },
  text_md: {
    fontSize: 12,
  },
  text_lg: {
    fontSize: 14,
  },
});
