<script setup lang="ts">
import { StatusRaportType } from '@raport-digital/client-api-types';

defineProps({
  status: String
})

const statusStepMap: Record<StatusRaportType, number> = {
  MENUNGGU_KONFIRMASI: 1,
  DIKONFIRMASI: 2,
  DIVERIFIKASI: 3,
}
</script>
<template>
  <v-stepper :model-value="!status ? 0 : statusStepMap[status as StatusRaportType]">
    <v-stepper-header>
      <v-stepper-item title="Konfirmasi Wali Kelas" :value="1" />
      <v-divider />
      <v-stepper-item title="Verifikasi Kepala Sekolah" :value="2" />
      <v-divider />
      <v-stepper-item title="Cetak Raport" :value="3" />
    </v-stepper-header>
  </v-stepper>
</template>
