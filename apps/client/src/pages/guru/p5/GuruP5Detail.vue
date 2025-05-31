<script setup lang="ts">
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import GuruAddP5Proyek from './GuruAddP5Proyek.vue';

const { idKelas } = defineProps({
  idKelas: String
})
const idKelasComputed = computed(() => idKelas!)

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.p5.get.queryOptions({
  id_kelas: idKelasComputed
}));

const { data: proyekData } = useTrcpQuery(trpc!.guru.p5.getProyekList.queryOptions({
  id_kelas: idKelasComputed
}))

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Kelas {{ data?.kelas }}-{{ data?.kode_ruang_kelas }} - Proyek P5</v-app-bar-title>
  </v-app-bar>
  <v-main>
    <v-list>
      <template v-for="item in proyekData" :key="item.id_proyek_p5">
        <v-list-item :to="`/guru/p5/${idKelas}/proyek/${item.id_proyek_p5}`">
          <v-list-item-title>{{ item.judul }}</v-list-item-title>
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
  </v-main>
  <v-dialog persistent>
    <template v-slot:activator="{ props }">
      <v-fab icon="mdi-plus" app v-bind="props" />
    </template>
    <template v-slot:default="{ isActive }">
      <guru-add-p5-proyek :id-kelas="idKelas" @close="isActive.value = !isActive.value" />
    </template>
  </v-dialog>
</template>
