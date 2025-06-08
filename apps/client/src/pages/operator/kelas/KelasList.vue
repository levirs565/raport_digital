<script setup lang="ts">
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { usePeriodeStore } from '../../../store';
import { computed } from 'vue';
import AddKelas from './AddKelas.vue';

const periodeStore = usePeriodeStore();

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.kelas.getAll.queryOptions({
  periode_ajar_id: computed(() => periodeStore.selectedPeriode!),
}, {
  enabled: computed(() => !!periodeStore.selectedPeriode) as unknown as boolean
}));

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Kelas</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-list>
      <template v-for="item in data" :key="item.id_kelas">
        <v-list-item :to="`/operator/kelas/${item.id_kelas}`">
          <v-list-item-title>Kelas {{ item.kelas }}-{{ item.kode_ruang_kelas }}</v-list-item-title>
          <v-list-item-subtitle>{{ item.wali_kelas.nama_lengkap }}</v-list-item-subtitle>
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
      <add-kelas @close="isActive.value = !isActive.value" />
    </template>
  </v-dialog>
</template>
