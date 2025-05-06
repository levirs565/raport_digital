import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { Router } from "@raport-digital/client-api-types";

export const trpc = createTRPCClient<Router>({
    links: [
        httpBatchLink({
            url: "/api"
        })
    ]
})