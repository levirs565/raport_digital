<script lang="ts" setup>
import { computed, ref } from 'vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';

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
  asc: computed(() => selectedOrderItem.value.asc),
  order_by: computed(() => selectedOrderItem.value.orderBy)
}));

const filterSiswa = ref('');

</script>
<template>
  <v-app-bar>
    <CAppBarHamburger />
    <v-app-bar-title>Siswa</v-app-bar-title>
  </v-app-bar>
  <v-main>
    <div class="px-4 py-2">
      <v-text-field v-model="filterSiswa" label="Cari"></v-text-field>
      <v-select label="Filter" :items="orders" item-title="title" item-value="index" v-model="selectedOrder"></v-select>
      <div class="text-center">
        <v-pagination v-model="pageIndex" :length="data?.page_count" :total-visible="7"></v-pagination>
      </div>
    </div>
    <v-list>
      <template v-for="item in data?.page">
        <v-list-item>
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>NIS. {{ item.NIS }}  NISN. {{ item.NISN }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider/>
      </template>
    </v-list>
  </v-main>

  <v-fab icon="mdi-plus" app to="/operator/siswa/add"></v-fab>
</template>
