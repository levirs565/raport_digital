<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { idKelas, idSiswa, idPrestasi } = defineProps({
  idKelas: String,
  idSiswa: String,
  idPrestasi: String
})

const nama = ref("");
const keterangan = ref("");

const trpc = injectTrpc();
const { mutateAsync: addAsync } = useMutation(trpc!.guru.waliKelas.addPrestasi.mutationOptions());
const { mutateAsync: updateAsync } = useMutation(trpc!.guru.waliKelas.updatePrestasi.mutationOptions());
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
const router = useRouter();
function onSubmit() {
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
      router.back();
    });
  else updateAsync({
    jenis: nama.value,
    keterangan: keterangan.value,
    kelas_id: idKelas,
    prestasi_id: idPrestasi
  }).then(() => {
    update();
    router.back();
  });
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>{{ idPrestasi ? "Ubah" : "Tambah" }} Prestasi</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-form class="px-4 py-2">
      <v-text-field v-model="nama" label="Nama Prestasi" />
      <v-textarea v-model="keterangan" label="Keterangan" />
      <v-btn @click="onSubmit">{{ idPrestasi ? "Ubah" : "Tambah" }}</v-btn>
    </v-form>
  </v-main>
</template>
