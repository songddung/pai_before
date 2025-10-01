import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => Promise<void>, () => Promise<void>] => {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial value from AsyncStorage
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`Error loading ${key} from AsyncStorage:`, error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadStoredValue();
  }, [key]);

  // Set value in both state and AsyncStorage
  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting ${key} in AsyncStorage:`, error);
    }
  };

  // Remove value from both state and AsyncStorage
  const removeValue = async () => {
    try {
      setStoredValue(initialValue);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing ${key} from AsyncStorage:`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};