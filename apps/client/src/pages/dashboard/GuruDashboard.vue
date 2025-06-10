<script setup lang="ts">
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../api-vue';
import { usePeriodeStore } from '../../store';

const periodeStore = usePeriodeStore();
const periodeIdComputed = computed(() => periodeStore.selectedPeriode!);

const trpc = injectTrpc();
const { data: waliKelasData } = useTrcpQuery(trpc!.guru.waliKelas.getAll.queryOptions({
  periode_ajar_id: periodeIdComputed
}))
const { data: ekstrakurikulerData } = useTrcpQuery(trpc!.guru.ekstrakurikuler.getAll.queryOptions({
  periode_ajar_id: periodeIdComputed
}))
const { data: mataPelajaranData } = useTrcpQuery(trpc!.guru.mataPelajaran.getAll.queryOptions({
  periode_ajar_id: periodeIdComputed
}))
const { data: p5Data } = useTrcpQuery(trpc!.guru.p5.getAll.queryOptions({
  periode_ajar_id: periodeIdComputed
}))
</script>
<template>
  <template v-if="waliKelasData?.length">
    <v-card v-for="item in waliKelasData" :key="item.id_kelas" :to="`/guru/wali-kelas/${item.id_kelas}`" class="ma-4">
      <v-card-title class="text-subtitle-1 d-flex flex-row justify-space-between">
        Wali Kelas {{ item.kelas }}-{{ item.kode_ruang_kelas }}
        <v-icon>mdi-chevron-right</v-icon></v-card-title>
      <v-card-text class="text-h5 py-0">{{ item.belum_selesai }}</v-card-text>
      <v-card-text class="text-caption pt-0">Raport Belum Selsai</v-card-text>
    </v-card>
    <v-divider />
  </template>
  <v-list>
    <template v-if="ekstrakurikulerData?.length">
      <v-list-subheader class="px-4 font-weight-bold text-black">Ekstrakurikuler</v-list-subheader>
      <v-list-item v-for="item in ekstrakurikulerData" :key="item.id_esktrakurikuler"
        :to="`/guru/ekstrakurikuler/${item.id_esktrakurikuler}`">
        <v-list-item-title>{{ item.nama }}</v-list-item-title>
      </v-list-item>
      <v-divider />
    </template>
    <template v-if="mataPelajaranData?.length">
      <v-list-subheader class="px-4 font-weight-bold text-black">Mata Pelajaran</v-list-subheader>
      <v-list-item v-for="item in mataPelajaranData"
        :key="`${item.kelas.id_kelas}-${item.mata_pelajaran.id_mata_pelajaran}`"
        :to="`/guru/mata-pelajaran/${item.kelas.id_kelas}/${item.mata_pelajaran.id_mata_pelajaran}`">
        <v-list-item-title>Kelas {{ item.kelas.kelas }}-{{ item.kelas.kode_ruang_kelas }} - {{
          item.mata_pelajaran.nama }}</v-list-item-title>
      </v-list-item>
      <v-divider />
    </template>
    <template v-if="p5Data?.length">
      <v-list-subheader class="px-4 font-weight-bold text-black">Koordinator P5</v-list-subheader>
      <v-list-item v-for="item in p5Data" :key="item.id_kelas" :to="`/guru/p5/${item.id_kelas}`">
        <v-list-item-title>Kelas {{ item.kelas }}-{{ item.kode_ruang_kelas }}</v-list-item-title>
      </v-list-item>
      <v-divider />
    </template>
  </v-list>
</template>
