<script setup lang="ts">
import { computed } from 'vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CNilaiMataPelajaranList from '../../../components/CNilaiMataPelajaranList.vue';
import GuruAddMateri from './GuruAddMateri.vue';
import GuruUpdateNilaiMateri from './GuruUpdateNilaiMateri.vue';

const { idMateri } = defineProps({
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

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>{{ data?.nama }}</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-card class="pa-4 ma-4" v-if="data && data.nama != 'PAS'">
      <p>Nama Singkat</p>
      <p>{{ data.nama }}</p>
      <p>Materi</p>
      <p>{{ data.detail }}</p>
      <div class="d-flex justify-end ma-4">
        <v-dialog persistent>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props">Ubah</v-btn>
          </template>
          <template v-slot:default="{ isActive }">
            <guru-add-materi :id-kelas="idKelas" :id-mata-pelajaran="idMataPelajaran" :id-materi="idMateri"
              @close="isActive.value = !isActive.value" />
          </template>
        </v-dialog>
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
