<script setup lang="ts">
import { injectTrpc, useTrcpQuery } from '../api-vue';

const trpc = injectTrpc();
const { data  } = useTrcpQuery(trpc!.operator.guru.getVerifiedAll.queryOptions());
</script>
<template>
  <v-combobox :items="data ?? []" item-title="nama_lengkap" item-value="username" :return-object="false"/>
</template>
