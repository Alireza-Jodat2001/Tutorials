import { fetchPosts } from '@/apis/graphQLClient';
import { useQuery } from '@tanstack/react-query';

export default function Comments() {
  const { data } = useQuery({ queryKey: ['comments'], queryFn: fetchPosts });
  return <div>Comments</div>;
}
