<script lang="ts" setup>
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useLayout } from 'vuetify';
import { StatusRaportType } from '@raport-digital/client-api-types';

const { idKelas, idSiswa } = defineProps({
  idKelas: String,
  idSiswa: String
})

const trpc = injectTrpc();
const queryClient = useQueryClient();

const { data: statusData } = useTrcpQuery(trpc!.guru.waliKelas.getRaportStatus.queryOptions(computed(() => ({
  kelas_id: idKelas!,
  siswa_id: idSiswa!
}))));

const statusStepMap: Record<StatusRaportType, number> = {
  MENUNGGU_KONFIRMASI: 1,
  DIKONFIRMASI: 2,
  DIVERIFIKASI: 3,
}

const selectedRaport = ref(-1);

const { data } = useTrcpQuery(trpc!.guru.waliKelas.getRaportPDF.queryOptions({
  kelas_id: computed(() => idKelas!),
  siswa_id: computed(() => idSiswa!),
}, {
  enabled: computed(() => selectedRaport.value == 1) as unknown as boolean
}))

const { mutateAsync: confirmAsync } = useMutation(trpc!.guru.waliKelas.confirmRaport.mutationOptions())

function onConfirm() {
  if (!idKelas || !idSiswa) return;
  confirmAsync({
    kelas_id: idKelas,
    siswa_id: idSiswa
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.waliKelas.getRaportStatus.queryKey()
    })
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.waliKelas.getRaportPDF.queryKey()
    })
  })
}

const layout = useLayout();
</script>
<template>
  <v-stepper :model-value="!statusData ? 0 : statusStepMap[statusData]">
    <v-stepper-header>
      <v-stepper-item title="Konfirmasi Wali Kelas" :value="1" />
      <v-divider />
      <v-stepper-item title="Verifikasi Kepala Sekolah" :value="2" />
      <v-divider />
      <v-stepper-item title="Cetak Raport" :value="3" />
    </v-stepper-header>
  </v-stepper>
  <v-chip-group v-model="selectedRaport" selected-class="text-primary" class="mx-4 my-2">
    <v-chip rounded filter>Identitas</v-chip>
    <v-chip rounded filter>Raport Akademik</v-chip>
    <v-chip rounded filter>P5</v-chip>
  </v-chip-group>
  <v-card v-if="data" class="mx-4 my-2 pa-1">
    <iframe :src="`data:application/pdf;base64,${data}`" allow="fullscreen" class="mt-4"
      style="border: none; width: 100%; height: 100%; min-height: 640px;">
    </iframe>
  </v-card>
  <v-sheet v-if="statusData == 'MENUNGGU_KONFIRMASI'" class="position-fixed bottom-0 right-0 pa-4 d-flex justify-end"
    :style="{
      left: layout.mainRect.value.left + 'px'
    }">
    <v-btn @click="onConfirm">Konfirmasi</v-btn>
  </v-sheet>
</template>
