import Component5 from '@/components/Component5';
import { Spinner } from '@material-tailwind/react';
import { Suspense } from 'react';

export default function page() {
  return (
    <Suspense fallback={<>loading...</>}>
      <Component5 />
    </Suspense>
  );
}
