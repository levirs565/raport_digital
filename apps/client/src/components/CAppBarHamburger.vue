<script lang="ts" setup>
import { inject } from 'vue';
import { APP_BAR_TOGGLE_KEY } from './CAppBarHarmbugerKey';

const toggle = inject(APP_BAR_TOGGLE_KEY)

function onToggle() {
    if (typeof toggle == "function") toggle();
}
</script>
<template>
    <v-app-bar-nav-icon @click="onToggle"></v-app-bar-nav-icon>
</template>