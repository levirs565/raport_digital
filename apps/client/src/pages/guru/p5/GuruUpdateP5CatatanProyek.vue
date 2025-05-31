<script setup lang="ts">
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { computed, reactive, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { idProyek } = defineProps({
  idKelas: String,
  idProyek: String
})

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.p5.getCatatanProsesProyek.queryOptions({
  id_proyek: computed(() => idProyek!)
}))
const { mutateAsync } = useMutation(trpc!.guru.p5.updateCatatanProsesProyek.mutationOptions());

type NilaiListType = Extract<typeof data["value"], Array<any>>;
type NilaiItemType = NilaiListType extends Array<infer U> ? U : never;

const anggotaList = ref<Array<Omit<NilaiItemType, "catatan_proses"> & { index: number }>>([])
const catatanList = reactive<(string | undefined)[]>([])

watchEffect(() => {
  if (data.value) {
    anggotaList.value = data.value.map(({ catatan_proses, ...rest }, index) => ({
      ...rest,
      index
    }))
    catatanList.length = 0;
    catatanList.push(...data.value.map(({ catatan_proses }) => catatan_proses))
  }
})

const filter = ref("");
const filterdList = computed(() => {
  const filterNama = filter.value.toLocaleLowerCase();
  return anggotaList.value.filter(({ nama }) => nama.toLocaleLowerCase().includes(filterNama))
})

const queryClient = useQueryClient();
const router = useRouter();
function onSave() {
  if (!idProyek) return

  mutateAsync({
    id_proyek: idProyek,
    catatan: anggotaList.value.map(({ id_siswa, index }) => ({
      id_siswa,
      catatan_proses: catatanList[index]
    }))
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.p5.getCatatanProsesProyek.queryKey({
        id_proyek: idProyek
      })
    })
    router.back();
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Ubah Catatan Proses</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <div class="px-4 pt-2">
      <v-text-field v-model="filter" label="Filter" />
    </div>
    <v-list>
      <template v-for="item in filterdList">
        <v-list-item>
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
          <v-textarea class="mt-4" label="Nilai" :model-value="catatanList[item.index]" @update:model-value="(value) => {
            catatanList[item.index] = value;
          }" />
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
    <v-btn @click="onSave" class="mx-4 my-2">Simpan</v-btn>
  </v-main>
</template>
