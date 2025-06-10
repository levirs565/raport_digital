<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { formatError } from '../../../api';
import { useRules } from 'vuetify/labs/rules';
import { SubmitEventPromise } from 'vuetify';

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
const { mutateAsync, error, isPending, reset } = useMutation(trpc!.guru.waliKelas.updateKehadiran.mutationOptions());

watchEffect(() => {
  if (data.value) {
    sakit.value = data.value.sakit_hari;
    izin.value = data.value.izin_hari;
    alpha.value = data.value.alpa_hari;
  }
})

const queryClient = useQueryClient();
async function onSave(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    return;
  }
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

const rules = useRules();
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Ubah Kehadiran</v-toolbar-title>
    </v-toolbar>
    <v-form class="pa-4" @submit.prevent="onSave">
      <v-number-input :rules="[rules!.required!()]" v-model="sakit" label="Sakit" />
      <v-number-input :rules="[rules!.required!()]" v-model="izin" label="Izin" />
      <v-number-input :rules="[rules!.required!()]" v-model="alpha" label="Alpa" />
      <v-card-text class="text-error text-center pa-0 my-2" v-if="error">
        {{ formatError(error) }}
      </v-card-text>
      <v-btn class="my-2" type="submit" :loading="isPending">Simpan</v-btn>
    </v-form>
  </v-card>
</template>
