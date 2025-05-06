<script setup lang="ts">
import { ref } from "vue";
import { trpc } from "../api";

const data = ref<number | null>(null)

function onClick() {
  trpc.test.query().then((val) => {
    console.log(val)
    data.value = val;
  })
}
</script>

<template>
  <button @click="onClick">Click Here</button>
  <p>{{ data }}</p>
</template>
