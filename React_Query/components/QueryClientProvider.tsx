'use client';

import { QueryClient, QueryClientProvider, dehydrate } from '@tanstack/react-query';
import { CustomQueryClientProviderProps } from '@/types/reactQuery.type';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import useStableQueryClient from '@/hooks/useStableQueryClient';

const CustomQueryClientProvider = ({ children }: CustomQueryClientProviderProps) => {
  const queryClient = useStableQueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default CustomQueryClientProvider;
