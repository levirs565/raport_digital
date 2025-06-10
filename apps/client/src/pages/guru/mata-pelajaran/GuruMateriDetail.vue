<script setup lang="ts">
import { computed } from 'vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CNilaiMataPelajaranList from '../../../components/CNilaiMataPelajaranList.vue';
import GuruAddMateri from './GuruAddMateri.vue';
import GuruUpdateNilaiMateri from './GuruUpdateNilaiMateri.vue';
import { useRouter } from 'vue-router';
import { useSnackbarStore } from '../../../store';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { formatError } from '../../../api';

const { idMateri, idKelas, idMataPelajaran } = defineProps({
  idKelas: String,
  idMataPelajaran: String,
  idMateri: String
})

const trpc = injectTrpc();

const idMateriComputed = computed(() => idMateri!)
const { data } = useTrcpQuery(trpc!.guru.mataPelajaran.getMateri.queryOptions({
  id: idMateriComputed
}))
const { data: nilaiData } = useTrcpQuery(trpc!.guru.mataPelajaran.getNilaiMateri.queryOptions({
  id: idMateriComputed
}))
const { mutateAsync: deleteAsync } = useMutation(trpc!.guru.mataPelajaran.deleteMateri.mutationOptions())

const router = useRouter();
const snackbar = useSnackbarStore();
const queryClient = useQueryClient();
function onDelete() {
  deleteAsync({
    id: idMateri!
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc?.guru.mataPelajaran.getMateriList.queryKey({
        id_kelas: idKelas
      })
    })
    router.replace(`/guru/mata-pelajaran/${idKelas}/${idMataPelajaran}`)
  }).catch(e => {
    snackbar.errors.push(formatError(e));
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>{{ data?.nama }}</v-app-bar-title>
    <v-dialog v-if="data?.nama != 'PAS'">
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn icon v-bind="activatorProps">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
      <template v-slot:default="{ isActive }">
        <v-card title="Konfirmasi Hapus">
          <v-card-text>
            Apakah anda yakin menghapus Materi ini?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text="Batal" @click="isActive.value = false"></v-btn>
            <v-btn text="Hapus" color="red" @click="() => {
              isActive.value = false
              onDelete();
            }"></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-app-bar>

  <v-main>
    <v-card class="pa-4 ma-4" v-if="data && data.nama != 'PAS'">
      <p>Nama Singkat</p>
      <p>{{ data.nama }}</p>
      <p>Materi</p>
      <p>{{ data.detail }}</p>
      <div class="d-flex justify-end ma-4">
        <v-dialog persistent v-if="!data.is_locked">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props">Ubah</v-btn>
          </template>
          <template v-slot:default="{ isActive }">
            <guru-add-materi :id-kelas="idKelas" :id-mata-pelajaran="idMataPelajaran" :id-materi="idMateri"
              @close="isActive.value = !isActive.value" />
          </template>
        </v-dialog>
        <p v-else>
          <v-icon size="small" class="mr-2">mdi-lock</v-icon>
          <span>Dikunci</span>
        </p>
      </div>
    </v-card>

    <p class="mx-4 pt-2">Nilai</p>
    <c-nilai-mata-pelajaran-list :data="nilaiData" />

    <v-dialog persistent fullscreen>
      <template v-slot:activator="{ props }">
        <v-fab icon="mdi-playlist-edit" app v-bind="props" />
      </template>
      <template v-slot:default="{ isActive }">
        <guru-update-nilai-materi :id-kelas="idKelas" :id-mata-pelajaran="idMataPelajaran" :id-materi="idMateri"
          @close="isActive.value = !isActive.value" />
      </template>
    </v-dialog>
  </v-main>
</template>
