<script setup lang="ts">
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../api-vue';
import { usePeriodeStore } from '../../store';
import { getPeriodeTitle } from '../../utils';

const periodeStore = usePeriodeStore();
const periodeIdComputed = computed(() => periodeStore.selectedPeriode!);
const hasPeriodeAjar = computed(() => !!periodeStore.selectedPeriode)
const trpc = injectTrpc();

const { data: unverifiedCount } = useTrcpQuery(trpc!.operator.guru.countUnverified.queryOptions())
const { data: lastPeriode } = useTrcpQuery(trpc!.operator.periodeAjar.getLatest.queryOptions())
const { data: siswaCount } = useTrcpQuery(trpc!.operator.siswa.count.queryOptions())
const { data: mataPelajaranCount } = useTrcpQuery(trpc!.operator.mataPelajaran.count.queryOptions({
  periodeAjarId: periodeIdComputed
}, {
  enabled: hasPeriodeAjar as unknown as boolean
}))
const { data: ekstrakurikulerCount } = useTrcpQuery(trpc!.operator.ekstrakurikuler.count.queryOptions({
  periodeAjarId: periodeIdComputed
}, {
  enabled: hasPeriodeAjar as unknown as boolean
}))
const { data: kelasCount } = useTrcpQuery(trpc!.operator.kelas.count.queryOptions({
  periode_ajar_id: periodeIdComputed
}, {
  enabled: hasPeriodeAjar as unknown as boolean
}))

</script>
<template>
  <v-card :to="`/operator/akun-guru`" class="ma-4">
    <v-card-title class="text-subtitle-1 d-flex flex-row justify-space-between">
      Verifikasi Akun Guru
      <v-icon>mdi-chevron-right</v-icon></v-card-title>
    <v-card-text class="text-h5 py-0">{{ unverifiedCount }}</v-card-text>
    <v-card-text class="text-caption pt-0">Guru Belum Diverifikasi</v-card-text>
  </v-card>
  <v-card :to="`/operator/periode`" class="ma-4">
    <v-card-title class="text-subtitle-1 d-flex flex-row justify-space-between">
      Periode Ajar
      <v-icon>mdi-chevron-right</v-icon></v-card-title>
    <v-card-text class="text-h5 py-0">{{ lastPeriode ? getPeriodeTitle(lastPeriode) : "" }}</v-card-text>
    <v-card-text class="text-caption pt-0">Periode Ajar Terakhir</v-card-text>
  </v-card>
  <div class="d-flex flex-row ma-4 ga-4">
    <v-card :to="`/operator/siswa`" class="flex-grow-1 basis-0">
      <v-card-title class="text-subtitle-1 d-flex flex-row justify-space-between">
        Siswa
        <v-icon>mdi-chevron-right</v-icon></v-card-title>
      <v-card-text class="text-caption py-0">Jumlah Siswa</v-card-text>
      <v-card-text class="text-h5 pt-0">{{ siswaCount }}</v-card-text>
    </v-card>
    <v-card v-if="hasPeriodeAjar" :to="`/operator/mata-pelajaran`" class="flex-grow-1 basis-0">
      <v-card-title class="text-subtitle-1 d-flex flex-row justify-space-between">
        Mata Pelajaran
        <v-icon>mdi-chevron-right</v-icon></v-card-title>
      <v-card-text class="text-caption py-0">Jumlah Mata Pelajaran</v-card-text>
      <v-card-text class="text-h5 pt-0">{{ mataPelajaranCount }}</v-card-text>
    </v-card>
  </div>

  <div class="d-flex flex-row ma-4 ga-4" v-if="hasPeriodeAjar">
    <v-card :to="`/operator/ekstrakurikuler`" class="flex-grow-1 basis-0">
      <v-card-title class="text-subtitle-1 d-flex flex-row justify-space-between">
        Ekstrakurikuler
        <v-icon>mdi-chevron-right</v-icon></v-card-title>
      <v-card-text class="text-caption py-0">Jumlah Ekstrakurikuler</v-card-text>
      <v-card-text class="text-h5 pt-0">{{ ekstrakurikulerCount }}</v-card-text>
    </v-card>
    <v-card :to="`/operator/kelas`" class="flex-grow-1 basis-0">
      <v-card-title class="text-subtitle-1 d-flex flex-row justify-space-between">
        Kelas
        <v-icon>mdi-chevron-right</v-icon></v-card-title>
      <v-card-text class="text-caption py-0">Jumlah Kelas</v-card-text>
      <v-card-text class="text-h5 pt-0">{{ kelasCount }}</v-card-text>
    </v-card>
  </div>
</template>
<style lang="css" scoped>
.basis-0 {
  flex-basis: 0;
}
</style>
