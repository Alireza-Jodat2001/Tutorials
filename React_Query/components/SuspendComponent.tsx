'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

export default function SuspendComponent() {
  const { data, error, isFetching } = useSuspenseQuery({ queryKey: ['/users'] });

  if (error && !isFetching) throw Error(error);

  console.log(data);

  return <div>SuspendComponent</div>;
}
