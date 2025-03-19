'use client';

import { QueryClient, QueryClientProvider, dehydrate, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { CustomQueryClientProviderProps } from '@/types/reactQuery.type';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import useStableQueryClient from '@/hooks/useStableQueryClient';
import getQueryClient from '@/utils/getQueryClient';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import axios from 'axios';

const CustomQueryClientProvider = ({ children }: CustomQueryClientProviderProps) => {
  // const queryClient = useStableQueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } });
  async function defaultQueryFn({ queryKey }) {
    const { data } = await axios.get(`https://jsonplaceholder.typicode.com${queryKey[0]}`);
    return data;
  }

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60 * 1000, queryFn: defaultQueryFn } },
    dehydrate: {
      // با اضافه کردن این قطعه کد دیگه نیازی به await نداریم
      // هنگام prefetching، کوئری‌های `pending` هم ذخیره شوند
      shouldDehydrateQuery: query => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',

      // خطاهای Next.js حذف نشوند تا درست مدیریت شوند
      shouldRedactErrors: error => false,
    },
  });

  return (
    // getQueryClient()
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryStreamedHydration>{children}</ReactQueryStreamedHydration>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  );
};

export default CustomQueryClientProvider;
