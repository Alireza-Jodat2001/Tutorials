import { ReactNode } from 'react';

export interface CustomQueryClientProviderProps {
  children: ReactNode;
}

export enum QueryKeys {
  POSTS = 'posts',
  TODO = 'todo',
  IDEA = 'ideas',
  FAKE_QUERY_KEY = 'fake',
  ADD_TODO = 'addTodo',
}
export const { POSTS, IDEA, TODO, FAKE_QUERY_KEY, ADD_TODO } = QueryKeys;

export enum FetchStatuses {
  FETCHING = 'fetching',
  IDLE = 'idle',
  PAUSED = 'paused',
}

export const { FETCHING, IDLE, PAUSED } = FetchStatuses;
