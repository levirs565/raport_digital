import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  isNonJsonSerializable,
  splitLink,
} from '@trpc/client';
import type { Router } from '@raport-digital/client-api-types';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { QueryClient } from '@tanstack/vue-query';
import superjson from 'superjson';

export const queryClient = new QueryClient();
const trpcClient = createTRPCClient<Router>({
  links: [
    splitLink({
      condition: (op) => isNonJsonSerializable(op.input),
      true: httpLink({
        url: '/api',
        transformer: {
          serialize: (data: any) => data,
          deserialize: superjson.deserialize,
        },
      }),
      false: httpBatchLink({
        url: '/api',
        transformer: superjson,
      }),
    }),
  ],
});
export const trpc = createTRPCOptionsProxy<Router>({
  client: trpcClient,
  queryClient,
});

export function formatError(error: any) {
  return error.message;
}
