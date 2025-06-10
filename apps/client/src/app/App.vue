<script setup lang="ts">
import { watch } from 'vue';
import { injectTrpc, useTrcpQuery } from '../api-vue';
import { validateUserRole } from '../router';
import { useRoute, useRouter } from 'vue-router';
import { useSnackbarStore } from '../store';

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

const snackbarStore = useSnackbarStore();
</script>

<template>
  <v-app>
    <router-view />
    <v-snackbar-queue v-model="snackbarStore.errors" color="error"></v-snackbar-queue>
  </v-app>
</template>
