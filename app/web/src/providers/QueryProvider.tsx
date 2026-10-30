'use client';

import React, { useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ApiError } from '@/lib/api-client';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Never retry on 4xx client errors (unauthorized, not found, validation error, etc.)
              if (
                error instanceof ApiError &&
                error.statusCode >= 400 &&
                error.statusCode < 500
              ) {
                return false;
              }
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false, // Don't auto-retry mutations (like login/register) to prevent duplicate actions
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
