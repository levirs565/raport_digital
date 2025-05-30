<script setup lang="ts">
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';

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

  <v-fab icon="mdi-plus" app to="/operator/periode/add" />
</template>
