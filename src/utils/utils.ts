import React, { useState, useRef, useCallback } from 'react';

export function useDebounce(value: string, delay: number = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  React.useEffect(() => {
    const handler: any = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cancel the timeout if value changes (also on delay change or unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useGetLatest(obj) {
  const ref = useRef();
  ref.current = obj;

  return useCallback(() => ref.current, []);
}
