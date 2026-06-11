<script setup lang="ts">
import logo from '../../logo.png';
import waitVerification from '../../waitVerification.svg';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { logout as logoutApi } from '../../api';
import { useRouter } from 'vue-router';
import { injectTrpc } from '../../api-vue';

const queryClient = useQueryClient();
const router = useRouter();
const trpc = injectTrpc();

const { mutate: logout, isPending } = useMutation({
  mutationFn: logoutApi,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.auth.state.queryKey(),
    });
  },
});
</script>

<template>
  <v-main max-width="360px" class="mx-auto w-100">
    <v-img :src="logo" height="200" width="200" class="mx-auto" />
    <v-card class="pa-4" style="text-align: center">
      <v-card-title>Wait Verification</v-card-title>
      <v-img :src="waitVerification" height="200" width="200" class="mx-auto" />
      <v-card-title>Menunggu Verifikasi Operator</v-card-title>
      <v-btn @click="logout()" :loading="isPending">Logout & Kembali ke Login</v-btn>
    </v-card>
  </v-main>
</template>
