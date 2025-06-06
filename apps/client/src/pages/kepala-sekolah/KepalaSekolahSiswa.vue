<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../api-vue';
import CAppBarHamburger from '../../components/CAppBarHamburger.vue';
import CRaportStatusStepper from '../../components/CRaportStatusStepper.vue';
import CPdfViewer from '../../components/CPdfViewer.vue';
import { useLayout } from 'vuetify';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import KepalaSekolahReject from './KepalaSekolahReject.vue';

const { idKelas, idSiswa } = defineProps({
  idKelas: String,
  idSiswa: String
})

const idComputed = computed(() => ({
  kelas_id: idKelas!,
  siswa_id: idSiswa!
}))

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.kepalaSekolah.getAnggotaKelas.queryOptions(idComputed))

const selectedRaport = ref(-1);

const { data: raportData } = useTrcpQuery(trpc!.kepalaSekolah.getRaportPDF.queryOptions(idComputed,
  {
    enabled: computed(() => selectedRaport.value == 1) as unknown as boolean
  }
))

const layout = useLayout();

const queryClient = useQueryClient();

function updateData() {
  queryClient.invalidateQueries({
    queryKey: trpc!.kepalaSekolah.getAnggotaKelas.queryKey({
      kelas_id: idKelas,
      siswa_id: idSiswa
    })
  })
  queryClient.invalidateQueries({
    queryKey: trpc!.kepalaSekolah.getRaportPDF.queryKey({
      kelas_id: idKelas,
      siswa_id: idSiswa
    })
  })
}

const { mutateAsync: verifyAsync } = useMutation(trpc!.kepalaSekolah.verifyRaport.mutationOptions());
function onConfirm() {
  verifyAsync({
    kelas_id: idKelas!,
    siswa_id: idSiswa!,
    status: {
      is_verified: true,
    }
  }).then(updateData)
}

const { mutateAsync: unlockAsync } = useMutation(trpc!.kepalaSekolah.unlockRaport.mutationOptions());
function onUnlock() {
  unlockAsync({
    kelas_id: idKelas!,
    siswa_id: idSiswa!,
  }).then(updateData)
}
</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>{{ data?.nama }}</v-app-bar-title>
  </v-app-bar>
  <v-main>
    <c-raport-status-stepper v-if="data" :status="data?.status" />
    <div class="mx-4 my-2" v-if="data?.alasan_tolak || data?.status == 'MENUNGGU_KONFIRMASI'">
      <p v-if="data?.alasan_tolak">Ditolak dengan alasan "{{ data?.alasan_tolak }}"</p>
      <p v-if="data?.status == 'MENUNGGU_KONFIRMASI'">Menunggu Konfirmasli Wali Kelas</p>
    </div>
    <v-chip-group v-model="selectedRaport" selected-class="text-primary" class="mx-4 my-2">
      <v-chip rounded filter>Identitas</v-chip>
      <v-chip rounded filter>Raport Akademik</v-chip>
      <v-chip rounded filter>P5</v-chip>
    </v-chip-group>
    <c-pdf-viewer v-if="raportData" :data="raportData" />
    <v-sheet v-if="data?.status != 'MENUNGGU_KONFIRMASI'"
      class="position-fixed bottom-0 right-0 pa-4 d-flex justify-end" :style="{
        left: layout.mainRect.value.left + 'px'
      }">
      <template v-if="data?.status == 'DIKONFIRMASI'">
        <v-dialog persistent>
          <template v-slot:activator="{ props }">
            <v-btn color="error" v-bind="props" variant="outlined">Tolak</v-btn>
          </template>
          <template v-slot:default="{ isActive }">
            <kepala-sekolah-reject :id-kelas="idKelas" :id-siswa="idSiswa" @close="isActive.value = false" @success="() => {
              isActive.value = false;
              updateData();
            }" />
          </template>
        </v-dialog>

        <v-btn @click="onConfirm" class="ml-4">Setuju</v-btn>
      </template>
      <v-btn v-else @click="onUnlock" color="error">Buka Kunci Raport</v-btn>
    </v-sheet>
  </v-main>
</template>
