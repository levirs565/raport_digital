<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { useRules } from 'vuetify/labs/rules';
import { formatError } from '../../../api';
import { SubmitEventPromise } from 'vuetify';

const { idKelas, idProyek } = defineProps({
  idKelas: String,
  idProyek: String
})
const emit = defineEmits(['close'])

const tema = ref("");
const judul = ref("");
const deskripsi = ref("");

const trpc = injectTrpc();
const { mutateAsync: addAsync, error, isPending, reset } = useMutation(trpc!.guru.p5.addProyek.mutationOptions());
const { mutateAsync: updateAsync, error: updateError, isPending: updateIsPending, reset: updateReset } = useMutation(trpc!.guru.p5.updateProyek.mutationOptions());

const { data } = useTrcpQuery(trpc!.guru.p5.getProyek.queryOptions({
  id_proyek: computed(() => idProyek!)
}, {
  enabled: computed(() => !!idProyek) as unknown as boolean
}))

watchEffect(() => {
  if (data.value) {
    tema.value = data.value.tema;
    judul.value = data.value.judul;
    deskripsi.value = data.value.deskripsi;
  }
})

const queryClient = useQueryClient();
const router = useRouter();
async function onSubmit(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    updateReset();
    return;
  }
  if (!idKelas) return;

  const update = () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.p5.getProyekList.queryKey({
        id_kelas: idKelas!
      })
    })
    if (idProyek) {
      queryClient.invalidateQueries({
        queryKey: trpc!.guru.p5.getProyek.queryKey({
          id_proyek: idProyek!
        })
      })
    }
  }

  if (!idProyek)
    addAsync({
      id_kelas: idKelas,
      tema: tema.value,
      judul: judul.value,
      deskripsi: deskripsi.value
    }).then((id) => {
      update();
      router.push(`/guru/p5/${idKelas}/proyek/${id}`)
    })
  else
    updateAsync({
      id_proyek: idProyek,
      tema: tema.value,
      judul: judul.value,
      deskripsi: deskripsi.value
    }).then(() => {
      update();
      emit('close');
    })
}

const rules = useRules()
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>{{ idProyek ? "Ubah" : "Tambah" }} Proyek</v-toolbar-title>
    </v-toolbar>

    <v-form @submit.prevent="onSubmit" class="px-4 py-2">
      <v-text-field :rules="[rules!.required!()]" v-model="tema" label="Tema" />
      <v-text-field :rules="[rules!.required!()]" v-model="judul" label="Judul" />
      <v-textarea :rules="[rules!.required!()]" v-model="deskripsi" label="Deskripsi" />
      <v-card-text class="text-error text-center pa-0 my-2" v-if="idProyek ? updateError : error">{{
        formatError(idProyek ?
          updateError : error) }}</v-card-text>
      <v-btn class="my-2" type="submit" :loading="idProyek ? updateIsPending : isPending">{{ idProyek ? "Ubah" :
        "Tambah" }}</v-btn>
    </v-form>
  </v-card>
</template>
