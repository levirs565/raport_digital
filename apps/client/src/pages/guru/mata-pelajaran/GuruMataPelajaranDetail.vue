<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import CNilaiMataPelajaranList from '../../../components/CNilaiMataPelajaranList.vue';
import GuruAddMateri from './GuruAddMateri.vue';

const { idKelas, idMataPelajaran } = defineProps({
  idKelas: String,
  idMataPelajaran: String
})

const trpc = injectTrpc();

const idComputed = computed(() => ({
  id_kelas: idKelas!,
  id_mata_pelajaran: idMataPelajaran!
}));

const { data } = useTrcpQuery(trpc!.guru.mataPelajaran.get.queryOptions(idComputed))
const { data: materiData } = useTrcpQuery(trpc!.guru.mataPelajaran.getMateriList.queryOptions(idComputed))
const { data: nilaiData } = useTrcpQuery(trpc!.guru.mataPelajaran.getTotalNilai.queryOptions(idComputed));

const activeTab = ref(0);

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Kelas {{ data?.kelas.kelas }}-{{ data?.kelas.kode_ruang_kelas }} - {{
      data?.mata_pelajaran.nama }}</v-app-bar-title>
    <template v-slot:extension>
      <v-tabs grow v-model="activeTab">
        <v-tab>Materi</v-tab>
        <v-tab>Nilai Total</v-tab>
      </v-tabs>
    </template>
  </v-app-bar>

  <v-main>
    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item>
        <v-list>
          <template v-for="item in materiData" :key="item.id_materi">
            <v-list-item :to="`/guru/mata-pelajaran/${idKelas}/${idMataPelajaran}/materi/${item.id_materi}`">
              <v-list-item-title>{{ item.nama }}</v-list-item-title>
            </v-list-item>
            <v-divider />
          </template>
        </v-list>
        <v-dialog persistent>
          <template v-slot:activator="{ props }">
            <v-fab icon="mdi-plus" app v-bind="props" />
          </template>
          <template v-slot:default="{ isActive }">
            <guru-add-materi :id-kelas="idKelas" :id-mata-pelajaran="idMataPelajaran"
              @close="isActive.value = !isActive.value" />
          </template>
        </v-dialog>
      </v-tabs-window-item>
      <v-tabs-window-item>
        <c-nilai-mata-pelajaran-list :data="nilaiData" />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-main>
</template>
