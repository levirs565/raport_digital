<script lang="ts" setup>
import { computed, ref } from 'vue';
import CAppBarHamburger from '../../components/CAppBarHamburger.vue';
import { injectTrpc, useTrcpQuery } from '../../api-vue';

const pageIndex = ref(0);

const orders = ([
  {
    asc: true,
    orderBy: "NIS"
  },
  {
    asc: false,
    orderBy: "NIS"
  },
  {
    asc: true,
    orderBy: "Nama"
  },
  {
    asc: false,
    orderBy: "Nama"
  }
] satisfies {
  asc: boolean,
  orderBy: "NIS" | "Nama",
}[]).map((order, index) => ({
  ...order,
  index,
  title: `${order.orderBy} (${order.asc ? "Menaik" : "Menurun"})`
}))
const selectedOrder = ref(0)
const selectedOrderItem = computed(() => orders[selectedOrder.value])

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.siswa.getAll.queryOptions({
  page_index: pageIndex,
  asc: selectedOrderItem.value.asc,
  order_by: selectedOrderItem.value.orderBy
}));

const filterSiswa = ref('');

</script>
<template>
  <v-app-bar>
    <CAppBarHamburger />
    <v-app-bar-title>Siswa</v-app-bar-title>
  </v-app-bar>
  <v-main>
    <v-text-field v-model="filterSiswa" label="Cari"></v-text-field>
    <v-select label="Filter" :items="orders" item-title="title" item-value="index" v-model="selectedOrder"></v-select>
    <div class="text-center">
      <v-pagination v-model="pageIndex" :length="data?.page_count" :total-visible="7"></v-pagination>
    </div>
  </v-main>

  <v-fab icon="mdi-plus" app to="/operator/siswa/add"></v-fab>
</template>
