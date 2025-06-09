<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { NilaiP5Type } from '@raport-digital/client-api-types';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const { idTarget } = defineProps({
  idKelas: String,
  idProyek: String,
  idTarget: String
})
const emit = defineEmits(['close'])

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
function onSave() {
  if (!idTarget) return;

  mutateAsync({
    id_target: idTarget,
    nilai: anggotaList.value.filter(item => !item.is_locked).map(({ id_siswa, index }) => ({
      id_siswa,
      nilai: nilaiList[index]
    }))
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.p5.getNilaiTarget.queryKey({
        id_target: idTarget
      })
    })
    emit('close')
  })
}

</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Ubah Nilai Target</v-toolbar-title>
    </v-toolbar>

    <div class="px-4 pt-2">
      <v-text-field v-model="filter" label="Filter" />
    </div>
    <v-list>
      <template v-for="item in filterdList">
        <v-list-item>
          <v-list-item-title>{{ item.nama }}</v-list-item-title>
          <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
          <v-list-item-subtitle v-if="item.is_locked" class="items-center">
            <v-icon size="small" class="mr-2">mdi-lock</v-icon>
            <span>Nilai Dikunci</span>
          </v-list-item-subtitle>
          <v-select :disabled="item.is_locked" class="mt-2" :items="nilaiItems" label="Nilai"
            :model-value="nilaiList[item.index]" @update:model-value="(value) => {
              nilaiList[item.index] = value;
            }" />
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
    <v-btn @click="onSave" class="mx-4 my-2">Simpan</v-btn>
  </v-card>
</template>
