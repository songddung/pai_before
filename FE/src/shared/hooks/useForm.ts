import { useState, useCallback } from 'react';

interface ValidationRule<T> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

interface FormField<T = any> {
  value: T;
  error: string | null;
  touched: boolean;
  rules?: ValidationRule<T>;
}

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule<T[keyof T]>>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
}: UseFormOptions<T>) => {
  const [fields, setFields] = useState<Record<keyof T, FormField>>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key as keyof T] = {
        value: initialValues[key as keyof T],
        error: null,
        touched: false,
        rules: validationRules[key as keyof T],
      };
      return acc;
    }, {} as Record<keyof T, FormField>)
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback((name: keyof T, value: any): string | null => {
    const rules = validationRules[name];
    if (!rules) return null;

    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${String(name)} is required`;
    }

    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      return `${String(name)} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      return `${String(name)} must be no more than ${rules.maxLength} characters`;
    }

    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      return `${String(name)} format is invalid`;
    }

    if (rules.custom) {
      return rules.custom(value);
    }

    return null;
  }, [validationRules]);

  const setValue = useCallback((name: keyof T, value: any) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        value,
        error: validateField(name, value),
        touched: true,
      },
    }));
  }, [validateField]);

  const setFieldTouched = useCallback((name: keyof T, touched: boolean = true) => {
    setFields(prev => ({
      ...prev,
      [name]: {
        ...prev[name],
        touched,
        error: touched ? validateField(name, prev[name].value) : null,
      },
    }));
  }, [validateField]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    Object.keys(newFields).forEach(key => {
      const fieldKey = key as keyof T;
      const error = validateField(fieldKey, newFields[fieldKey].value);
      newFields[fieldKey] = {
        ...newFields[fieldKey],
        error,
        touched: true,
      };
      if (error) isValid = false;
    });

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const values = Object.keys(fields).reduce((acc, key) => {
        acc[key as keyof T] = fields[key as keyof T].value;
        return acc;
      }, {} as T);

      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [fields, validateForm, onSubmit]);

  const reset = useCallback(() => {
    setFields(
      Object.keys(initialValues).reduce((acc, key) => {
        acc[key as keyof T] = {
          value: initialValues[key as keyof T],
          error: null,
          touched: false,
          rules: validationRules[key as keyof T],
        };
        return acc;
      }, {} as Record<keyof T, FormField>)
    );
    setIsSubmitting(false);
  }, [initialValues, validationRules]);

  const getFieldProps = useCallback((name: keyof T) => ({
    value: fields[name]?.value || '',
    error: fields[name]?.error || null,
    onChangeText: (value: string) => setValue(name, value),
    onBlur: () => setFieldTouched(name, true),
  }), [fields, setValue, setFieldTouched]);

  const values = Object.keys(fields).reduce((acc, key) => {
    acc[key as keyof T] = fields[key as keyof T].value;
    return acc;
  }, {} as T);

  const errors = Object.keys(fields).reduce((acc, key) => {
    const error = fields[key as keyof T].error;
    if (error) acc[key as keyof T] = error;
    return acc;
  }, {} as Partial<Record<keyof T, string>>);

  const hasErrors = Object.values(errors).some(error => error !== null);
  const isValid = !hasErrors && Object.values(fields).every(field => field.touched);

  return {
    fields,
    values,
    errors,
    hasErrors,
    isValid,
    isSubmitting,
    setValue,
    setFieldTouched,
    validateForm,
    handleSubmit,
    reset,
    getFieldProps,
  };
};