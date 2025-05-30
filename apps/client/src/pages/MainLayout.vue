<script setup lang="ts">
import { computed, provide, ref, watchEffect } from 'vue';
import { APP_BAR_TOGGLE_KEY } from '../components/CAppBarHarmbugerKey';
import { injectTrpc, useTrcpQuery } from '../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { UserType } from '@raport-digital/client-api-types';
import { usePeriodeStore } from '../store';

const trpc = injectTrpc();
const queryClient = useQueryClient();
const { data } = useTrcpQuery(trpc!.auth.state.queryOptions());
const authKey = trpc!.auth.state.queryKey();
const { mutateAsync: logout } = useMutation(
  trpc!.auth.logout.mutationOptions()
);

const { data: periodeData } = useTrcpQuery(trpc!.common.getAllPeriodeAjar.queryOptions());
const periodeSelectItems = computed(() => {
  if (periodeData.value) {
    return periodeData.value.map((periode) => ({
      ...periode,
      title: `${periode.tahunAjar}/${periode.tahunAjar + 1} ${periode.semester == "GANJIL" ? "Ganjil" : "Genap"}`
    }))
  }

  return []
})
const periodeStore = usePeriodeStore();

watchEffect(() => {
  if (!periodeStore.selectedPeriode && (periodeData.value?.length ?? 0 > 0)) {
    periodeStore.selectedPeriode = periodeData.value?.at(0)?.id_periode_ajar
  }
})

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
    <v-list-item title="Dashboard" to="/" exact></v-list-item>
    <v-list-item title="Verifikasi Akun Guru" to="/operator/akun-guru"></v-list-item>
    <v-list-item title="Siswa" to="/operator/siswa"></v-list-item>
    <v-list-item title="Periode Ajar" to="/operator/periode" />
    <v-select v-model="periodeStore.selectedPeriode" :items="periodeSelectItems" item-value="id_periode_ajar"
      item-title="title" />
    <v-list-item title="Mata Pelajaran" to="/operator/mata-pelajaran" />
    <v-list-item title="Ekstrakurikuler" to="/operator/ekstrakurikuler" />
    <v-list-item title="Kelas" to="/operator/kelas"/>
    <v-list-item title="Logout" @click="onLogout" />
  </v-navigation-drawer>
  <router-view />
</template>
