<script setup lang="ts">
import { ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { injectTrpc } from '../../api-vue';
import logo from '../../logo.png';
import { useRouter } from 'vue-router';
import { formatError } from '../../api';
import { SubmitEventPromise } from 'vuetify';
import CPasswordField from '../../components/CPasswordField.vue';
import { useRules } from 'vuetify/labs/rules';

const trpc = injectTrpc();
const queryClient = useQueryClient();
const router = useRouter();

const { mutateAsync, error, isPending, reset } = useMutation(trpc!.auth.login.mutationOptions());
const key = trpc!.auth.state.queryKey();

const userName = ref('');
const password = ref('');

async function onLogin(result: SubmitEventPromise) {
  if (!(await result).valid) {
    reset();
    return;
  }
  mutateAsync({
    username: userName.value,
    password: password.value,
  }).then((result) => {
    queryClient.invalidateQueries({
      queryKey: key,
    });
    if (result.state == 'PENDING_VERIFICATION') {
      router.push('/wait-verification');
    }
  });
}

const rules = useRules();
</script>

<template>
  <v-main max-width="360px" class="mx-auto w-100">
    <v-form @submit.prevent="onLogin">
      <v-img :src="logo" height="200" width="200" class="mx-auto" />
      <v-card class="pa-4">
        <v-card-title class="text-center">LOGIN</v-card-title>
        <v-text-field :rules="[rules!.required!()]" v-model="userName" label="Username" autocomplete="current-username" />
        <c-password-field :rules="[rules!.required!()]" v-model="password" label="Password" autocomplete="current-password" />
        <v-card-text class="text-error text-center pa-0 my-2" v-if="error">{{ formatError(error) }}</v-card-text>
        <v-btn class="d-block mx-auto my-2" type="submit" :loading="isPending">Login</v-btn>
        <v-card-text class="text-center">
          Belum punya akun?
          <router-link to="/register-guru" text="Register"></router-link></v-card-text>
      </v-card>
    </v-form>
  </v-main>
</template>
