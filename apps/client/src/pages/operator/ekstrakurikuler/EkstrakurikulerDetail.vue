<script setup lang="ts">
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';

const { id } = defineProps({
  id: String
})

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.ekstrakurikuler.get.queryOptions({
  id: computed(() => id!)
}))

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Detail Mata Pelajaran</v-app-bar-title>
    <v-btn icon :to="`/operator/ekstrakurikuler/${data?.id_esktrakurikuler}/edit`">
      <v-icon>mdi-pencil</v-icon>
    </v-btn>
  </v-app-bar>
  <v-main>
    <div class="px-4 py-2" v-if="data">
      <p>Nama</p>
      <p>{{ data.nama }}</p>
      <p>Guru Pengampu</p>
      <p>{{ data.guru.nama_lengkap }}</p>
      <p>NIP Guru Pengampu</p>
      <p>{{ data.guru.NIP ?? "-" }}</p>
    </div>
  </v-main>
</template>
