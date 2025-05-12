import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { Router } from "@raport-digital/client-api-types";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { QueryClient } from "@tanstack/vue-query";
import superjson from "superjson";

export const queryClient = new QueryClient()
const trpcClient = createTRPCClient<Router>({
    links: [
        httpBatchLink({
            url: "/api",
            transformer: superjson
        })
    ]
})
export const trpc = createTRPCOptionsProxy<Router>({
    client: trpcClient,
    queryClient
})