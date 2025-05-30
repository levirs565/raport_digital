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
import { TRPCQueryOptions } from '@trpc/tanstack-react-query';

type MaybeRefDeep<T> = Extract<
  Extract<
    UseQueryOptions<any, any, any, any, [T]>,
    { queryKey: any }
  >['queryKey'],
  any[]
>[0];
type MapQueryOptionsDef<Def> = {
  [K in keyof Def]: K extends 'input' ? MaybeRefDeep<Def[K]> : Def[K];
};
type MapToVue<T> = {
  [K in keyof T]: T[K] extends TRPCQueryOptions<infer K>
    ? TRPCQueryOptions<MapQueryOptionsDef<K>>
    : T[K] extends object
    ? T[K] extends (...args: any[]) => any
      ? T[K]
      : MapToVue<T[K]>
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
