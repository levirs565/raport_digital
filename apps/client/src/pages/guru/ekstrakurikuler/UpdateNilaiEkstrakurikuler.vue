<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const { id } = defineProps({
  id: String
})
const emit = defineEmits(['close'])

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
function onSave() {
  mutateAsync({
    id: id!,
    nilai: anggotaList.value.filter((item) => !item.is_locked).map(({ id_siswa, index }) => ({
      id_siswa,
      nilai: nilaiList[index].nilai ?? undefined,
      keterangan: nilaiList[index].keterangan ?? undefined
    }))
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.ekstrakurikuler.getAnggotaList.queryKey()
    })
    emit('close');
  })
}

</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Ubah Nilai Ekstrakurikuler</v-toolbar-title>
    </v-toolbar>

    <div class="px-4 pt-2">
      <v-text-field label="Filter" v-model="filter" />
    </div>
    <v-list>
      <template v-for="item in filteredAnggotaList" :key="item.id_siswa">
        <v-list-item>
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
          <v-list-item-subtitle v-if="item.is_locked" class="items-center">
            <v-icon size="small" class="mr-2">mdi-lock</v-icon>
            <span>Nilai Dikunci</span>
          </v-list-item-subtitle>
          <v-select :disabled="item.is_locked" class="mt-2" label="Nilai" :items="nilaiItems"
            :model-value="nilaiList[item.index].nilai" @update:model-value="(value) => {
              nilaiList[item.index].nilai = value;
            }" />
          <v-textarea :disabled="item.is_locked" label="Catatan" :model-value="nilaiList[item.index].keterangan"
            @update:model-value="(value) => {
              nilaiList[item.index].keterangan = value;
            }" />
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
    <v-btn @click="onSave" class="mx-4 my-2">Simpan</v-btn>
  </v-card>
</template>
