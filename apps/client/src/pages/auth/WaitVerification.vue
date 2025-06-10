<script setup lang="ts">
import logo from '../../logo.png';
import waitVerification from '../../waitVerification.svg';
</script>

<template>
  <v-main max-width="360px" class="mx-auto w-100">
    <v-img :src="logo" height="200" width="200" class="mx-auto" />
    <v-card class="pa-4" style="text-align: center">
      <v-card-title>Wait Verification</v-card-title>
      <v-img :src="waitVerification" height="200" width="200" class="mx-auto" />
      <v-card-title>Menunggu Verifikasi Operator</v-card-title>
      <v-btn to="/login">Kembali ke Halaman Login</v-btn>
    </v-card>
  </v-main>
</template>
