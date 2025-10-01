import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewProps } from "react-native";

// 기존 Card 인터페이스 유지 (backward compatibility)
export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: number;
  onPress?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 16,
  onPress,
  disabled = false,
  style,
  ...props
}) => {
  const cardStyle = [
    styles.base,
    styles[variant],
    { padding },
    disabled && styles.disabled,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

// sungwoo의 새로운 Card 서브 컴포넌트들
export function CardSimple({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <View style={styles.header}>{children}</View>;
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function CardDescription({ children }: { children: React.ReactNode }) {
  return <Text style={styles.description}>{children}</Text>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filled: {
    backgroundColor: '#F9FAFB',
  },
  disabled: {
    opacity: 0.6,
  },
  // sungwoo 스타일
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: { marginBottom: 8 },
  title: { fontSize: 16, fontWeight: "bold", color: "#111" },
  description: { fontSize: 12, color: "#666" },
  content: {},
});