import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const LoadingActivityContext = createContext(null);

export function LoadingActivityProvider({ children }) {
  const activeLoads = useRef(new Set());
  const [isPageLoading, setIsPageLoading] = useState(false);

  const setPageLoading = useCallback((token, active) => {
    if (active) {
      activeLoads.current.add(token);
    } else {
      activeLoads.current.delete(token);
    }
    setIsPageLoading(activeLoads.current.size > 0);
  }, []);

  const value = useMemo(() => ({ isPageLoading, setPageLoading }), [isPageLoading, setPageLoading]);

  return (
    <LoadingActivityContext.Provider value={value}>
      {children}
    </LoadingActivityContext.Provider>
  );
}

export function usePageLoading(active) {
  const context = useContext(LoadingActivityContext);
  const setPageLoading = context?.setPageLoading;
  const token = useRef(Symbol('page-load'));

  useEffect(() => {
    if (!setPageLoading) return undefined;

    setPageLoading(token.current, active);
    return () => setPageLoading(token.current, false);
  }, [active, setPageLoading]);
}

export function useLoadingActivity() {
  const context = useContext(LoadingActivityContext);
  return context || { isPageLoading: false };
}
