<script setup lang="ts">
import { ref } from 'vue';
import { injectTrpc } from '../../api-vue';
import { useMutation } from '@tanstack/vue-query';
import { SubmitEventPromise } from 'vuetify';
import { formatError } from '../../api';
import { useRules } from 'vuetify/labs/rules';

const emit = defineEmits(['close', 'success'])

const { idKelas, idSiswa } = defineProps({
  idKelas: String,
  idSiswa: String
})

const alasan = ref("");

const trpc = injectTrpc();
const { mutateAsync: verifyAsync, error, isPending, reset } = useMutation(trpc!.kepalaSekolah.verifyRaport.mutationOptions());

async function onSubmit(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    return;
  }
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

const rules = useRules();
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Tolak Raport</v-toolbar-title>
    </v-toolbar>

    <v-form class="px-4 py-2" @submit.prevent="onSubmit">
      <v-textarea :rules="[rules!.required!()]" v-model="alasan" label="Alasan" />
      <v-card-text class="text-error text-center pa-0 my-2" v-if="error">
        {{ formatError(error) }}
      </v-card-text>
      <v-btn class="my-2" type="submit" :loading="isPending">Tolak</v-btn>
    </v-form>
  </v-card>
</template>
