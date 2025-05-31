<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { id } = defineProps({
  id: String
})

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.ekstrakurikuler.getAnggotaList.queryOptions({
  id: computed(() => id!)
}))
const { mutateAsync } = useMutation(trpc!.guru.ekstrakurikuler.updateNilai.mutationOptions());

type AnggotaListType = Extract<typeof data["value"], Array<any>>;
type AnggotaItemType = AnggotaListType extends Array<infer U> ? U : never;

const anggotaList = ref<(Omit<AnggotaItemType, "nilai" | "keterangan"> & { index: number })[]>([]);
const nilaiList = reactive<Pick<AnggotaItemType, "nilai" | "keterangan">[]>([])

watchEffect(() => {
  if (data.value) {
    anggotaList.value = data.value.map(({ nilai, keterangan, ...rest }, index) => ({ ...rest, index }))
    nilaiList.length = 0;
    nilaiList.push(...data.value.map(({ nilai, keterangan }) => ({ nilai, keterangan })));
  }
})

const filter = ref("");

const filteredAnggotaList = computed(() => {
  const namaFilter = filter.value.toLocaleLowerCase();
  return anggotaList.value.filter((anggota) => anggota.nama.toLocaleLowerCase().includes(namaFilter))
})

const nilaiItems = [
  {
    value: 'SANGAT_BAIK',
    title: "Sangat Baik"
  },
  {
    value: 'BAIK',
    title: "Baik"
  },
  {
    value: 'CUKUP',
    title: "Cukup"
  },
  {
    value: 'KURANG',
    title: "Kurang"
  }
];


const queryClient = useQueryClient();
const router = useRouter();
function onSave() {
  mutateAsync({
    id: id!,
    nilai: anggotaList.value.map(({ id_siswa, index }) => ({
      id_siswa,
      nilai: nilaiList[index].nilai ?? undefined,
      keterangan: nilaiList[index].keterangan ?? undefined
    }))
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.ekstrakurikuler.getAnggotaList.queryKey()
    })
    router.back();
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Ubah Nilai Ekstrakurikuler</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <div class="px-4 pt-2">
      <v-text-field label="Filter" v-model="filter" />
    </div>
    <v-list>
      <template v-for="item in filteredAnggotaList" :key="item.id_siswa">
        <v-list-item>
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
          <v-select class="py-2" label="Nilai" :items="nilaiItems" :model-value="nilaiList[item.index].nilai"
            @update:model-value="(value) => {
              nilaiList[item.index].nilai = value;
            }" />
          <v-textarea label="Catatan" :model-value="nilaiList[item.index].keterangan" @update:model-value="(value) => {
            nilaiList[item.index].keterangan = value;
          }" />
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
    <v-btn @click="onSave" class="mx-4 my-2">Simpan</v-btn>
  </v-main>
</template>
