<script setup lang="ts">
// import { ref } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import { injectTrpc, useTrcpQuery } from "../api-vue";

const trpc = injectTrpc();
const queryClient = useQueryClient();

const options = trpc!.test.queryOptions();

const { data } = useTrcpQuery(options); 
const key = trpc!.test.queryKey()

function onClick() {
  queryClient.invalidateQueries({
    queryKey: key
  })
}
</script>

<template>
  <button @click="onClick">Click Now</button>
  <p>{{ data }}</p>
</template>
