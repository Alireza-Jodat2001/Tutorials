'use client';

import {
  dehydrate,
  hydrate,
  keepPreviousData,
  matchMutation,
  matchQuery,
  queryOptions,
  skipToken,
  useInfiniteQuery,
  useIsFetching,
  useMutation,
  useMutationState,
  usePrefetchQuery,
  useQueries,
  useQuery,
  useQueryClient,
  useSuspenseQueries,
  useSuspenseQuery,
  useQueryErrorResetBoundary,
} from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { addTodo } from '@/apis/postApi';
import axios, { AxiosError } from 'axios';
import { fetchPosts } from '@/apis/graphQLClient';
import { Button } from '@material-tailwind/react';
import { useEffect, useState, FormEvent, Suspense, lazy, useCallback } from 'react';
import { MutationGroupOption } from '@/types/rootLayout.type';
import { FetchUsersProps, PaginationData, SelectType, User } from '@/types/componentBased.type';
import { FAKE_QUERY_KEY, FETCHING, IDEA, POSTS, QueryKeys, TODO, ADD_TODO } from '@/types/reactQuery.type';
import dynamic from 'next/dynamic';
import usePosts from '@/hooks/useTodos';
import SuspendComponent from '@/components/SuspendComponent';
import ErrorCompo from '@/components/Error';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

