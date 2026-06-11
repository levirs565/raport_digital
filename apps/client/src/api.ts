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

export async function login(username: string, password: string) {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  return response.json();
}

export async function logout() {
  const response = await fetch('/auth/logout', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Logout failed');
  }
  return response.json();
}

export function formatError(error: any): string {
  return error.message as any;
}
