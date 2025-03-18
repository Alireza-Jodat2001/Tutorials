import Posts from '@/components/Posts';
import { fetchPosts } from '@/apis/graphQLClient';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import CustomHydrationBoundary from '@/providers/CustomeHydrationBoundary';

export default async function PostsPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } });

  await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: fetchPosts });
  await queryClient.prefetchQuery({ queryKey: ['idea'], queryFn: () => ['nested server component'] });

  return (
    <CustomHydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
    </CustomHydrationBoundary>
  );
}
