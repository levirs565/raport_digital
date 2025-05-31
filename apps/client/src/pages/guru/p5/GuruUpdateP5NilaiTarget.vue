<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { NilaiP5Type } from '@raport-digital/client-api-types';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { idTarget } = defineProps({
  idKelas: String,
  idProyek: String,
  idTarget: String
})

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.guru.p5.getNilaiTarget.queryOptions({
  id_target: computed(() => idTarget!)
}))
const { mutateAsync } = useMutation(trpc!.guru.p5.updateNilaiTarget.mutationOptions());

type NilaiListType = Extract<typeof data["value"], Array<any>>;
type NilaiItemType = NilaiListType extends Array<infer U> ? U : never;

const anggotaList = ref<Array<Omit<NilaiItemType, "nilai"> & { index: number }>>([])
const nilaiList = reactive<Array<NilaiP5Type | undefined>>([])

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
const filterdList = computed(() => {
  const filterNama = filter.value.toLocaleLowerCase();
  return anggotaList.value.filter(({ nama }) => nama.toLocaleLowerCase().includes(filterNama))
})

const nilaiItems = [
  { value: "MULAI_BERKEMBANG", title: 'Mulai Berkembang' },
  { value: "SEDANG_BERKEMBANG", title: 'Sedang Berkembang' },
  { value: "BERKEMBANG_SESUAI_HARAPAN", title: 'Berkembang Sesuai Harapan' },
  { value: "SANGAT_BERKEMBANG", title: 'Sangat Berkembang' }
]

const queryClient = useQueryClient();
const router = useRouter();
function onSave() {
  if (!idTarget) return;

  mutateAsync({
    id_target: idTarget,
    nilai: anggotaList.value.map(({ id_siswa, index }) => ({
      id_siswa,
      nilai: nilaiList[index]
    }))
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.p5.getNilaiTarget.queryKey({
        id_target: idTarget
      })
    })
    router.back();
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Ubah Nilai Target</v-app-bar-title>
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
          <v-select class="mt-2" :items="nilaiItems" label="Nilai" :model-value="nilaiList[item.index]"
            @update:model-value="(value) => {
              nilaiList[item.index] = value;
            }" />
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
    <v-btn @click="onSave" class="mx-4 my-2">Simpan</v-btn>
  </v-main>
</template>
