'use client';

import { QueryClientConfig, QueryClient } from '@tanstack/react-query';
import { useState } from 'react';

export default function useStableQueryClient(config: QueryClientConfig) {
  const [queryClient] = useState(() => new QueryClient(config));
  return queryClient;
}
