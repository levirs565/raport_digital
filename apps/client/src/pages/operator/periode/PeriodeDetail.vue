<script setup lang="ts">
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import AddPeriode from './AddPeriode.vue';

const { id } = defineProps({
  id: String
})

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.periodeAjar.get.queryOptions({
  id: id!
}));

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Periode Ajar</v-app-bar-title>
  </v-app-bar>

  <v-main v-if="data">
    <div class="px-4 py-2">
      <p>Tahun Ajaran</p>
      <p>{{ data.tahunAjar }}/{{ data.tahunAjar + 1 }}</p>
      <p>Semester</p>
      <p>{{ data.semester == "GANJIL" ? "Ganjil" : "Genap" }}</p>
    </div>
  </v-main>

  <v-dialog persistent>
    <template v-slot:activator="{ props }">
      <v-fab icon="mdi-pencil" app v-bind="props" />
    </template>
    <template v-slot:default="{ isActive }">
      <add-periode :id="id" @close="isActive.value = !isActive.value" />
    </template>
  </v-dialog>
</template>
