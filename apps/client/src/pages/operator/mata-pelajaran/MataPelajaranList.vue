<script setup lang="ts">
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { usePeriodeStore } from '../../../store';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';

const periodeStore = usePeriodeStore();

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.mataPelajaran.getAll.queryOptions({
  periodeAjarId: computed(() => periodeStore.selectedPeriode ?? "")
}, {
  enabled: computed(() => !!periodeStore.selectedPeriode) as unknown as boolean
}))

// TODO: Group

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Mata Pelajaran</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-list>
      <template v-for="item in data" :key="item.id_mata_pelajaran">
        <v-list-item :to="`/operator/mata-pelajaran/${item.id_mata_pelajaran}`">
          <v-list-item-title>{{ item.nama  }}</v-list-item-title>
        </v-list-item>
        <v-divider/>
      </template>
    </v-list>
  </v-main>

  <v-fab icon="mdi-plus" app to="/operator/mata-pelajaran/add" />
</template>
