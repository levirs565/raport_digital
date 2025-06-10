<script lang="ts" setup>
import { injectTrpc, useTrcpQuery } from '../../api-vue';
import CAppBarHamburger from '../../components/CAppBarHamburger.vue';
import KepalaSekolahDashboard from './KepalaSekolahDashboard.vue';
import GuruDashboard from './GuruDashboard.vue';
import OperatorDashboard from './OperatorDashboard.vue';

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.auth.state.queryOptions());

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Dashboard</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <kepala-sekolah-dashboard v-if="data?.type == 'KEPALA_SEKOLAH'" />
    <guru-dashboard v-else-if="data?.type == 'GURU'" />
    <operator-dashboard v-else-if="data?.type == 'OPERATOR'" />
  </v-main>
</template>
