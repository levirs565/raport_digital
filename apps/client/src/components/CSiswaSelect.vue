<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../api-vue';
import { useDebounce } from '@vueuse/core';

const { periodeAjarId } = defineProps({
  periodeAjarId: String,
  isItemDisabled: Function,
})

const model: Set<string> = defineModel() as unknown as Set<string>;

const filter = ref("");
const filterDebounced = useDebounce(filter, 500);

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.common.getSiswaList.queryOptions({
  periode_ajar_id: computed(() => periodeAjarId!),
  filter: filterDebounced,
  limit: 100
}))

</script>
<template>
  <div class="pa-4 pb-0">
    <v-text-field v-model="filter" label="Filter" />
  </div>
  <v-list>
    <template v-for="item in data" :key="item.id_siswa">
      <v-list-item>
        <template v-slot:prepend>
          <v-list-item-action start>
            <v-checkbox-btn :model-value="model.has(item.id_siswa)" @update:model-value="(value) => {
              if (!value) {
                model.delete(item.id_siswa);
              } else {
                model.add(item.id_siswa);
              }
            }" :disabled="item.is_locked || (isItemDisabled ? isItemDisabled(item) : false)" />
          </v-list-item-action>
        </template>

        <v-list-item-title>{{ item.nama }}</v-list-item-title>
        <v-list-item-subtitle v-if="item.is_locked" class="items-center">
          <v-icon  size="small" class="mr-2">mdi-lock</v-icon>
          <span>Dikunci</span>
        </v-list-item-subtitle>
        <v-list-item-subtitle>
          NIS. {{ item.NIS }}
          NISN. {{ item.NISN }}
          {{ item.kelas ? `, Kelas
          ${item.kelas.kelas}-${item.kelas.kode_ruang_kelas}`
            : "" }}
        </v-list-item-subtitle>
      </v-list-item>
      <v-divider />
    </template>
  </v-list>
</template>
