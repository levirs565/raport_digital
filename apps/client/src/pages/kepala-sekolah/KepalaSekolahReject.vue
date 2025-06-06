<script setup lang="ts">
import { ref } from 'vue';
import { injectTrpc } from '../../api-vue';
import { useMutation } from '@tanstack/vue-query';

const emit = defineEmits(['close', 'success'])

const { idKelas, idSiswa } = defineProps({
  idKelas: String,
  idSiswa: String
})

const alasan = ref("");

const trpc = injectTrpc();
const { mutateAsync: verifyAsync } = useMutation(trpc!.kepalaSekolah.verifyRaport.mutationOptions());

function onSubmit() {
  if (!alasan.value) return;

  verifyAsync({
    kelas_id: idKelas!,
    siswa_id: idSiswa!,
    status: {
      is_verified: false,
      reason: alasan.value
    }
  }).then(() => {
    emit('success');
  })
}

</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Tolak Raport</v-toolbar-title>
    </v-toolbar>

    <v-form class="px-4 py-2">
      <v-textarea v-model="alasan" label="Alasan" />
      <v-btn @click="onSubmit">Tolak</v-btn>
    </v-form>
  </v-card>
</template>
