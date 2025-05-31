<script setup lang="ts">
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { NilaiP5Type } from '@raport-digital/client-api-types';

const { idTarget } = defineProps({
  idKelas: String,
  idProyek: String,
  idTarget: String
})

const idTargetComputed = computed(() => idTarget!)

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.p5.getTarget.queryOptions({
  id_target: idTargetComputed
}))

const { data: nilaiData } = useTrcpQuery(trpc!.guru.p5.getNilaiTarget.queryOptions({
  id_target: idTargetComputed
}))

const nilaiMap: Record<NilaiP5Type, string> = {
  MULAI_BERKEMBANG: 'Mulai Berkembang',
  SEDANG_BERKEMBANG: 'Sedang Berkembang',
  BERKEMBANG_SESUAI_HARAPAN: 'Berkembang Sesuai Harapan',
  SANGAT_BERKEMBANG: 'Sangat Berkembang'
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>{{ data?.target }}</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-card class="mx-4 my-2 pa-4" v-if="data">
      <p>Dimensi</p>
      <p>{{ data.dimensi }}</p>
      <p>Elemen</p>
      <p>{{ data.elemen }}</p>
      <p>Subelemen</p>
      <p>{{ data.subelemen }}</p>
      <p>Target</p>
      <p>{{ data.target }}</p>
      <div class="d-flex justify-end">
        <v-btn :to="`/guru/p5/${idKelas}/proyek/${idProyek}/target/${idTarget}/edit`">Ubah</v-btn>
      </div>
    </v-card>

    <p class="mx-4 mt-4">Nilai</p>
    <v-list v-if="nilaiData">
      <template v-for="item in nilaiData" :key="item.id_siswa">
        <v-list-item>
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
          <template v-slot:append>
            <p>{{ item.nilai ? nilaiMap[item.nilai] : "-" }}</p>
          </template>
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
  </v-main>

  <v-fab icon="mdi-playlist-edit" app :to="`/guru/p5/${idKelas}/proyek/${idProyek}/target/${idTarget}/nilai`" />
</template>
