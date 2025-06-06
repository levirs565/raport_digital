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

const periodeIdComputed = computed(() => periodeStore.selectedPeriode!);
const enabledGuru = computed(() => data.value?.type == "GURU" && !!periodeStore.selectedPeriode)
const { data: waliKelasData } = useTrcpQuery(trpc!.guru.waliKelas.getAll.queryOptions({
  periode_ajar_id: periodeIdComputed
}, {
  enabled: enabledGuru as unknown as boolean
}))
const { data: ekstrakurikulerData } = useTrcpQuery(trpc!.guru.ekstrakurikuler.getAll.queryOptions({
  periode_ajar_id: periodeIdComputed
}, {
  enabled: enabledGuru as unknown as boolean
}))
const { data: mataPelajaranData } = useTrcpQuery(trpc!.guru.mataPelajaran.getAll.queryOptions({
  periode_ajar_id: periodeIdComputed
}, {
  enabled: enabledGuru as unknown as boolean
}))
const { data: p5Data } = useTrcpQuery(trpc!.guru.p5.getAll.queryOptions({
  periode_ajar_id: periodeIdComputed
}, {
  enabled: enabledGuru as unknown as boolean
}))
const { data: kepalaSekolahKelasData } = useTrcpQuery(trpc!.kepalaSekolah.getAllKelas.queryOptions({
  periode_ajar_id: periodeIdComputed
}, {
  enabled: computed(() => data.value?.type == "KEPALA_SEKOLAH") as unknown as boolean
}))

</script>
<template>
  <v-navigation-drawer v-model="drawer">
    <v-list-item :title="accountTitle" :subtitle="accountSubtitle" />
    <template v-if="data?.type == 'OPERATOR'">
      <v-divider />
      <v-list-item title="Dashboard" to="/" exact></v-list-item>
      <v-list-item title="Verifikasi Akun Guru" to="/operator/akun-guru"></v-list-item>
      <v-list-item title="Siswa" to="/operator/siswa"></v-list-item>
      <v-list-item title="Periode Ajar" to="/operator/periode" />
      <v-divider />
    </template>
    <v-select v-model="periodeStore.selectedPeriode" :items="periodeSelectItems" item-value="id_periode_ajar"
      item-title="title" variant="underlined" class="mx-4" />
    <template v-if="data?.type == 'OPERATOR'">
      <v-list-item title="Mata Pelajaran" to="/operator/mata-pelajaran" />
      <v-list-item title="Ekstrakurikuler" to="/operator/ekstrakurikuler" />
      <v-list-item title="Kelas" to="/operator/kelas" />
    </template>
    <template v-if="data?.type == 'GURU'">
      <v-divider />
      <template v-if="waliKelasData?.length">
        <v-list-subheader class="px-4">Wali Kelas</v-list-subheader>
        <v-list-item v-for="item in waliKelasData" :key="item.id_kelas" :to="`/guru/wali-kelas/${item.id_kelas}`">
          <v-list-item-title>Kelas {{ item.kelas }}-{{ item.kode_ruang_kelas }}</v-list-item-title>
        </v-list-item>
      </template>
      <template v-if="ekstrakurikulerData?.length">
        <v-list-subheader class="px-4">Ekstrakurikuler</v-list-subheader>
        <v-list-item v-for="item in ekstrakurikulerData" :key="item.id_esktrakurikuler"
          :to="`/guru/ekstrakurikuler/${item.id_esktrakurikuler}`">
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
        </v-list-item>
      </template>
      <template v-if="mataPelajaranData?.length">
        <v-list-subheader class="px-4">Mata Pelajaran</v-list-subheader>
        <v-list-item v-for="item in mataPelajaranData"
          :key="`${item.kelas.id_kelas}-${item.mata_pelajaran.id_mata_pelajaran}`"
          :to="`/guru/mata-pelajaran/${item.kelas.id_kelas}/${item.mata_pelajaran.id_mata_pelajaran}`">
          <v-list-item-title>Kelas {{ item.kelas.kelas }}-{{ item.kelas.kode_ruang_kelas }} - {{
            item.mata_pelajaran.nama }}</v-list-item-title>
        </v-list-item>
      </template>
      <template v-if="p5Data?.length">
        <v-list-subheader class="px-4">Koordinator P5</v-list-subheader>
        <v-list-item v-for="item in p5Data" :key="item.id_kelas" :to="`/guru/p5/${item.id_kelas}`">
          <v-list-item-title>Kelas {{ item.kelas }}-{{ item.kode_ruang_kelas }}</v-list-item-title>
        </v-list-item>
      </template>
    </template>
    <template v-if="data?.type == 'KEPALA_SEKOLAH'">
      <v-divider />
      <v-list-subheader class="px-4">Verifikasi Raport Siswa</v-list-subheader>
      <v-list-item v-for="item in kepalaSekolahKelasData" :key="item.id_kelas"
        :to="`/kepala-sekolah/kelas/${item.id_kelas}`">
        <v-list-item-title>Kelas {{ item.kelas }}-{{ item.kode_ruang_kelas }}</v-list-item-title>
      </v-list-item>
    </template>
    <v-divider />
    <v-list-item title="Logout" @click="onLogout" />
  </v-navigation-drawer>
  <router-view />
</template>
