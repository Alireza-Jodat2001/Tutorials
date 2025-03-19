import { fetchPosts } from '@/apis/graphQLClient';
import Component4 from '@/components/Component4';
import CustomHydrationBoundary from '@/providers/CustomeHydrationBoundary';
import getQueryClient from '@/utils/getQueryClient';
import { dehydrate } from '@tanstack/react-query';
import axios from 'axios';

export default async function page() {
  // create an error
  await getQueryClient().fetchQuery({ queryKey: ['posts'], queryFn: fetchPosts });

  return (
    <CustomHydrationBoundary state={dehydrate(getQueryClient())}>
      <Component4 />
    </CustomHydrationBoundary>
  );
}
