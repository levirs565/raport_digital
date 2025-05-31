<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const { idKelas, idSiswa } = defineProps({
  idKelas: String,
  idSiswa: String
})
const emit = defineEmits(['close'])

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
    emit('close')
  })
}
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Ubah Catatan</v-toolbar-title>
    </v-toolbar>

    <v-form class="pa-4">
      <v-textarea v-model="catatan" label="Catatan Wali Kelas" />
      <v-btn @click="onSave">Simpan</v-btn>
    </v-form>
  </v-card>
</template>
