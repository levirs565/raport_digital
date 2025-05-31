<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const { idKelas, idSiswa } = defineProps({
  idKelas: String,
  idSiswa: String
})
const emit = defineEmits(['close'])

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
    emit('close')
  })
}
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Ubah Kehadiran</v-toolbar-title>
    </v-toolbar>
    <v-form class="pa-4">
      <v-number-input v-model="sakit" label="Sakit" />
      <v-number-input v-model="izin" label="Izin" />
      <v-number-input v-model="alpha" label="Alpa" />
      <v-btn @click="onSave">Simpan</v-btn>
    </v-form>
  </v-card>
</template>
