<script setup lang="ts">
import CExpandable from '../../../components/CExpandable.vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { computed, ref } from 'vue';
import { NilaiEkstrakurikulerType } from '@raport-digital/client-api-types';

const { id } = defineProps({
  id: String
})
const idComputed = computed(() => id!)

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.ekstrakurikuler.get.queryOptions({
  id: idComputed
}))
const { data: anggotaData } = useTrcpQuery(trpc!.guru.ekstrakurikuler.getAnggotaList.queryOptions({
  id: idComputed
}))

const filter = ref("");

const anggotaList = computed(() => {
  const namaFilter = filter.value.toLocaleLowerCase();
  return anggotaData.value?.filter((siswa) => siswa.nama.toLocaleLowerCase().includes(namaFilter))
})

const nilaiMap: Record<NilaiEkstrakurikulerType, string> = {
  SANGAT_BAIK: 'Sangat Baik',
  BAIK: 'Baik',
  CUKUP: 'Cukup',
  KURANG: 'Kurang'
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>{{ data?.nama }}</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <div class="px-4 py-2">
      <v-btn :to="`/guru/ekstrakurikuler/${id}/anggota`">Ubah Anggota</v-btn>
      <v-btn :to="`/guru/ekstrakurikuler/${id}/nilai`" class="ml-2">Ubah Nilai</v-btn>
    </div>
    <div class="px-4 pt-2">
      <v-text-field v-model="filter" label="Filter" />
    </div>

    <v-list>
      <template v-for="item in anggotaList" :key="item.id_siswa">
        <div>
          <c-expandable>
            <template v-slot:header="{ isOpen, toggle }">
              <v-list-item>
                <v-list-item-title>{{ item.nama }}</v-list-item-title>
                <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn variant="text" icon color="text" @click="toggle">
                    <v-icon>{{ isOpen ? "mdi-chevron-up" : "mdi-chevron-down" }}</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </template>
            <template v-slot:content>
              <div class="px-4 pb-2">
                <p>Nilai</p>
                <p>{{ item.nilai ? nilaiMap[item.nilai] : "-" }}</p>
                <p>Catatan</p>
                <p>{{ item.keterangan ?? "-" }}</p>
                <div class="d-flex justify-end">
                  <v-btn variant="text" icon color="text">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </div>
              </div>
            </template>
          </c-expandable>
        </div>
        <v-divider />
      </template>
    </v-list>
  </v-main>
</template>
