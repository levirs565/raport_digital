<script setup lang="ts">
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import AddPeriode from './AddPeriode.vue';

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.common.getAllPeriodeAjar.queryOptions());

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Periode Ajar</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-list>
      <template v-for="item in data">
        <v-list-item :to="`/operator/periode/${item.id_periode_ajar}`">
          <v-list-item-title>
            {{ item.tahunAjar }}/{{ item.tahunAjar + 1 }}
            {{ item.semester == "GANJIL" ? "Ganjil" : "Genap" }}</v-list-item-title>
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
      <add-periode @close="isActive.value = !isActive.value" />
    </template>
  </v-dialog>
</template>
