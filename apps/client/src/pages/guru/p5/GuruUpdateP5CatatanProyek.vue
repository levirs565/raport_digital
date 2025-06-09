<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const { idProyek } = defineProps({
  idKelas: String,
  idProyek: String
})
const emit = defineEmits(['close'])

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
function onSave() {
  if (!idProyek) return

  mutateAsync({
    id_proyek: idProyek,
    catatan: anggotaList.value.filter(item => !item.is_locked).map(({ id_siswa, index }) => ({
      id_siswa,
      catatan_proses: catatanList[index]
    }))
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.p5.getCatatanProsesProyek.queryKey({
        id_proyek: idProyek
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
      <v-toolbar-title>Ubah Catatan Proses</v-toolbar-title>
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
          <v-textarea :disabled="item.is_locked" class="mt-4" label="Catatan" :model-value="catatanList[item.index]"
            @update:model-value="(value) => {
              catatanList[item.index] = value;
            }" />
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
    <v-btn @click="onSave" class="mx-4 my-2">Simpan</v-btn>
  </v-card>
</template>
