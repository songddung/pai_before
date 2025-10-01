import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '../atoms/Text';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#3B82F6',
  text,
  overlay = false,
}) => {
  const content = (
    <View style={[styles.container, overlay && styles.overlay]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text
          variant="body2"
          color="textSecondary"
          style={styles.text}
        >
          {text}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View style={styles.overlayContainer}>
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  text: {
    marginTop: 8,
  },
});