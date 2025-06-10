<script lang="ts" setup>
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../api-vue';
import { usePeriodeStore } from '../../store';

const periodeStore = usePeriodeStore();
const periodeIdComputed = computed(() => periodeStore.selectedPeriode!);

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.kepalaSekolah.getAllKelas.queryOptions({
  periode_ajar_id: periodeIdComputed
}))
</script>
<template>
  <v-list>
    <v-list-subheader class="px-4 font-weight-bold pb-4 text-black" style="min-height: 0;">Verifikasi Raport Siswa</v-list-subheader>
    <v-list-item prepend-icon="mdi-folder-outline" v-for="item in data" :key="item.id_kelas"
      :to="`/kepala-sekolah/kelas/${item.id_kelas}`">
      <v-list-item-title>Kelas {{ item.kelas }}-{{ item.kode_ruang_kelas }}</v-list-item-title>
      <v-list-item-subtitle>{{  item.menunggu_verifikasi_count == 0 ? "Selesai diverifikasi" : `${item.menunggu_verifikasi_count} menunggu verifikasi`  }}</v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>
