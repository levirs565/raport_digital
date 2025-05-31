<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { idKelas, idProyek } = defineProps({
  idKelas: String,
  idProyek: String
})
const emit = defineEmits(['close'])

const tema = ref("");
const judul = ref("");
const deskripsi = ref("");

const trpc = injectTrpc();
const { mutateAsync: addAsync } = useMutation(trpc!.guru.p5.addProyek.mutationOptions());
const { mutateAsync: updateAsync } = useMutation(trpc!.guru.p5.updateProyek.mutationOptions());

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
function onSubmit() {
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
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>{{ idProyek ? "Ubah" : "Tambah" }} Proyek</v-toolbar-title>
    </v-toolbar>

    <v-form class="px-4 py-2">
      <v-text-field v-model="tema" label="Tema" />
      <v-text-field v-model="judul" label="Judul" />
      <v-textarea v-model="deskripsi" label="Deskripsi" />
      <v-btn @click="onSubmit">{{ idProyek ? "Ubah" : "Tambah" }}</v-btn>
    </v-form>
  </v-card>
</template>
