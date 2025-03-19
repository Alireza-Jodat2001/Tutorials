'use client';

import { fetchPosts } from '@/apis/graphQLClient';
import { useSuspenseQuery } from '@tanstack/react-query';

export default function Component5() {
  const { data } = useSuspenseQuery({ queryKey: ['posts'], queryFn: fetchPosts });

  console.log(data);

  return <div>page</div>;
}
