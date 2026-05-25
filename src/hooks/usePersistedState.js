import { useState, useEffect } from 'react';
import { safeGet, safeSet, LS_PREFIX } from '../utils/storage';

export function usePersistedState(key, initial) {
  const [val, setVal] = useState(() => safeGet(key, initial));
  useEffect(() => { safeSet(key, val); }, [key, val]);
  return [val, setVal];
}

export function clearAllMatchlyStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const keys = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(LS_PREFIX)) keys.push(k);
    }
    keys.forEach(k => window.localStorage.removeItem(k));
  } catch {}
}
