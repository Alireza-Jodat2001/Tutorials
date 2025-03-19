import { fetchPosts } from '@/apis/graphQLClient';
import Component2 from '@/components/component2';
import CustomHydrationBoundary from '@/providers/CustomeHydrationBoundary';
import getQueryClient from '@/utils/getQueryClient';
import { dehydrate } from '@tanstack/react-query';

export default async function page() {
  getQueryClient().prefetchQuery({ queryKey: ['ideas'], queryFn: fetchPosts });

  return (
    <CustomHydrationBoundary state={dehydrate(getQueryClient())}>
      <Component2 queryKey='ideas' />
    </CustomHydrationBoundary>
  );
}
