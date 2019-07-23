import {
  useEffect, useReducer, useMemo, useRef,
} from 'react';

// useFluxStore essentially combines useReducer and useEffect to use with FluxStores
// useReducer: Used to extract relevant values from the store
// useEffect is used to attach a listener to the store

export function useFluxStore(store, reducer, deps = []) {
  // Use a ref to calculate reducer's initial value from current state of store.
  const initReducer = useRef();

  if (!initReducer.current) {
    initReducer.current = reducer(null, store);
  }

  // We need to pass an initialArg otherwise the first *out* will be undefined
  const [out, _dispatch] = useReducer(reducer, initReducer.current);

  // For any dependencies in the reducer, we make sure to trigger the reducer again
  useMemo(() => _dispatch(store), deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function listener() {
      // When store is updated, we dispatch an update to the reducer
      _dispatch(store);
    }

    // Attach reducer's listener to store
    const token = store.addListener(listener);

    // Instead of setting initial value as the second parameter on the useReducer, dispatch here:
    // This avoids missing an update between useReducer --> render --> useEffect
    _dispatch(store);

    // On useEffect destruction, remove the listener
    return () => token.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // We make sure to pass [] so we're not attaching/detaching  on every render
  return out; // Reducer value gets returned to useFluxStore
}

export default useFluxStore;
