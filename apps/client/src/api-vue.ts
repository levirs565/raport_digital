import { inject } from "vue";
import { trpc } from "./api";
import { TRPCQueryKey } from "@trpc/tanstack-react-query"
import { useQuery } from "@tanstack/vue-query";

export const TRPC_KEY = Symbol()
export const injectTrpc = () => inject<typeof trpc>(TRPC_KEY);

type FixTRPC<T> = {
    queryKey: TRPCQueryKey
  } & Omit<T, "queryKey">

export function useTrcpQuery<T>(options: T) {
    return useQuery(options as FixTRPC<T>)
}