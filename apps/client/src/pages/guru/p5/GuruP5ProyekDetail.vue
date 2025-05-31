<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';

const { idProyek } = defineProps({
  idKelas: String,
  idProyek: String
})
const idProyekComputed = computed(() => idProyek!);

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.p5.getProyek.queryOptions({
  id_proyek: idProyekComputed
}))
const { data: targetData } = useTrcpQuery(trpc!.guru.p5.getAllTarget.queryOptions({
  id_proyek: idProyekComputed
}))
const { data: catatanData } = useTrcpQuery(trpc!.guru.p5.getCatatanProsesProyek.queryOptions({
  id_proyek: idProyekComputed
}))

const activeTab = ref(0);

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>{{ data?.judul }}</v-app-bar-title>
    <template v-slot:extension>
      <v-tabs grow v-model="activeTab">
        <v-tab>Informasi Proyek</v-tab>
        <v-tab>Catatan Proses</v-tab>
      </v-tabs>
    </template>
  </v-app-bar>

  <v-main>
    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item class="px-4 py-2">
        <v-card class="pa-4" v-if="data">
          <p>Tema</p>
          <p>{{ data.tema }}</p>
          <p>Judul</p>
          <p>{{ data.judul }}</p>
          <p>Deskripsi</p>
          <p>{{ data.deskripsi }}</p>
          <div class="d-flex justify-end">
            <v-btn :to="`/guru/p5/${idKelas}/proyek/${idProyek}/edit`">Ubah</v-btn>
          </div>
        </v-card>
        <v-card class="mt-4" v-if="targetData">
          <v-card-title>Target</v-card-title>
          <v-list>
            <template v-for="item in targetData" :key="item.id_target_p5">
              <v-list-item :to="`/guru/p5/${idKelas}/proyek/${idProyek}/target/${item.id_target_p5}`">
                <v-list-item-title>{{ item.target }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.dimensi }}</v-list-item-subtitle>
              </v-list-item>
              <v-divider />
            </template>
          </v-list>
          <div class="d-flex justify-end ma-4 mt-0">
            <v-btn :to="`/guru/p5/${idKelas}/proyek/${idProyek}/target/add`">Tambah</v-btn>
          </div>
        </v-card>
      </v-tabs-window-item>
      <v-tabs-window-item>
        <v-list v-if="catatanData">
          <template v-for="item in catatanData" :key="item.id_siswa">
            <v-list-item>
              <v-list-item-title>{{ item.nama }}</v-list-item-title>
              <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
              <v-list-item-subtitle>{{ item.catatan_proses ?? "-" }}</v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-list>
        <v-fab icon="mdi-playlist-edit" app :to="`/guru/p5/${idKelas}/proyek/${idProyek}/catatan`" />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-main>
</template>
