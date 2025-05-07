<script setup lang="ts">
import { ref } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { injectTrpc, useTrcpQuery } from "../api-vue";

const trpc = injectTrpc();
const queryClient = useQueryClient();

const { data } = useTrcpQuery(trpc!.auth.state.queryOptions());
const { mutateAsync } = useMutation(trpc!.auth.login.mutationOptions());
const key = trpc!.auth.state.queryKey()

const userName = ref("");
const password = ref("");

function onClick() {
  mutateAsync({
    username: userName.value,
    password: password.value
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: key
    })
  })
}
</script>

<template>
  <input type="text" v-model="userName"/>
  <input type="password" v-model="password"/>
  <button @click="onClick">Login!</button>
  <p>{{ data }}</p>
</template>
