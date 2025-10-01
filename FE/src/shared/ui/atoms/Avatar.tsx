import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface AvatarProps {
  size?: number;
  source?: { uri: string } | number;
  name?: string;
  variant?: 'circle' | 'square';
  backgroundColor?: string;
  textColor?: string;
  onPress?: () => void;
  showBadge?: boolean;
  badgeColor?: string;
  badgeContent?: string | number;
}

export const Avatar: React.FC<AvatarProps> = ({
  size = 40,
  source,
  name,
  variant = 'circle',
  backgroundColor = '#E5E7EB',
  textColor = '#6B7280',
  onPress,
  showBadge = false,
  badgeColor = '#EF4444',
  badgeContent,
}) => {
  const borderRadius = variant === 'circle' ? size / 2 : 8;
  const fontSize = size * 0.4;

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius,
      backgroundColor: source ? 'transparent' : backgroundColor,
    },
  ];

  const content = source ? (
    <Image
      source={source}
      style={{
        width: size,
        height: size,
        borderRadius,
      }}
      resizeMode="cover"
    />
  ) : name ? (
    <Text
      style={[
        styles.initials,
        {
          fontSize,
          color: textColor,
        },
      ]}
    >
      {getInitials(name)}
    </Text>
  ) : (
    <Ionicons
      name="person"
      size={size * 0.6}
      color={textColor}
    />
  );

  const avatar = (
    <View style={containerStyle}>
      {content}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              backgroundColor: badgeColor,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: size * 0.15,
              right: -size * 0.05,
              top: -size * 0.05,
            },
          ]}
        >
          {badgeContent && (
            <Text
              style={[
                styles.badgeText,
                { fontSize: size * 0.15 },
              ]}
            >
              {badgeContent}
            </Text>
          )}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} style={styles.touchable}>
        {avatar}
      </TouchableOpacity>
    );
  }

  return avatar;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  initials: {
    fontWeight: '600',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  touchable: {
    borderRadius: 100,
  },
});