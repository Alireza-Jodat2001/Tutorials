'use client';

import { fetchPosts } from '@/apis/graphQLClient';
import { useQuery } from '@tanstack/react-query';

export default function NestedServerComponent() {
  const { data } = useQuery({ queryKey: ['idea'], queryFn: fetchPosts });

  console.log(data);

  return <div>NestedServerComponent</div>;
}
