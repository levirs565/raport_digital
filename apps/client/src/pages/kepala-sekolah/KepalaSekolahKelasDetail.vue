<script setup lang="ts">
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../api-vue';
import CAppBarHamburger from '../../components/CAppBarHamburger.vue';

const { idKelas } = defineProps({
  idKelas: String
})
const idComputed = computed(() => idKelas!)

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.kepalaSekolah.getKelas.queryOptions({
  kelas_id: idComputed
}))
const { data: anggotaData } = useTrcpQuery(trpc!.kepalaSekolah.getAllAnggotaKelas.queryOptions({
  kelas_id: idComputed
}))
</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Kelas {{ data?.kelas }}-{{ data?.kode_ruang_kelas }}</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-list v-if="anggotaData">
      <template v-for="item in anggotaData" :key="item.id_siswa">
        <v-list-item :to="`/kepala-sekolah/kelas/${idKelas}/${item.id_siswa}`">
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
  </v-main>
</template>
