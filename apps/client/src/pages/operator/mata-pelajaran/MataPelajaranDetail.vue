<script setup lang="ts">
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';

const { id } = defineProps({
  id: String
});

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.mataPelajaran.get.queryOptions({
  id: id!
}))


</script>
<template>
  <v-app-bar>
    <CAppBarHamburger />
    <v-app-bar-title>Detail Mata Pelajaran</v-app-bar-title>
    <v-btn icon :to="`/operator/mata-pelajaran/${data?.id_mata_pelajaran}/edit`">
      <v-icon>mdi-pencil</v-icon>
    </v-btn>
  </v-app-bar>

  <v-main v-if="data">
    <div class="px-4 pt-2">
      <p>Nama Mata Pelajaran</p>
      <p>{{ data.nama }}</p>
      <p>Kelompok Mata Pelajaran</p>
      <p>{{ data.kelompok_mapel ?? "-" }}</p>
      <p>Guru Pengampu</p>
    </div>
    <v-list>
      <template v-for="item in data.guru" :key="item.username">
        <v-list-item>
          <v-list-item-title>{{ item.nama_lengkap }}</v-list-item-title>
          <v-list-item-subtitle>NIP. {{ item.NIP }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider/>
      </template>
    </v-list>
  </v-main>
</template>
