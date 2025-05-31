<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { reactive } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { idKelas, idMataPelajaran, idMateri } = defineProps({
  idKelas: String,
  idMataPelajaran: String,
  idMateri: String
})

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.mataPelajaran.getNilaiMateri.queryOptions({
  id: computed(() => idMateri!)
}))
const { mutateAsync } = useMutation(trpc!.guru.mataPelajaran.updateNilaiMateri.mutationOptions());

type NilaiListType = Extract<typeof data["value"], Array<any>>
type NilaiItemType = NilaiListType extends Array<infer U> ? U : never

const anggotaList = ref<Array<Omit<NilaiItemType, "nilai"> & { index: number }>>([])
const nilaiList = reactive<Array<number>>([])

watchEffect(() => {
  if (data.value) {
    anggotaList.value = data.value.map(({ nilai, ...rest }, index) => ({
      ...rest,
      index
    }))
    nilaiList.length = 0;
    nilaiList.push(...data.value.map(({ nilai }) => nilai))
  }
})

const filter = ref("");

const filteredList = computed(() => {
  const filterNama = filter.value.toLocaleLowerCase();
  return anggotaList.value.filter((anggota) => anggota.nama.toLocaleLowerCase().includes(filterNama))
})

const queryClient = useQueryClient();
const router = useRouter();
function onSave() {
  if (!idMateri) return;

  mutateAsync({
    id: idMateri!,
    nilai: anggotaList.value.map(({ id_siswa, index }) => ({
      id_siswa,
      nilai: nilaiList[index]
    }))
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.mataPelajaran.getNilaiMateri.queryKey({
        id: idMateri!
      })
    })
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.mataPelajaran.getTotalNilai.queryKey({
        id_kelas: idKelas!,
        id_mata_pelajaran: idMataPelajaran!
      })
    })
    router.back();
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Ubah Nilai</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <div class="px-4 pt-2">
      <v-text-field label="Filter" v-model="filter" />
    </div>
    <v-list>
      <template v-for="item in filteredList" :key="item.id_siswa">
        <v-list-item>
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
          <v-number-input class="py-2" label="Nilai" :model-value="nilaiList[item.index]" @update:model-value="(value) => {
            nilaiList[item.index] = value;
          }" :min="0" :max="100" />
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
    <v-btn @click="onSave" class="mx-4 my-2">Simpan</v-btn>
  </v-main>
</template>
