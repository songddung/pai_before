import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';

export interface FormField {
  name: string;
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number';
  required?: boolean;
  validation?: (value: string) => string | null;
  leftIcon?: keyof typeof import('@expo/vector-icons/Ionicons')['glyphMap'];
  rightIcon?: keyof typeof import('@expo/vector-icons/Ionicons')['glyphMap'];
}

export interface FormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, string>) => void;
  submitButtonText?: string;
  initialValues?: Record<string, string>;
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

export const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  submitButtonText = 'Submit',
  initialValues = {},
  isLoading = false,
  title,
  subtitle,
}) => {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleValueChange = (name: string, value: string) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = values[field.name] || '';

      // Required validation
      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label || field.name} is required`;
        return;
      }

      // Custom validation
      if (field.validation && value) {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.name] = validationError;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(values);
    }
  };

  const getKeyboardType = (type: string) => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'number':
        return 'numeric';
      default:
        return 'default';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {title && (
        <View style={styles.header}>
          <Text variant="h4" color="text" align="center">{title}</Text>
          {subtitle && (
            <Text variant="body1" color="textSecondary" align="center" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>
      )}

      <View style={styles.fieldsContainer}>
        {fields.map((field) => (
          <Input
            key={field.name}
            label={field.label}
            placeholder={field.placeholder}
            value={values[field.name] || ''}
            onChangeText={(text) => handleValueChange(field.name, text)}
            error={errors[field.name]}
            required={field.required}
            secureTextEntry={field.type === 'password'}
            keyboardType={getKeyboardType(field.type || 'text')}
            leftIcon={field.leftIcon}
            rightIcon={field.rightIcon}
            style={styles.input}
          />
        ))}
      </View>

      <Button
        title={submitButtonText}
        onPress={handleSubmit}
        loading={isLoading}
        fullWidth
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  subtitle: {
    marginTop: 8,
    lineHeight: 24,
  },
  fieldsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  input: {
    // Individual input styling can be added here
  },
  submitButton: {
    marginTop: 8,
  },
});