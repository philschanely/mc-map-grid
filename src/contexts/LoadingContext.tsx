"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

type LoadingContextValue = {
  loading: boolean;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const countRef = useRef(0);

  const withLoading = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      countRef.current += 1;
      setLoadingCount(countRef.current);
      try {
        return await fn();
      } finally {
        countRef.current = Math.max(0, countRef.current - 1);
        setLoadingCount(countRef.current);
      }
    },
    [],
  );

  return (
    <LoadingContext.Provider
      value={{ loading: loadingCount > 0, withLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    return {
      loading: false,
      withLoading: <T,>(fn: () => Promise<T>) => fn(),
    };
  }
  return ctx;
}
