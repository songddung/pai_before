import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Button } from '../atoms/Button';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  leftIcon?: keyof typeof import('@expo/vector-icons/Ionicons')['glyphMap'];
  rightIcon?: keyof typeof import('@expo/vector-icons/Ionicons')['glyphMap'];
  onLeftPress?: () => void;
  onRightPress?: () => void;
  rightButton?: {
    title: string;
    onPress: () => void;
  };
  variant?: 'default' | 'centered';
  showBorder?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  rightButton,
  variant = 'default',
  showBorder = true,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, showBorder && styles.withBorder]}>
        <View style={styles.content}>
          {/* Left Side */}
          <View style={styles.left}>
            {leftIcon && (
              <Icon
                name={leftIcon}
                size={24}
                color="#374151"
                onPress={onLeftPress}
              />
            )}
          </View>

          {/* Center */}
          <View style={[styles.center, variant === 'centered' && styles.centerAligned]}>
            {title && (
              <Text
                variant="h6"
                color="text"
                align={variant === 'centered' ? 'center' : 'left'}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                variant="caption"
                color="textSecondary"
                align={variant === 'centered' ? 'center' : 'left'}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right Side */}
          <View style={styles.right}>
            {rightButton ? (
              <Button
                title={rightButton.title}
                variant="ghost"
                size="sm"
                onPress={rightButton.onPress}
              />
            ) : rightIcon ? (
              <Icon
                name={rightIcon}
                size={24}
                color="#374151"
                onPress={onRightPress}
              />
            ) : null}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
  },
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  left: {
    width: 44,
    alignItems: 'flex-start',
  },
  center: {
    flex: 1,
    paddingHorizontal: 16,
  },
  centerAligned: {
    alignItems: 'center',
  },
  right: {
    width: 44,
    alignItems: 'flex-end',
  },
});