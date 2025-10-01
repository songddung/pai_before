import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Button } from '../atoms/Button';

export interface EmptyStateProps {
  icon?: keyof typeof import('@expo/vector-icons/Ionicons')['glyphMap'];
  title: string;
  subtitle?: string;
  actionButton?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionButton,
}) => {
  return (
    <View style={styles.container}>
      {icon && (
        <Icon
          name={icon}
          size={64}
          color="#9CA3AF"
          style={styles.icon}
        />
      )}

      <Text variant="h5" color="text" align="center">
        {title}
      </Text>

      {subtitle && (
        <Text variant="body1" color="textSecondary" align="center" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}

      {actionButton && (
        <Button
          title={actionButton.title}
          variant={actionButton.variant || 'primary'}
          onPress={actionButton.onPress}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 24,
    gap: 16,
  },
  icon: {
    marginBottom: 8,
  },
  subtitle: {
    lineHeight: 24,
  },
  button: {
    marginTop: 8,
  },
});