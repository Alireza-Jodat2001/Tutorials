'use client';

import React from 'react';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/apis/graphQLClient';

export default function Component2({ queryKey }) {
  const { data } = useSuspenseQuery({ queryKey: [queryKey], queryFn: () => Promise.resolve(5) });

  console.log(data);

  return <div>component2</div>;
}
