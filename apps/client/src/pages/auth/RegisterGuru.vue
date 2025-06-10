<script setup lang="ts">
import { ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import { injectTrpc } from '../../api-vue';
import logo from '../../logo.png';
import { useRouter } from 'vue-router';
import CPasswordField from '../../components/CPasswordField.vue';
import { SubmitEventPromise } from 'vuetify';
import { formatError } from '../../api';
import { useRules } from 'vuetify/labs/rules';

const trpc = injectTrpc();
const router = useRouter();

const { mutateAsync, error, isPending, reset } = useMutation(
  trpc!.auth.registerAkunGuru.mutationOptions()
);

const namaLengkap = ref('');
const userName = ref('');
const password = ref('');
const konfirmasiPassword = ref('');

async function onRegister(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    return;
  }

  mutateAsync({
    namaLengkap: namaLengkap.value,
    password: password.value,
    username: userName.value,
  }).then(() => {
    router.push('/login');
  });
}

const rules = useRules();

function konfirmasiPasswordRule() {
  if (konfirmasiPassword.value != password.value) return "Konfirmasi password harus sesuai";
  return true;
}
</script>

<template>
  <v-main max-width="360px" class="mx-auto w-100">
    <v-form @submit.prevent="onRegister">
      <v-img :src="logo" height="200" width="200" class="mx-auto" />
      <v-card class="pa-4">
        <v-card-title class="text-center">REGISTER</v-card-title>
        <v-text-field :rules="[rules!.required!()]" v-model="namaLengkap" label="Nama Lengkap" />
        <v-text-field :rules="[rules!.required!()]" v-model="userName" label="Username"
          autocomplete="current-username" />
        <c-password-field :rules="[rules!.required!(), rules!.minLength!(8)]" v-model="password" label="Password"
          autocomplete="current-password" />
        <c-password-field :rules="[rules!.required!(), konfirmasiPasswordRule]" v-model="konfirmasiPassword" label="Konfirmasi Password"
          autocomplete="current-password" />
        <v-card-text class="text-error text-center pa-0 my-2" v-if="error">{{ formatError(error) }}</v-card-text>
        <v-btn class="d-block mx-auto my-2" type="submit" :loading="isPending">Register</v-btn>
        <v-card-text class="text-center">Sudah punya akun? <router-link to="/login" text="Login"></router-link></v-card-text>
      </v-card>
    </v-form>
  </v-main>
</template>
