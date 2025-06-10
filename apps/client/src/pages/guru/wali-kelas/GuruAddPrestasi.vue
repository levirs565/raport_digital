<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { formatError } from '../../../api';
import { useRules } from 'vuetify/labs/rules';
import { SubmitEventPromise } from 'vuetify';

const { idKelas, idSiswa, idPrestasi } = defineProps({
  idKelas: String,
  idSiswa: String,
  idPrestasi: String
})
const emit = defineEmits(['close'])

const nama = ref("");
const keterangan = ref("");

const trpc = injectTrpc();
const { mutateAsync: addAsync, error, isPending, reset } = useMutation(trpc!.guru.waliKelas.addPrestasi.mutationOptions());
const { mutateAsync: updateAsync, error: updateError, isPending: updateIsPending, reset: updateReset } = useMutation(trpc!.guru.waliKelas.updatePrestasi.mutationOptions());
const { data } = useTrcpQuery(trpc!.guru.waliKelas.getPrestasi.queryOptions({
  kelas_id: computed(() => idKelas!),
  prestasi_id: computed(() => idPrestasi!)
}, {
  enabled: computed(() => !!idPrestasi) as unknown as boolean
}))

watchEffect(() => {
  if (data.value) {
    nama.value = data.value.jenis;
    keterangan.value = data.value.keterangan;
  }
})

const queryClient = useQueryClient();
async function onSubmit(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    updateReset();
    return;
  }

  if (!idKelas || !idSiswa) return;
  const update = () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.waliKelas.getAllPrestasi.queryKey({
        kelas_id: idKelas,
        siswa_id: idSiswa
      })
    })
    if (idPrestasi) {
      queryClient.invalidateQueries({
        queryKey: trpc!.guru.waliKelas.getPrestasi.queryKey({
          kelas_id: idKelas,
          prestasi_id: idPrestasi
        })
      })
    }
  }
  if (!idPrestasi)
    addAsync({
      jenis: nama.value,
      keterangan: keterangan.value,
      kelas_id: idKelas,
      siswa_id: idSiswa
    }).then(() => {
      update();
      emit('close');
    });
  else updateAsync({
    jenis: nama.value,
    keterangan: keterangan.value,
    kelas_id: idKelas,
    prestasi_id: idPrestasi
  }).then(() => {
    update();
    emit('close');
  });
}

const rules = useRules();
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>{{ idPrestasi ? "Ubah" : "Tambah" }} Prestasi</v-toolbar-title>
    </v-toolbar>

    <v-form class="px-4 py-2" @submit.prevent="onSubmit">
      <v-text-field :rules="[rules!.required!()]" v-model="nama" label="Nama Prestasi" />
      <v-textarea :rules="[rules!.required!()]" v-model="keterangan" label="Keterangan" />
      <v-card-text :rules="[rules!.required!()]" class="text-error text-center pa-0 my-2"
        v-if="idPrestasi ? updateError : error">{{ formatError(idPrestasi ?
          updateError : error) }}</v-card-text>
      <v-btn class="my-2" type="submit" :loading="idPrestasi ? updateIsPending : isPending">{{ idPrestasi ? "Ubah" :
        "Tambah" }}</v-btn>
    </v-form>
  </v-card>
</template>
