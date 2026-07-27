import { useState, useEffect } from 'react';

function useSessionState(key, initialValue) {
  const [state, setState] = useState(() => {
    const stored = sessionStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

export default useSessionState;