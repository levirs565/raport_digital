<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { idKelas, idSiswa } = defineProps({
  idKelas: String,
  idSiswa: String
})

const catatan = ref("");

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.waliKelas.getCatatanWaliKelas.queryOptions(computed(() => ({
  kelas_id: idKelas!,
  siswa_id: idSiswa!
}))))
const { mutateAsync } = useMutation(trpc!.guru.waliKelas.updateCatatanWaliKelas.mutationOptions());

watchEffect(() => {
  if (data.value) {
    catatan.value = data.value;
  }
})

const queryClient = useQueryClient();
const router = useRouter();
function onSave() {
  if (!idKelas || !idSiswa) return;

  mutateAsync({
    kelas_id: idKelas,
    siswa_id: idSiswa,
    catatan: catatan.value
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.waliKelas.getCatatanWaliKelas.queryKey({
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
    <v-app-bar-title>Ubah Catatan</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-form class="px-4 py-2">
      <v-textarea v-model="catatan" label="Catatan Wali Kelas" />
      <v-btn @click="onSave">Simpan</v-btn>
    </v-form>
  </v-main>
</template>
