import { inject } from 'vue';
import { trpc } from './api';
import {
  DataTag,
  dataTagErrorSymbol,
  dataTagSymbol,
  QueryClient,
  useQuery,
  UseQueryOptions,
  UseQueryReturnType,
} from '@tanstack/vue-query';

type MaybeRefDeep<T> = Extract<
  Extract<
    UseQueryOptions<any, any, any, any, [T]>,
    { queryKey: any }
  >['queryKey'],
  any[]
>[0];
type MapQueryOptions<F> = F extends (
  input: infer A,
  ...rest: infer B
) => infer R
  ? (input: MaybeRefDeep<A>, ...rest: B) => R
  : never;
type MapToVue<T> = {
  [K in keyof T]: K extends 'queryOptions'
    ? MapQueryOptions<T[K]>
    : T[K] extends object
    ? MapToVue<T[K]>
    : T[K];
};
type TRPCVue = MapToVue<typeof trpc>;

export const QUERY_CLIENT_KEY = Symbol();
export const TRPC_KEY = Symbol();
export const injectTrpc = () => inject<TRPCVue>(TRPC_KEY);
export const injectQueryClient = () => inject<QueryClient>(QUERY_CLIENT_KEY);

export function useTrcpQuery<T extends { queryKey: DataTag<any, any, any> }>(
  options: T
): UseQueryReturnType<
  T['queryKey'][dataTagSymbol],
  T['queryKey'][dataTagErrorSymbol]
> {
  return useQuery(options);
}
