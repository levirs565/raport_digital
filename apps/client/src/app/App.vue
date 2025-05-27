<script setup lang="ts">
import { watch } from 'vue';
import { injectTrpc, useTrcpQuery } from '../api-vue';
import { validateUserRole } from '../router';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.auth.state.queryOptions());

watch([data, route], ([currentData, currentRoute]) => {
  const validation = validateUserRole(currentRoute, currentData?.type);
  if (validation != true) {
    router.push(validation.path);
  }
});
</script>

<template>
  <v-app>
    <router-view />
  </v-app>
</template>
