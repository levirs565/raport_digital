<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { APP_BAR_TOGGLE_KEY } from '../components/CAppBarHarmbugerKey';
import { injectTrpc, useTrcpQuery } from '../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { UserType } from '@raport-digital/client-api-types';

const trpc = injectTrpc();
const queryClient = useQueryClient();
const { data } = useTrcpQuery(trpc!.auth.state.queryOptions());
const authKey = trpc!.auth.state.queryKey();
const { mutateAsync: logout } = useMutation(
  trpc!.auth.logout.mutationOptions()
);

const drawer = ref<boolean | null>(null);

provide(APP_BAR_TOGGLE_KEY, () => {
  drawer.value = !drawer.value;
});

function onLogout() {
  logout().then(() => {
    queryClient.invalidateQueries({
      queryKey: authKey,
    });
  });
}

const userRoleMap: Record<UserType, string> = {
  GURU: 'Guru',
  KEPALA_SEKOLAH: 'Kepala Sekolah',
  OPERATOR: 'Operator',
};

const accountTitle = computed(() =>
  data.value?.type == 'OPERATOR' ? 'Operator' : data.value?.namaLengkap
);
const accountSubtitle = computed(() => userRoleMap[data.value!.type]);
</script>
<template>
  <v-navigation-drawer v-model="drawer">
    <v-list-item :title="accountTitle" :subtitle="accountSubtitle" />
    <v-divider />
    <v-list-item title="Verifikasi Akun Guru" to="/operator/akun-guru"></v-list-item>
    <v-list-item title="Logout" @click="onLogout" />
  </v-navigation-drawer>
  <router-view />
</template>
