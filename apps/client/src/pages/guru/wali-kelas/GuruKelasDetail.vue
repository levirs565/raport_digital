<script setup lang="ts">
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';

const { idKelas } = defineProps({
  idKelas: String
})

const trpc = injectTrpc();
const idKelasComputed = computed(() => idKelas!)
const { data } = useTrcpQuery(trpc!.guru.waliKelas.get.queryOptions({
  kelas_id: idKelasComputed
}))
const { data: anggotaData } = useTrcpQuery(trpc!.guru.waliKelas.getAllAnggota.queryOptions({
  kelas_id: idKelasComputed
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
        <v-list-item :to="`/guru/wali-kelas/${idKelas}/${item.id_siswa}`">
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
  </v-main>
</template>
