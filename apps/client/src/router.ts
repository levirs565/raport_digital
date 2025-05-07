import { createRouter, createWebHistory, RouteLocation, type RouteRecordRaw } from "vue-router";
import { UserRole } from "@raport-digital/client-api-types";
import Login from "./pages/auth/Login.vue";
import MainLayout from "./pages/MainLayout.vue";
import { injectQueryClient, injectTrpc } from "./api-vue";


declare module 'vue-router' {
    interface RouteMeta {
        userRole: UserRole | "NOT-LOGGED" | "LOGGED" | null
    }
}

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        component: Login,
        meta: {
            userRole: "NOT-LOGGED"
        }
    },
    {
        path: '/',
        component: MainLayout,
        meta: {
            userRole: "LOGGED"
        }
    }
]

export const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

export function validateUserRole(route: RouteLocation, role: UserRole | undefined) {
    if (route.meta.userRole == null) return true;

    if (route.meta.userRole == "NOT-LOGGED") {
        if (role)
            return {
                path: "/"
            }
        return true;
    }
    if (!role) {
        return {
            path: "/login"
        }
    }

    if (route.meta.userRole != "LOGGED" && route.meta.userRole != role) {
        return {
            path: "/"
        }
    }

    return true;
}

router.beforeEach(async (route) => {
    if (route.meta.userRole == null) return true;

    const queryClient = injectQueryClient();
    const trpc = injectTrpc();

    let currentRole: UserRole | undefined = undefined
    while (true) {
        try {
            const data = await queryClient!.fetchQuery(trpc!.auth.state.queryOptions())
            currentRole = data?.type
            break;
        } catch (error) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }

    return validateUserRole(route, currentRole)
})