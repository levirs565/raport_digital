<script setup lang="ts">
defineProps({
  data: String
})
</script>
<template>
  <v-card class="mx-4 my-2 pa-1">
    <iframe :src="`data:application/pdf;base64,${data}`" allow="fullscreen" class="mt-4"
      style="border: none; width: 100%; height: 100%; min-height: 640px;">
    </iframe>
  </v-card>
</template>
