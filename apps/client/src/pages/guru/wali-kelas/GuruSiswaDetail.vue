<script setup lang="ts">
import { computed, ref } from 'vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { nilaiEsktrakurikulerMap } from '../../../mapping';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import GuruUpdateCatatan from './GuruUpdateCatatan.vue';
import GuruUpdateKehadiran from './GuruUpdateKehadiran.vue';
import GuruAddPrestasi from './GuruAddPrestasi.vue';
import GuruRaport from './GuruRaport.vue';
import { useSnackbarStore } from '../../../store';
import { formatError } from '../../../api';

const { idKelas, idSiswa } = defineProps({
  idKelas: String,
  idSiswa: String
})
const idComputed = computed(() => ({
  kelas_id: idKelas!,
  siswa_id: idSiswa!
}))

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.waliKelas.getAnggota.queryOptions(idComputed));
const { data: rekapData } = useTrcpQuery(trpc!.guru.waliKelas.getRekapNilai.queryOptions(idComputed));
const { data: prestasiData } = useTrcpQuery(trpc!.guru.waliKelas.getAllPrestasi.queryOptions(idComputed));
const { data: kehadiranData } = useTrcpQuery(trpc!.guru.waliKelas.getKehadiran.queryOptions(idComputed));
const { data: catatanData } = useTrcpQuery(trpc!.guru.waliKelas.getCatatanWaliKelas.queryOptions(idComputed));
const { mutateAsync: deletePrestasiAsync } = useMutation(trpc!.guru.waliKelas.deletePrestasi.mutationOptions());
const queryClient = useQueryClient();

const isLocked = computed(() => !data.value || data.value.status != "MENUNGGU_KONFIRMASI")

const snackbar = useSnackbarStore();
function onDeletePrestasi(idPrestasi: string) {
  deletePrestasiAsync({
    kelas_id: idKelas!,
    prestasi_id: idPrestasi
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.waliKelas.getAllPrestasi.queryKey({
        kelas_id: idKelas!,
        siswa_id: idSiswa!
      })
    })
  }).catch(e => {
    snackbar.errors.push(formatError(e))
  })
}

