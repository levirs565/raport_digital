<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../api-vue';
const model: Set<string> = defineModel() as unknown as Set<string>;

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.guru.getVerifiedAll.queryOptions());

const filterNama = ref("");

const list = computed(() => {
  const filter = filterNama.value.toLocaleLowerCase();
  return (data.value ?? []).filter(guru => guru.nama_lengkap.toLocaleLowerCase().includes(filter));
})

</script>
<template>
  <v-card class="pb-4">
    <div class="pa-4 pb-0">
      <v-text-field v-model="filterNama" label="Filter" />
    </div>
    <v-list>
      <template v-for="item in list" :key="item.username">
        <v-list-item>
          <template v-slot:prepend>
            <v-list-item-action start>
              <v-checkbox-btn :model-value="model.has(item.username)"
                @update:model-value="(value) => {
                  if (!value) {
                    model.delete(item.username);
                  } else {
                    model.add(item.username);
                  }
                }" />
            </v-list-item-action>
          </template>

          <v-list-item-title>{{ item.nama_lengkap }}</v-list-item-title>
          <v-list-item-subtitle>NIP. {{ item.NIP }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
  </v-card>
</template>
