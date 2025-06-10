<script lang="ts" setup>
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useLayout } from 'vuetify';
import { RaportType, StatusRaportType } from '@raport-digital/client-api-types';
import CRaportStatusStepper from '../../../components/CRaportStatusStepper.vue';
import CPdfViewer from '../../../components/CPdfViewer.vue';
import CRaportChip from '../../../components/CRaportChip.vue';

const { idKelas, idSiswa, statusRaport } = defineProps({
  idKelas: String,
  idSiswa: String,
  statusRaport: String,
  alasanTolak: String
})

const trpc = injectTrpc();
const queryClient = useQueryClient();

const statusData = computed(() => statusRaport ? statusRaport as StatusRaportType : undefined);

const selectedRaport = ref<RaportType>();
const { data } = useTrcpQuery(trpc!.guru.waliKelas.getRaportPDF.queryOptions({
  type: computed(() => selectedRaport.value!),
  kelas_id: computed(() => idKelas!),
  siswa_id: computed(() => idSiswa!),
}, {
  enabled: computed(() => !!selectedRaport.value) as unknown as boolean
}))

const { mutateAsync: confirmAsync } = useMutation(trpc!.guru.waliKelas.confirmRaport.mutationOptions())

function onConfirm() {
  if (!idKelas || !idSiswa) return;
  confirmAsync({
    kelas_id: idKelas,
    siswa_id: idSiswa
  }).then(() => {
    console.log("Updat")
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.waliKelas.getAnggota.queryKey({
        kelas_id: idKelas,
        siswa_id: idSiswa
      })
    })
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.waliKelas.getRaportPDF.queryKey({
        kelas_id: idKelas,
        siswa_id: idSiswa
      })
    })
  })
}
const layout = useLayout();
</script>
<template>
  <c-raport-status-stepper v-if="statusData" :status="statusData" />
  <div class="mx-4 my-2" v-if="alasanTolak || statusData == 'DIKONFIRMASI'">
    <p v-if="alasanTolak">Ditolak dengan alasan "{{ alasanTolak }}"</p>
    <p v-if="statusData == 'DIKONFIRMASI'">Menunggu Verifikasi Kepala Sekolah</p>
  </div>
  <c-raport-chip v-model="selectedRaport" class="mx-4 my-2" />
  <c-pdf-viewer v-if="data" :data="data" />
  <v-sheet v-if="statusData == 'MENUNGGU_KONFIRMASI'" class="position-fixed bottom-0 right-0 pa-4 d-flex justify-end"
    :style="{
      left: layout.mainRect.value.left + 'px'
    }">
    <v-btn @click="onConfirm">Konfirmasi</v-btn>
  </v-sheet>
</template>
