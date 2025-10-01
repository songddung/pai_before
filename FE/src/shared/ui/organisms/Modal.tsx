import React from 'react';
import { View, StyleSheet, Modal as RNModal, TouchableOpacity } from 'react-native';
import { Text } from '../atoms/Text';
import { Icon } from '../atoms/Icon';
import { Button } from '../atoms/Button';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  actions?: Array<{
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
  }>;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  actions,
  size = 'medium',
}) => {
  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle={size === 'fullscreen' ? 'fullScreen' : 'formSheet'}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        {(title || showCloseButton) && (
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              {title && (
                <Text variant="h6" color="text">{title}</Text>
              )}
            </View>
            {showCloseButton && (
              <Icon
                name="close"
                size={24}
                color="#6B7280"
                onPress={onClose}
                containerStyle={styles.closeButton}
              />
            )}
          </View>
        )}

        {/* Content */}
        <View style={[styles.content, styles[`content_${size}`]]}>
          {children}
        </View>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <View style={styles.actionsContainer}>
            <View style={styles.actions}>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  title={action.title}
                  variant={action.variant || 'primary'}
                  onPress={action.onPress}
                  style={styles.actionButton}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleContainer: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  content_small: {
    maxHeight: 300,
  },
  content_medium: {
    maxHeight: 500,
  },
  content_large: {
    maxHeight: 700,
  },
  content_fullscreen: {
    maxHeight: '100%',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});