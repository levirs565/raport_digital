<script setup lang="ts">
import { ref } from 'vue';

const showPassword = ref(false);
</script>
<template>
  <v-text-field :type="showPassword ? 'text' : 'password'" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
    @click:append-inner="showPassword = !showPassword" />
</template>
