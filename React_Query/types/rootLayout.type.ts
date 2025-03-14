import { ReactNode } from 'react';
import { MutationOptions } from '@tanstack/react-query';

export interface RootLayoutProps {
  children: ReactNode;
}

export type MutationGroupOption = () => MutationOptions