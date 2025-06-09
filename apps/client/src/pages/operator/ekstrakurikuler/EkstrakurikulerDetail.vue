<script setup lang="ts">
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import AddEkstrakurikuler from './AddEkstrakurikuler.vue';

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
    <v-app-bar-title>
      <span>Detail Ekstrakurikuler</span>
      <v-icon v-if="data?.is_locked" size="small" class="ml-4">mdi-lock</v-icon>
    </v-app-bar-title>
    <v-dialog v-if="data && !data.is_locked" persistent>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <template v-slot:default="{ isActive }">
        <add-ekstrakurikuler :id="id" @close="isActive.value = !isActive.value" />
      </template>
    </v-dialog>
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
