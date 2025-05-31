<script setup lang="ts">
import { ref } from 'vue';

const isOpen = ref(false);

function toggle() {
  isOpen.value = !isOpen.value;
}
</script>
<template>
  <slot name="header" :isOpen="isOpen" :toggle="toggle"></slot>
  <slot name="content" v-if="isOpen"></slot>
</template>
