<script setup lang="ts">
import { ref } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { injectTrpc } from '../../api-vue';
import logo from '../../logo.png';
import { useRouter } from 'vue-router';

const trpc = injectTrpc();
const queryClient = useQueryClient();
const router = useRouter();

const { mutateAsync } = useMutation(trpc!.auth.login.mutationOptions());
const key = trpc!.auth.state.queryKey();

const userName = ref('');
const password = ref('');
const showPassword = ref(false);

function onLogin() {
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
</script>

<template>
  <v-main max-width="360px" class="mx-auto w-100">
    <v-form>
      <v-img :src="logo" height="200" width="200" class="mx-auto" />
      <v-card class="pa-4" style="text-align: center">
        <v-card-title>LOGIN</v-card-title>
        <v-text-field
          v-model="userName"
          label="Username"
          autocomplete="current-username"
        />
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          @click:append-inner="showPassword = !showPassword"
          autocomplete="current-password"
        />
        <v-btn @click="onLogin">Login</v-btn>
        <v-card-text
          >Belum punya akun?
          <router-link to="/register-guru" text="Register"></router-link
        ></v-card-text>
      </v-card>
    </v-form>
  </v-main>
</template>
