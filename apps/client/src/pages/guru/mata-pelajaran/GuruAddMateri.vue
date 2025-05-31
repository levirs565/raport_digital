<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { idKelas, idMataPelajaran, idMateri } = defineProps({
  idKelas: String,
  idMataPelajaran: String,
  idMateri: String
})
const emit = defineEmits(['close'])

const namaSingkat = ref("");
const materi = ref("");

const trpc = injectTrpc();
const { mutateAsync: addAsync } = useMutation(trpc!.guru.mataPelajaran.addMateri.mutationOptions())
const { mutateAsync: updateAsync } = useMutation(trpc!.guru.mataPelajaran.updateMateri.mutationOptions());

const { data } = useTrcpQuery(trpc!.guru.mataPelajaran.getMateri.queryOptions({
  id: computed(() => idMateri!)
}, {
  enabled: computed(() => !!idMateri) as unknown as boolean
}))

watchEffect(() => {
  if (data.value) {
    namaSingkat.value = data.value.nama;
    materi.value = data.value.detail;
  }
})

const queryClient = useQueryClient();
const router = useRouter();
function onSubmit() {
  const update = () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.mataPelajaran.getMateriList.queryKey()
    })
    if (idMateri) {
      queryClient.invalidateQueries({
        queryKey: trpc!.guru.mataPelajaran.getMateri.queryKey({
          id: idMateri
        })
      })
    }
  }
  if (!idMateri)
    addAsync({
      id_kelas: idKelas!,
      id_mata_pelajaran: idMataPelajaran!,
      nama: namaSingkat.value,
      detail: materi.value!
    }).then((id) => {
      update();
      router.push(`/guru/mata-pelajaran/${idKelas}/${idMataPelajaran}/materi/${id}`)
    })
  else
    updateAsync({
      id: idMateri,
      nama: namaSingkat.value,
      detail: materi.value!
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
      <v-toolbar-title>{{ idMateri ? "Ubah" : "Tambah" }} Materi</v-toolbar-title>
    </v-toolbar>

    <v-form class="px-4 py-2">
      <v-text-field v-model="namaSingkat" label="Nama Singkat" />
      <v-textarea v-model="materi" label="Materi" />
      <v-btn @click="onSubmit">{{ idMateri ? "Ubah" : "Tambah" }}</v-btn>
    </v-form>
  </v-card>
</template>
