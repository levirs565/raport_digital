<script setup lang="ts">
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { usePeriodeStore } from '../../../store';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import AddEkstrakurikuler from './AddEkstrakurikuler.vue';

const periodeStore = usePeriodeStore();

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.ekstrakurikuler.getAll.queryOptions({
  periodeAjarId: computed(() => periodeStore.selectedPeriode!)
}, {
  enabled: computed(() => !!periodeStore.selectedPeriode) as unknown as boolean
}))

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Ekstrakurikuler</v-app-bar-title>
  </v-app-bar>
  <v-main>
    <v-list>
      <template v-for="item in data" :key="item.id_esktrakurikuler">
        <v-list-item :to="`/operator/ekstrakurikuler/${item.id_esktrakurikuler}`">
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.guru.nama_lengkap }}</v-list-item-subtitle>
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
      <add-ekstrakurikuler @close="isActive.value = !isActive.value" />
    </template>
  </v-dialog>
</template>