const activeTab = ref(0);
</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>
      <span>{{ data?.nama }}</span>
      <v-icon v-if="isLocked" size="small" class="ml-4">mdi-lock</v-icon>
    </v-app-bar-title>
    <template v-slot:extension>
      <v-tabs grow v-model="activeTab">
        <v-tab>Rekap Nilai</v-tab>
        <v-tab>Evaluasi Wali Kelas</v-tab>
        <v-tab>Raport</v-tab>
      </v-tabs>
    </template>
  </v-app-bar>

  <v-main>
    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item>
        <v-list v-if="rekapData">
          <v-list-subheader v-if="rekapData.mata_pelajaran.length > 0">Mata Pelajaran</v-list-subheader>
          <template v-for="item in rekapData.mata_pelajaran" :key="item.id_mata_pelajaran">
            <v-list-item>
              <v-list-item-title>{{ item.nama }}</v-list-item-title>
              <v-list-item-subtitle>{{ item.deskripsi ?? "-" }}</v-list-item-subtitle>
              <template v-slot:append>
                <p>{{ Number(item.nilai).toFixed(1) }}</p>
              </template>
            </v-list-item>
            <v-divider />
          </template>
          <v-list-subheader v-if="rekapData.ekstrakurikuler.length > 0">Ekstrakurikuler</v-list-subheader>
          <template v-for="item in rekapData.ekstrakurikuler" :key="item.id_esktrakurikuler">
            <v-list-item>
              <v-list-item-title>{{ item.nama }}</v-list-item-title>
              <template v-slot:append>
                <p>{{ item.nilai ? nilaiEsktrakurikulerMap[item.nilai] : "-" }}</p>
              </template>
            </v-list-item>
            <v-divider />
          </template>
        </v-list>
      </v-tabs-window-item>
      <v-tabs-window-item class="pa-4">
        <v-card v-if="prestasiData">
          <v-card-title>Prestasi</v-card-title>
          <v-list>
            <template v-for="item in prestasiData" :key="item.id_prestasi">
              <v-list-item>
                <v-list-item-title>{{ item.jenis }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.keterangan }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn v-if="!isLocked" variant="text" icon color="text">
                    <v-icon>mdi-dots-vertical</v-icon>
                    <v-menu activator="parent" v-if="!isLocked" >
                      <v-list>
                        <v-dialog persistent>
                          <template v-slot:activator="{ props }">
                            <v-list-item title="Ubah" v-bind="props" />
                          </template>
                          <template v-slot:default="{ isActive }">
                            <guru-add-prestasi :id-kelas="idKelas" :id-siswa="idSiswa" :id-prestasi="item.id_prestasi"
                              @close="isActive.value = !isActive.value" />
                          </template>
                        </v-dialog>
                        <v-dialog>
                          <template v-slot:activator="{ props: activatorProps }">
                            <v-list-item title="Hapus" v-bind="activatorProps" />
                          </template>
                          <template v-slot:default="{ isActive }">
                            <v-card title="Konfirmasi Hapus">
                              <v-card-text>
                                Apakah anda yakin menghapus Prestasi ini?
                              </v-card-text>
                              <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn text="Batal" @click="isActive.value = false"></v-btn>
                                <v-btn text="Hapus" color="red" @click="() => {
                                  isActive.value = false
                                  onDeletePrestasi(item.id_prestasi)
                                }"></v-btn>
                              </v-card-actions>
                            </v-card>
                          </template>
                        </v-dialog>

                      </v-list>
                    </v-menu>
                  </v-btn>
                </template>
              </v-list-item>
              <v-divider />
            </template>
          </v-list>
          <div class="d-flex justify-end ma-4 mt-0">
            <v-dialog v-if="!isLocked" persistent>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props">Tambah</v-btn>
              </template>
              <template v-slot:default="{ isActive }">
                <guru-add-prestasi :id-kelas="idKelas" :id-siswa="idSiswa" @close="isActive.value = !isActive.value" />
              </template>
            </v-dialog>
          </div>
        </v-card>
        <v-card v-if="kehadiranData" class="my-4">
          <v-card-title>Kehadiran</v-card-title>
          <div class="px-4">
            <div class="d-flex">
              <p class="flex-grow-1">Sakit</p>
              <p>{{ kehadiranData.sakit_hari }}</p>
            </div>
            <div class="d-flex">
              <p class="flex-grow-1">Izin</p>
              <p>{{ kehadiranData.izin_hari }}</p>
            </div>
            <div class="d-flex">
              <p class="flex-grow-1">Alpha</p>
              <p>{{ kehadiranData.alpa_hari }}</p>
            </div>
          </div>
          <div class="d-flex justify-end ma-4 mt-0">
            <v-dialog v-if="!isLocked" persistent>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props">Ubah</v-btn>
              </template>
              <template v-slot:default="{ isActive }">
                <guru-update-kehadiran :id-kelas="idKelas" :id-siswa="idSiswa"
                  @close="isActive.value = !isActive.value" />
              </template>
            </v-dialog>
          </div>
        </v-card>
        <v-card>
          <v-card-title>Catatan</v-card-title>
          <v-card-text>{{ catatanData ? catatanData : "-" }}</v-card-text>
          <div class="d-flex justify-end ma-4 mt-0">
            <v-dialog v-if="!isLocked" persistent>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props">Ubah</v-btn>
              </template>
              <template v-slot:default="{ isActive }">
                <guru-update-catatan :id-kelas="idKelas" :id-siswa="idSiswa"
                  @close="isActive.value = !isActive.value" />
              </template>
            </v-dialog>
          </div>
        </v-card>
      </v-tabs-window-item>
      <v-tabs-window-item>
        <guru-raport :id-kelas="idKelas" :id-siswa="idSiswa" :status-raport="data?.status"
          :alasan-tolak="data?.alasan_tolak ?? undefined" />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-main>
</template>
