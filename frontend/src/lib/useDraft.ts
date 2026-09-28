import { useCallback, useEffect, useRef, useState } from 'react';
import { StorageKeys, readJson, removeKey, writeJson } from './storage';

// Form state that survives a refresh or accidental tab close. Values are saved
// to localStorage as the user types and restored the next time the form mounts
// (or when `key` changes, e.g. switching pets). Call `clear()` after a
// successful submit so the saved draft doesn't come back.
export function useDraft<T extends Record<string, unknown>>(key: string, initial: T) {
  const storageKey = StorageKeys.draftPrefix + key;
  const initialRef = useRef(initial);
  const load = (k: string) => ({ key: k, value: { ...initialRef.current, ...readJson<Partial<T>>(k, {}) } as T });

  // The value is tagged with the key it belongs to, so a key change never
  // writes the previous pet's draft under the new pet's key
  const [state, setState] = useState(() => load(storageKey));
  const current = state.key === storageKey ? state : load(storageKey);

  useEffect(() => {
    if (state.key !== storageKey) setState(load(storageKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const isEmpty = (v: T) => Object.keys(v).every((k) => v[k] === initialRef.current[k]);

  // Save on every change; drop the entry once the form is back to empty
  useEffect(() => {
    if (state.key !== storageKey) return;
    if (isEmpty(state.value)) removeKey(state.key);
    else writeJson(state.key, state.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, storageKey]);

  const update = useCallback((patch: Partial<T>) => {
    setState((prev) => (prev.key === storageKey ? { key: prev.key, value: { ...prev.value, ...patch } } : prev));
  }, [storageKey]);

  const clear = useCallback(() => {
    removeKey(storageKey);
    setState({ key: storageKey, value: initialRef.current });
  }, [storageKey]);

  return { value: current.value, update, clear, hasDraft: !isEmpty(current.value) };
}
