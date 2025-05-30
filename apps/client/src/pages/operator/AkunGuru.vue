<script lang="ts" setup>
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { injectTrpc, useTrcpQuery } from '../../api-vue';
import CAppBarHamburger from '../../components/CAppBarHamburger.vue';

const trpc = injectTrpc();
const queryClient = useQueryClient();
const { data } = useTrcpQuery(trpc!.operator.guru.getUnverifiedAll.queryOptions())
const { mutateAsync } = useMutation(trpc!.operator.guru.verify.mutationOptions())
const key = trpc!.operator.guru.getUnverifiedAll.queryKey()

function verify(userName: string, accepted: boolean) {
  mutateAsync({
    username: userName,
    accept: accepted,
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: key
    })
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Verifikasi Akun Guru</v-app-bar-title>

  </v-app-bar>
  <v-main>
    <div class="d-flex flex-column pa-4">
      <v-card v-if="data" v-for="guru in data">
        <v-card-title>{{ guru.nama_lengkap }}</v-card-title>
        <v-card-text>{{ guru.username }}</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn @click="verify(guru.username, false)" variant="elevated" color="error" size="default">Tolak</v-btn>
          <v-btn @click="verify(guru.username, true)" variant="elevated">Setujui</v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-main>
</template>
