'use client';

import { fetchPosts } from '@/apis/graphQLClient';
import { useQuery } from '@tanstack/react-query';

export default function usePosts(select) {
  const { data } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts, select });

  return { data };
}
