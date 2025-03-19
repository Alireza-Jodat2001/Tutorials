'use client';

import { useQuery } from '@tanstack/react-query';

export default function Component4() {
  const { data, error } = useQuery({ queryKey: ['posts'], queryFn: () => Promise.resolve(5) }); 

  console.log(data, error);

  return <div>Component4</div>;
}
