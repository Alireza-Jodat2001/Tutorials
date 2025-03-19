'use client';

import { QueryClientProvider, HydrationBoundary } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools/production';
import { CustomQueryClientProviderProps } from '@/types/reactQuery.type';
import getQueryClient from '@/utils/getQueryClient';

const CustomHydrationBoundary = ({ state, children }: CustomQueryClientProviderProps) => {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <HydrationBoundary state={state}>{children}</HydrationBoundary>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default CustomHydrationBoundary;