export default function page() {
  const groupOptions = (queryKey: QueryKeys) => queryOptions({ queryKey: [queryKey], queryFn: fetchPosts });
  const emptyGroupOptions = () => queryOptions({ queryKey: [FAKE_QUERY_KEY], queryFn: async () => [] });
  const mutationGroupOption: MutationGroupOption = () => ({ mutationFn: addTodo });
  const queryClient = useQueryClient();

  // set query data
  function TestSetQueryData() {
    const { data } = useQuery({ ...groupOptions(IDEA), staleTime: 5 * 60 * 1000 });
    function handleClick() {
      setTimeout(() => {
        const newData = data?.map(item => ({ ...item, new: true }));
        queryClient.setQueryData(groupOptions(IDEA).queryKey, newData);
      }, 1000);
    }
    return <Button onClick={handleClick}>test set query data</Button>;
  }

  // network mode
  function TestNetworkMode() {
    const { isPending, isPaused, isFetching } = useQuery({ ...groupOptions(IDEA), refetchOnReconnect: true /* default */, networkMode: 'always' });
    return <div>Test Network Mode</div>;
  }

  // useQuery depended queries
  function TestUseQueryDependentQueries() {
    const { data: ideas } = useQuery(groupOptions(IDEA));
    const { data: posts } = useQuery({ ...groupOptions(POSTS), enabled: !!ideas?.length });
    console.log(posts);
    return <div>depended queries</div>;
  }

  // useQueries dependent queries
  function TestUseQueriesDependentQueries() {
    const { data: ideas } = useQuery(groupOptions(IDEA));
    const [posts, todo] = useQueries({ queries: !!ideas?.length ? [groupOptions(POSTS), groupOptions(TODO)] : [emptyGroupOptions(), emptyGroupOptions()] });
    console.log(posts);
    return <div>useQueries dependent queries</div>;
  }

  // best practice useQuery dependent queries
  function TestBestPracticeUseQueryDependentQueries() {
    async function fetchBoth() {
      try {
        const response1 = await Promise.resolve(5);
        const response2 = await Promise.resolve(2);
        return { response1, response2 };
      } catch {}
    }
    const { data } = useQuery({ queryKey: [IDEA], queryFn: fetchBoth });
    console.log(data);
    return <div>best practice useQuery dependent queries</div>;
  }

  // background refreshing /* with isFetching */
  function TestBackgroundRefreshing() {
    const { isFetching, status } = useQuery(groupOptions(IDEA));
    useEffect(() => {
      if (!!!isFetching) return;
      toast.info('Refreshing...');
    }, [isFetching]);
    console.log(status); /* success */
    return <div>background refreshing with isFetching</div>;
  }

  // useIsFetching /* background fetching */
  function TestUseIsFetching() {
    const isFetching = useIsFetching();
    useQuery(groupOptions(IDEA));
    useEffect(() => {
      if (!!!isFetching) return;
      toast.info('Refreshing...');
    }, [isFetching]);
    return <div>useIsFetching</div>;
  }

  // enabled = false
  function TestEnabledFalse() {
    const { data } = useQuery({ ...groupOptions(IDEA), enabled: false });
    console.log(data);
    return <div>enabled = false</div>;
  }

  // lazy query
  function TestLazyQuery() {
    const [enabled, setEnabled] = useState(false);
    const { data } = useQuery({ queryKey: [2], queryFn: async () => await Promise.resolve(5), enabled: false, initialData: null });
    console.log(data);
    return <Button onClick={() => setEnabled(true)}>click to execute fetch</Button>;
  }

  // skip token
  function TestSkipToken() {
    const [filter, setFilter] = useState<string | boolean>(false);
    const { data } = useQuery({ queryKey: ['todos', filter], queryFn: filter ? () => Promise.resolve(5) : skipToken });
    return <Button onClick={() => setFilter('ali')}>test skip token</Button>;
  }

  // retries query and delay retries
  function TestQueryRetriesAndDelayRetries() {
    const { data } = useQuery({ ...groupOptions(IDEA), retry: 10 /* false true (for custom logic (failureCount, error) => ...) */, retryDelay: 1 * 1000 });
    console.log(data);
    return <div>retries query and delay retries</div>;
  }

  // paginated queries
  function TestPaginatedQueries() {
    const [page, setPage] = useState(1);
    async function fetchUsers(page: number) {
      try {
        const { data } = await axios.get(`https://reqres.in/api/users?page=${page}&per_page=10`);
        return data.data;
      } catch {
        throw new Error('Failed to fetch...');
      }
    }
    const { data, fetchStatus, status } = useQuery({
      queryKey: [POSTS, page],
      queryFn: () => fetchUsers(page),
      placeholderData: keepPreviousData,
      select: data => data.map(({ first_name, last_name, avatar }) => ({ first_name, last_name, avatar })),
    });
    return (
      <>
        paginated queries
        <Button onClick={() => setPage(page - 1)} loading={status === 'pending' && fetchStatus === FETCHING}>
          previous
        </Button>
        <Button onClick={() => setPage(page + 1)} loading={status === 'pending' && fetchStatus === FETCHING}>
          next
        </Button>
        <div className='flex flex-wrap gap-3'>
          {data.map(({ first_name, last_name, avatar }, index) => (
            <div key={index}>
              <img src={avatar} alt={`${first_name} ${last_name}`} /> {first_name} {last_name}
            </div>
          ))}
        </div>
      </>
    );
  }

  // useInfiniteQuery /* next directional */
  function TestUseInfiniteQuery() {
    async function fetchUsers({ pageParam }: FetchUsersProps) {
      try {
        const { data } = await axios.get<PaginationData>(`https://reqres.in/api/users?page=${pageParam}&per_page=2`);
        return data;
      } catch {
        throw new Error('Failed to fetch...');
      }
    }
    const { data, fetchNextPage, fetchPreviousPage, hasNextPage, hasPreviousPage, isFetchingNextPage, isFetchingPreviousPage } = useInfiniteQuery({
      queryKey: [IDEA],
      queryFn: fetchUsers,
      initialPageParam: 1,
      select: (data: SelectType): User[] => {
        // for show reverse data
        // return { pages: [...data.pages].reverse(), pageParams: [...data.pageParams].reverse() };
        return data.pages.flatMap(({ data }) => data.map(({ first_name, avatar, last_name }) => ({ first_name, avatar, last_name })));
      },
      getNextPageParam: ({ page, total_pages }: PaginationData) => (page + 1 <= total_pages ? page + 1 : undefined),
      getPreviousPageParam: () => 1,
      initialData: undefined,
      placeholderData: keepPreviousData,
      maxPages: 3,
    });
    console.log(isFetchingNextPage);
    return (
      <>
        use infinite queries
        <Button onClick={() => fetchPreviousPage()} disabled={!hasPreviousPage}>
          previous
        </Button>
        <Button onClick={() => fetchNextPage()} disabled={!hasNextPage}>
          next
        </Button>
        <div className='flex flex-wrap gap-3'>
          {(data as User[]).map(({ first_name, last_name, avatar }, index) => (
            <div key={index}>
              <img src={avatar} alt={`${first_name} ${last_name}`} /> {first_name} {last_name}
            </div>
          ))}
        </div>
        {/* <List onEndReached={() => !isFetchingNextPage && fetchNextPage()} /> */}
      </>
    );
  }

  // setQueryData
  function TestSetQueryData2() {
    const { data } = useQuery(groupOptions(IDEA));
    setTimeout(() => {
      queryClient.setQueryData([IDEA], data => data.slice(0, 10));
    }, 1000);
    console.log(data);
    return <div>test setQueryData2</div>;
  }

  // initial query data
  function InitialQueryData() {
    const getTodo = () => [5];
    const response = useQuery({
      queryKey: [IDEA],
      queryFn: fetchPosts,
      initialData: Promise.resolve(5) /*() => getTodo() // for once executed */,
      staleTime: 5 * 1000,
      initialDataUpdatedAt: Date.now(),
    });
    return <div>initial query data</div>;
  }

  // initial data from cached
  function InitialDataFromCached() {
    const { data } = useQuery({ queryKey: [IDEA, 1], queryFn: fetchPosts, initialData: () => queryClient.getQueryData([IDEA])?.find(({ id }) => id === 1) });
    console.log(data);
    return <div>initial data from cached</div>;
  }

  // initial data from cached with initialUpdatedAt
  function InitialDataFromCachedWithInitialDataUpdatedAt() {
    const todoResponse = useQuery(groupOptions(IDEA));
    const { data } = useQuery({
      queryKey: [IDEA, 3],
      queryFn: () => axios.get(`https://jsonplaceholder.typicode.com/todos/${1}`),
      initialData: () => queryClient.getQueryData([IDEA])?.find(({ id }) => id === 2),
      initialDataUpdatedAt: () => queryClient.getQueryState([IDEA])?.dataUpdatedAt,
      staleTime: 5 * 1000,
    });
    console.log(data);
    return <div>initial data from cached with initialUpdatedAt</div>;
  }

  // Conditional Initial Data from Cache
  function ConditionalInitialDataFromCache() {
    const todoId = 1;
    const todoResponse = useQuery(groupOptions(IDEA));
    const { data } = useQuery({
      queryKey: [IDEA, todoId],
      queryFn: () => axios.get(`https://jsonplaceholder.typicode.com/todos/${todoId}`),
      initialData: () => {
        const state = queryClient.getQueryState([IDEA]);
        if (state && Date.now() - state.dataUpdatedAt <= 10 * 1000) return queryClient.getQueryData([IDEA])?.find(({ id }) => id === todoId);
      },
    });
    console.log(data);
    return <div>Conditional Initial Data from Cache</div>;
  }

  // placeholder query data
  function PlaceholderQueryData() {
    // 1
    // const placeholderData = useMemo(() => [{ userId: 1, id: 1, title: 'delectus aut autem', completed: false }], []);
    // const { data } = useQuery({ queryKey: [IDEA], queryFn: fetchPosts, placeholderData });
    // 2
    // const { data } = useQuery({ queryKey: [IDEA], queryFn: fetchPosts, placeholderData: (previousData, previousQuery) => previousData });
    // 3
    const todoId = 3;
    const todoResponse = useQuery(groupOptions(IDEA));
    const { data } = useQuery({
      queryKey: [IDEA, todoId],
      queryFn: () => axios.get(`https://jsonplaceholder.typicode.com/todos/${todoId}`),
      placeholderData: () => queryClient.getQueryData([IDEA])?.find(({ id }) => id === todoId),
    });
    console.log(data);
    return <div>placeholder query data</div>;
  }

  // mutations
  function Mutations() {
    // 1
    // const { mutate, isPending, data } = useMutation({ ...mutationGroupOption() });
    // console.log(isPending);
    // return <div onClick={() => mutate()}>Mutations</div>;
    // 2
    // const { mutate, isPending, data } = useMutation({
    //   mutationFn: (e: FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     return addTodo();
    //   },
    // });
    // console.log(isPending);
    // return (
    //   <form onSubmit={mutate}>
    //     <Button type='submit'>Mutations</Button>
    //   </form>
    // );
    // 3
    // const { mutate, isPending, data, error } = useMutation({
    //   mutationFn: (e: FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     return addTodo('s');
    //   },
    // });
    // console.log(isPending);
    // return (
    //   <form onSubmit={mutate}>
    //     {error && <p>{error}</p>}
    //     <Button type='submit'>Mutations</Button>
    //   </form>
    // );
    // 4
    // const { mutate, isPending, data, error } = useMutation({
    //   mutationFn: () => addTodo(),
    //   onSuccess: (data, variables, context) => console.log(data, variables, context),
    //   onError: (data, variables, context) => console.log(data, variables, context),
    //   onSettled: (data, error, variables, context) => console.log(data, error, variables, context),
    // });
    // return (
    //   <div
    //     onClick={() => {
    //       // mutate()
    //       mutate(undefined, {
    //         onSuccess: (data, variables, context) => {
    //           console.log(data, variables, context);
    //         },
    //         onError: (error, variables, context) => {
    //           console.log(error, variables, context);
    //         },
    //         onSettled: (data, error, variables, context) => {
    //           console.log(data, error, variables, context);
    //         },
    //       });
    //     }}
    //   >
    //     Mutations
    //   </div>
    // );
    // 5
    // const { mutate, isPending, data, error } = useMutation({
    //   mutationFn: () => addTodo(),
    //   // onSuccess: (data, variables, context) => console.log(data), // 3 times executed
    // });
    // useEffect(() => {
    //   // 3 times executed
    //   // Array(3)
    //   //   .fill('')
    //   //   .forEach(() => mutate());
    //   // once executed
    //   Array(3)
    //     .fill('')
    //     .forEach(() => mutate(undefined, { onSuccess: data => console.log(data) /* once executed (only last item) */ }));
    // }, []);
    // return <div>mutate response in loop</div>;
    // 6
    // const { mutateAsync } = useMutation({ mutationFn: () => addTodo() });
    // useEffect(() => {
    //   (async () => {
    //     try {
    //       const response = await mutateAsync();
    //       console.log(response);
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   })();
    // }, []);
    // return <div>test async mutate</div>;
    // 7
    // const { mutateAsync } = useMutation({ mutationFn: () => addTodo('s'), retry: 3 });
    // useEffect(() => {
    //   (async () => {
    //     try {
    //       const response = await mutateAsync();
    //       console.log(response);
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   })();
    // }, []);
    // return <div>test retry in failed mutation</div>;
    // 8
    // queryClient.setMutationDefaults([ADD_TODO], {
    //   mutationFn: addTodo,
    //   async onMutate(variables) {
    //     console.log(variables);
    //     await queryClient.cancelQueries([TODO]);
    //     const optimisticTodo = { id: 12, title: variables }; /* ...variables */
    //     queryClient.setQueriesData([TODO], oldTodo => [...oldTodo, newTodo]);
    //     return { optimisticTodo };
    //   },
    //   onSuccess: (result, variables, context) =>
    //     queryClient.setQueryData(['todo'], oldTodo => oldTodo.map(item => (item.id === context.optimisticTodo.id ? context.optimisticTodo : item))),
    //   onError: (error, variables, context) => queryClient.setQueryData(['todo'], oldTodo => oldTodo.filter(({ id }) => id !== context.optimisticTodo.id)),
    //   retry: 3,
    // });
    // const { mutate } = useMutation({ mutationKey: [ADD_TODO] });
    // const state = dehydrate(queryClient);
    // hydrate(queryClient, state);
    // queryClient.resumePausedMutations();
    // return <Button onClick={() => mutate()}>persisted mutation</Button>;
    // 9
    // ********************* Persisting Offline mutations is already exist in doc *************************
    // 10
    // const { mutate } = useMutation({ mutationFn: addTodo, scope: { id: 'for_first_compo' } });
    // return <div onClick={() => mutate(undefined)}>scope mutation</div>;
  }

  // query invalidation
  function QueryInvalidation() {
    // 1
    // const { data } = useQuery({ queryKey: ['todo'], queryFn: fetchPosts });
    // const { data: firstPostItem } = useQuery({
    //   queryKey: ['todo', 1],
    //   queryFn: fetchPosts,
    //   select: data => data.find(({ id }) => id === 1),
    // });
    // // queryClient.invalidateQueries(); // every query is invalidate
    // queryClient.invalidateQueries({ queryKey: ['todo'], exact: true });
    // return <div>query invalidation</div>;
    // 2
    // const { data } = useQuery({
    //   queryKey: ['todo', { version: 20 }],
    //   queryFn: fetchPosts,
    // });
    // setTimeout(() => queryClient.invalidateQueries({ predicate: query => query.queryKey?.[0] === 'todo' && query.queryKey?.[1].version >= 10 }), 5000);
    // return <div>query invalidation with condition</div>;
  }

  // update from mutation response
  function UpdateFromMutationResponse() {
    useQuery({ queryKey: ['todo'], queryFn: fetchPosts });
    const { mutate } = useMutation({ mutationFn: addTodo, onSuccess: data => queryClient.setQueryData(['todo'], oldTodo => [data, ...oldTodo]) });
    return <div onClick={() => mutate()}>update from mutation response</div>;
  }

  // Optimistic Updates
  function OptimisticUpdates() {
    // 1
    // useQuery({ queryKey: ['todo'], queryFn: fetchPosts });
    // const { mutate, variables, isError } = useMutation({ mutationFn: addTodo, onSuccess: () => queryClient.invalidateQueries(['todo']) });
    // console.log(variables); // new todo /* render with different opacity in UI */
    // return (
    //   <div onClick={() => mutate()}>
    //     {variables && (
    //       <>
    //         <div>new todo</div>
    //         {isError && <button onClick={() => mutate()}>retry</button>}
    //       </>
    //     )}
    //     Optimistic Updates
    //   </div>
    // );
    // 2
    useQuery({ queryKey: ['todo'], queryFn: fetchPosts });
    // some ever in your application
    const { mutate } = useMutation({ mutationFn: addTodo, mutationKey: ['addTodo'] });
    setTimeout(() => {
      // in other component
      const variables = useMutationState({ filters: { mutationKey: ['addTodo'] }, select: mutation => mutation.state.variables });
      console.log(variables);
    }, 10000);
    return <div onClick={() => mutate()}>mutate</div>;
  }

  // Query cancelation
  function QueryCancelation() {
    // 1
    // const { data } = useQuery({ queryKey: ['todo'], queryFn: ({ signal }) => axios.get('https://jsonplaceholder.typicode.com/todos', { signal }) });
    // return <div>Query cancelation</div>;
    // 2
    const { data } = useQuery({
      queryKey: ['todo'],
      queryFn: async ({ signal }) => {
        const response = await axios.get('https://jsonplaceholder.typicode.com/todos', { signal });
        return response.data;
      },
    });
    return (
      <div onClick={() => queryClient.cancelQueries({ queryKey: ['todo'] })} className='cursor-pointer'>
        Query cancelation
      </div>
    );
  }

  // Query or Mutation Filters
  function Filters() {
    // 1
    // (async () => {
    //   await queryClient.cancelQueries(); // cancel all queries
    //   queryClient.removeQueries({ queryKey: ['todo'], type: 'inactive' });
    //   await queryClient.refetchQueries({ queryKey: ['todo'], stale: true, exact: true, fetchStatus: 'idle' });
    //   await queryClient.refetchQueries({}); // predicate
    // })();
    // return <div>Query or Mutation Filters</div>;
    // 2
    // (async () => {
    //   queryClient.isMutating(); // all fetching mutations
    //   queryClient.isMutating({ mutationKey: ['addTodo'], exact: true, status: 'idle' });
    //   queryClient.isMutating({ predicate: mutation => mutation.state.variables?.id === 1 });
    // })();
    // return <div>Query or Mutation Filters</div>;
    // 3
    const query = useQuery({ queryKey: ['todo'], queryFn: fetchPosts });
    // const mutation = useMutation({ mutationKey: ['addPosts'], mutationFn: addTodo });
    const isQueryMatching = matchQuery({ queryKey: ['todo'] }, query);
    // const isMutationMatching = matchMutation({ mutationKey: ['addPosts'] }, mutation);
    console.log(isQueryMatching);
    return <div>Query or Mutation Filters</div>;
  }

  // parallel suspense queries
  function parallelSuspenseQueries() {
    // execute in parallel
    // const [usersQuery, teamsQuery, projectsQuery] = useSuspenseQueries({
    //   queries: [
    //     { queryKey: ['users'], queryFn: fetchUsers },
    //     { queryKey: ['teams'], queryFn: fetchTeams },
    //     { queryKey: ['projects'], queryFn: fetchProjects },
    //   ],
    // });
    return <>parallel suspense queries</>;
  }

  // flatten request waterfall
  function FlattenRequestWaterfall({ id }: { id: number }) {
    // 1 /* not flatten & request waterfall */
    // const { data } = useQuery({
    //   queryKey: ['article', id],
    //   queryFn: fetchPosts,
    // });
    // function Comment({ id }: { id: number }) {
    //   const { data } = useQuery({
    //     queryKey: ['article-comments', id],
    //     queryFn: fetchPosts,
    //   });
    //   return <></>;
    // }
    // return (
    //   <>
    //     <Comment id={id} />
    //   </>
    // );
    // 2 flatten request waterfall
    const [article, comments] = useSuspenseQueries({
      queries: [
        { queryKey: ['article', id], queryFn: fetchPosts },
        { queryKey: ['comments', id], queryFn: fetchPosts },
      ],
    });
    // now pass the data instead of pass id
    return <div>flatten request waterfall</div>;
  }

  // code splitting & decrease request waterfall
  function DecreaseRequestWaterfall() {
    const Comments = dynamic(() => import('@/components/Comments'), { ssr: false, loading: () => <>Is loading...</> });
    const { data } = useQuery({
      queryKey: ['article'],
      queryFn: fetchPosts,
    });
    return data ? <Comments /> : <>loading...</>;
  }

  // Prefetching & Router Integration
  function PrefetchingRouterIntegration() {
    const prefetchTodo = async () => await queryClient.prefetchQuery({ queryKey: ['todo'], queryFn: fetchPosts, staleTime: 5000 });

    // 1
    // const prefetchPosts = async () =>
    //   queryClient.prefetchInfiniteQuery({
    //     queryKey: ['posts'],
    //     queryFn: fetchPosts,
    //     getNextPageParam: data => data.page + 1,
    //     initialPageParam: 1,
    //     pages: 3 /* prefetch the first 3 pages */,
    //   });

    // 2
    // const { data } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts });
    // useQuery({ queryKey: ['idea'], queryFn: fetchPosts }); // ignore the result
    // function Comments() {
    //   const { data } = useQuery({ queryKey: ['idea'], queryFn: fetchPosts });
    //   return <>comments</>;
    // }

    // 3
    // usePrefetchQuery({ queryKey: ['posts'], queryFn: fetchPosts });
    // function Article() {
    //   const { data } = useSuspenseQuery({ queryKey: ['idea'], queryFn: fetchPosts });
    //   return <>Article</>;
    // }

    // 4
    // const { data } = useQuery({
    //   queryKey: ['article'],
    //   queryFn: async function (...args) {
    //     queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: fetchPosts });
    //     return () => Promise.resolve(5);
    //   },
    // });

    // 5
    // useEffect(
    //   function () {
    //     queryClient.prefetchQuery({ queryKey: ['idea'], queryFn: fetchPosts });
    //   },
    //   [queryClient]
    // );

    // 6
    // const Comments = lazy(() => import('@/components/Comments'));
    // const { data } = useQuery({
    //   queryKey: ['posts'],
    //   queryFn: async function () {
    //     const posts = await fetchPosts();
    //     const isExistId12 = posts.some(({ id }) => id === 12);
    //     isExistId12 && queryClient.prefetchQuery({ queryKey: ['idea', 12], queryFn: fetchPosts });
    //   },
    // });

    return (
      <div onMouseEnter={prefetchTodo} onFocus={prefetchTodo}>
        Prefetching & Router Integration
        {/* <Comments /> */}
        {/* <Suspense fallback='loading article'>
          <Article />
        </Suspense> */}
        {/* {data?.some(({ id }) => id === 12) && (
          <Suspense fallback='comment loading...'>
            <Comments />
          </Suspense>
        )} */}
      </div>
    );
  }

  // Render Optimizations
  function RenderOptimizations() {
    const { data } = usePosts(useCallback(data => data.map(({ id }) => id)));
    console.log(data);
    return <>Render Optimizations</>;
  }

  // Default Query Function
  function DefaultQueryFunction() {
    const { data } = useQuery({ queryKey: ['/users/1'] });
    console.log(data);
    return <>Default Query Function</>;
  }

  // Suspense
  function TestSuspense() {
    const { reset } = useQueryErrorResetBoundary();

    return (
      // <QueryErrorResetBoundary>
      // {({ reset }) => (
      <ErrorBoundary
        onReset={reset}
        fallbackRender={({ resetErrorBoundary }) => (
          <div>
            There was an error!
            <Button onClick={() => resetErrorBoundary()}>Try again</Button>
          </div>
        )}
      >
        <Suspense fallback='loading...'>
          <SuspendComponent />
        </Suspense>
      </ErrorBoundary>
      // )}
      //  </QueryErrorResetBoundary>
    );
  }

  return (
    <div>
      {/* <TestSetQueryData /> */}
      {/* <TestNetworkMode /> */}
      {/* <TestUseQueryDependentQueries /> */}
      {/* <TestUseQueriesDependentQueries /> */}
      {/* <TestBestPracticeUseQueryDependentQueries /> */}
      {/* <TestUseIsFetching /> */}
      {/* <TestBackgroundRefreshing /> */}
      {/* <TestEnabledFalse /> */}
      {/* <TestLazyQuery /> */}
      {/* <TestSkipToken /> */}
      {/* <TestQueryRetriesAndDelayRetries /> */}
      {/* <TestPaginatedQueries /> */}
      {/* <TestUseInfiniteQuery /> */}
      {/* <TestSetQueryData2 /> */}
      {/* <InitialQueryData /> */}
      {/* <InitialDataFromCached /> */}
      {/* <InitialDataFromCachedWithInitialDataUpdatedAt /> */}
      {/* <ConditionalInitialDataFromCache /> */}
      {/* <PlaceholderQueryData /> */}
      {/* <Mutations /> */}
      {/* <QueryInvalidation /> */}
      {/* <UpdateFromMutationResponse /> */}
      {/* <OptimisticUpdates /> */}
      {/* <QueryCancelation /> */}
      {/* <Filters /> */}
      {/* <FlattenRequestWaterfall id={1} /> */}
      {/* <PrefetchingRouterIntegration /> */}
      {/* <RenderOptimizations /> */}
      {/* <DefaultQueryFunction /> */}
      <TestSuspense />
    </div>
  );
}
