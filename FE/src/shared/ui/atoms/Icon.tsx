import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

export interface IconProps {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  onPress?: () => void;
  disabled?: boolean;
  style?: any;
  containerStyle?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#6B7280',
  onPress,
  disabled = false,
  style,
  containerStyle,
}) => {
  const IconComponent = (
    <Ionicons
      name={name}
      size={size}
      color={disabled ? '#D1D5DB' : color}
      style={[style]}
    />
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.touchable,
          disabled && styles.disabled,
          containerStyle,
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {IconComponent}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[containerStyle]}>
      {IconComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  touchable: {
    padding: 4,
    borderRadius: 4,
  },
  disabled: {
    opacity: 0.5,
  },
});