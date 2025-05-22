import { inject } from 'vue';
import { trpc } from './api';
import {
  DataTag,
  dataTagErrorSymbol,
  dataTagSymbol,
  QueryClient,
  useQuery,
  UseQueryReturnType,
} from '@tanstack/vue-query';

export const QUERY_CLIENT_KEY = Symbol();
export const TRPC_KEY = Symbol();
export const injectTrpc = () => inject<typeof trpc>(TRPC_KEY);
export const injectQueryClient = () => inject<QueryClient>(QUERY_CLIENT_KEY);

export function useTrcpQuery<T extends { queryKey: DataTag<any, any, any> }>(
  options: T
): UseQueryReturnType<
  T['queryKey'][dataTagSymbol],
  T['queryKey'][dataTagErrorSymbol]
> {
  return useQuery(options);
}
