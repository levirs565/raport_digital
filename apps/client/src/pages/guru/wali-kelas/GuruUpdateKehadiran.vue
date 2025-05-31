<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { idKelas, idSiswa } = defineProps({
  idKelas: String,
  idSiswa: String
})

const sakit = ref(0);
const izin = ref(0);
const alpha = ref(0);

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.waliKelas.getKehadiran.queryOptions(computed(() => ({
  kelas_id: idKelas!,
  siswa_id: idSiswa!
}))))
const { mutateAsync } = useMutation(trpc!.guru.waliKelas.updateKehadiran.mutationOptions());

watchEffect(() => {
  if (data.value) {
    sakit.value = data.value.sakit_hari;
    izin.value = data.value.izin_hari;
    alpha.value = data.value.alpa_hari;
  }
})

const queryClient = useQueryClient();
const router = useRouter();
function onSave() {
  if (!idKelas || !idSiswa) return;

  mutateAsync({
    kelas_id: idKelas,
    siswa_id: idSiswa,
    sakit_hari: sakit.value,
    izin_hari: izin.value,
    alpa_hari: alpha.value
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.waliKelas.getKehadiran.queryKey({
        kelas_id: idKelas,
        siswa_id: idSiswa
      })
    })
    router.back();
  })
}
</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Ubah Kehadiran</v-app-bar-title>
  </v-app-bar>
  <v-main>
    <v-form class="px-4 py-2">
      <v-number-input v-model="sakit" label="Sakit" />
      <v-number-input v-model="izin" label="Izin" />
      <v-number-input v-model="alpha" label="Alpa" />
      <v-btn @click="onSave">Simpan</v-btn>
    </v-form>
  </v-main>
</template>
