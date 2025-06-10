<script lang="ts" setup>
import { computed, ref } from 'vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import AddSiswa from './AddSiswa.vue';
import SiswaImportCsv from './SiswaImportCsv.vue';

const dialog = ref(false);

const pageIndex = ref(1);

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
  page_index: computed(() => pageIndex.value - 1),
  asc: computed(() => selectedOrderItem.value.asc),
  order_by: computed(() => selectedOrderItem.value.orderBy)
}));

const filterSiswa = ref('');

const isAddOpen = ref(false);
const isImportOpen = ref(false);

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
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
        <v-list-item :to="`/operator/siswa/${item.id_siswa}`">
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
  </v-main>

  <v-dialog persistent v-model="isAddOpen">
    <template v-slot:default="{ isActive }">
      <AddSiswa v-model="dialog" @close="isActive.value = !isActive.value" />
    </template>
  </v-dialog>

    <v-dialog persistent v-model="isImportOpen">
    <template v-slot:default="{ isActive }">
      <SiswaImportCsv v-model="dialog" @close="isActive.value = !isActive.value" />
    </template>
  </v-dialog>

  <v-fab app icon="mdi-plus">
    <v-speed-dial transition="fade-transition" location="bottom end" activator="parent">
      <v-btn key="1" prepend-icon="mdi-plus" variant="tonal" @click="isAddOpen = true;">Input
        Manual</v-btn>
      <v-btn key="2" prepend-icon="mdi-upload-outline" variant="tonal" @click="isImportOpen = true">Import CSV</v-btn>
    </v-speed-dial>
    <v-icon>mdi-plus</v-icon>
  </v-fab>
</template>
