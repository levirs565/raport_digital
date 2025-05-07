<script setup lang="ts">
import { provide, ref } from 'vue';
import { APP_BAR_TOGGLE_KEY } from '../components/CAppBarHarmbugerKey';
import { injectTrpc, useTrcpQuery } from '../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const trpc = injectTrpc();
const queryClient = useQueryClient();
const { data } = useTrcpQuery(trpc!.auth.state.queryOptions());
const authKey = trpc!.auth.state.queryKey();
const { mutateAsync: logout } = useMutation(trpc!.auth.logout.mutationOptions());

const drawer = ref<boolean | null>(null);

provide(APP_BAR_TOGGLE_KEY, () => {
    drawer.value = !drawer.value;
})

function onLogout() {
    logout().then(() => {
        queryClient.invalidateQueries({
            queryKey: authKey
        })
    })
}
</script>
<template>
    <v-navigation-drawer v-model="drawer">
        <v-list-item :title="data?.username" :subtitle="data?.type"/>
        <v-divider/>
        <v-list-item title="Logout" @click="onLogout"/>
    </v-navigation-drawer>

    <router-view />
</template>