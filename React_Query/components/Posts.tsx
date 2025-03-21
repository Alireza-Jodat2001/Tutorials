'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/apis/graphQLClient';
import NestedServerComponent from './NestedServerComponent';

export default function Posts() {
  const { data, isPending, isLoading } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });

  return (
    <div>
      {isPending || isLoading ? <>loading</> : data?.map(({ title }, index) => <div key={index}>{title}</div>)}
      <NestedServerComponent />
    </div>
  );
}
