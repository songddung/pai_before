import { useState, useCallback } from 'react';

export const useToggle = (
  initialValue: boolean = false
): [boolean, () => void, (value?: boolean) => void] => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  const setToggle = useCallback((newValue?: boolean) => {
    if (typeof newValue === 'boolean') {
      setValue(newValue);
    } else {
      setValue(prev => !prev);
    }
  }, []);

  return [value, toggle, setToggle];
};