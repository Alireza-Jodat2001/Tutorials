import { QueryClient, defaultShouldDehydrateQuery } from '@tanstack/react-query';
import { cache } from 'react';

const getQueryClient = cache(
  () =>
    new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60 * 1000 },
        dehydrate: {
          // با اضافه کردن این قطعه کد دیگه نیازی به await نداریم
          // هنگام prefetching، کوئری‌های `pending` هم ذخیره شوند
          shouldDehydrateQuery: query => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',

          // خطاهای Next.js حذف نشوند تا درست مدیریت شوند
          shouldRedactErrors: error => false,
        },
      },
    })
);

export default getQueryClient;
