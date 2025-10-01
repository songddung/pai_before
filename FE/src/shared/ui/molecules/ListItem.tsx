import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Avatar } from '../atoms/Avatar';
import { Card } from './Card';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof import('@expo/vector-icons/Ionicons')['glyphMap'];
  rightIcon?: keyof typeof import('@expo/vector-icons/Ionicons')['glyphMap'];
  avatar?: {
    source?: { uri: string } | number;
    name?: string;
    size?: number;
  };
  onPress?: () => void;
  onRightPress?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'card';
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  avatar,
  onPress,
  onRightPress,
  disabled = false,
  variant = 'default',
}) => {
  const content = (
    <View style={styles.content}>
      {/* Left Section */}
      <View style={styles.leftSection}>
        {avatar ? (
          <Avatar
            size={avatar.size || 40}
            source={avatar.source}
            name={avatar.name}
          />
        ) : leftIcon ? (
          <Icon
            name={leftIcon}
            size={24}
            color="#6B7280"
          />
        ) : null}
      </View>

      {/* Middle Section */}
      <View style={styles.middleSection}>
        <Text variant="body1" color="text">{title}</Text>
        {subtitle && (
          <Text variant="body2" color="textSecondary">{subtitle}</Text>
        )}
      </View>

      {/* Right Section */}
      {rightIcon && (
        <View style={styles.rightSection}>
          <Icon
            name={rightIcon}
            size={20}
            color="#9CA3AF"
            onPress={onRightPress}
            disabled={disabled}
          />
        </View>
      )}
    </View>
  );

  if (variant === 'card') {
    return (
      <Card onPress={onPress} disabled={disabled} padding={16}>
        {content}
      </Card>
    );
  }

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  leftSection: {
    width: 40,
    alignItems: 'center',
  },
  middleSection: {
    flex: 1,
    gap: 2,
  },
  rightSection: {
    width: 24,
    alignItems: 'center',
  },
});