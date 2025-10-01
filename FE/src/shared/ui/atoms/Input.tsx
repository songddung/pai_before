import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined',
  size = 'md',
  required = false,
  style,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);

  const isPassword = secureTextEntry !== undefined;
  const hasError = !!error;

  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, hasError && styles.labelError]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          styles[variant],
          styles[`${variant}_${size}`],
          isFocused && styles[`${variant}_focused`],
          hasError && styles[`${variant}_error`],
          props.editable === false && styles.disabled,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={hasError ? '#EF4444' : isFocused ? '#3B82F6' : '#6B7280'}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            styles[`input_${size}`],
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
            style,
          ]}
          secureTextEntry={isPassword ? !isPasswordVisible : false}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor="#9CA3AF"
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={handlePasswordToggle}
            style={styles.rightIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye' : 'eye-off'}
              size={20}
              color={hasError ? '#EF4444' : '#6B7280'}
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={hasError ? '#EF4444' : isFocused ? '#3B82F6' : '#6B7280'}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  labelError: {
    color: '#EF4444',
  },
  required: {
    color: '#EF4444',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
  },
  input: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  leftIcon: {
    marginLeft: 12,
  },
  rightIcon: {
    marginRight: 12,
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  disabled: {
    opacity: 0.6,
  },

  // Variants
  default: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  filled: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  outlined: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },

  // Sizes
  default_sm: {
    minHeight: 36,
  },
  default_md: {
    minHeight: 44,
  },
  default_lg: {
    minHeight: 52,
  },
  filled_sm: {
    minHeight: 36,
  },
  filled_md: {
    minHeight: 44,
  },
  filled_lg: {
    minHeight: 52,
  },
  outlined_sm: {
    minHeight: 36,
  },
  outlined_md: {
    minHeight: 44,
  },
  outlined_lg: {
    minHeight: 52,
  },

  // Input sizes
  input_sm: {
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  input_md: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input_lg: {
    fontSize: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // Focus states
  default_focused: {
    borderBottomColor: '#3B82F6',
  },
  filled_focused: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  outlined_focused: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  // Error states
  default_error: {
    borderBottomColor: '#EF4444',
  },
  filled_error: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  outlined_error: {
    borderColor: '#EF4444',
  },
});