<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CSiswaSelect from '../../../components/CSiswaSelect.vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const { id } = defineProps({
  id: String
})
const emit = defineEmits(['close'])

const trpc = injectTrpc();
const { data: ekstrakurikulerData } = useTrcpQuery(trpc!.guru.ekstrakurikuler.get.queryOptions({
  id: computed(() => id!)
}))
const { data } = useTrcpQuery(trpc!.guru.ekstrakurikuler.getAnggotaList.queryOptions({
  id: computed(() => id!)
}))
const { mutateAsync } = useMutation(trpc!.guru.ekstrakurikuler.updateAnggotaList.mutationOptions());

const anggotaList = reactive(new Set<string>());
watchEffect(() => {
  if (data.value) {
    anggotaList.clear();
    data.value.forEach((siswa) => anggotaList.add(siswa.id_siswa))
  }
})

const queryClient = useQueryClient();
function onSave() {
  mutateAsync({
    id: id!,
    id_siswa_list: [...anggotaList]
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.ekstrakurikuler.getAnggotaList.queryKey()
    })
    emit('close')
  })
}

</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Ubah Anggota Ekstrakurikuler</v-toolbar-title>
    </v-toolbar>

    <c-siswa-select v-if="ekstrakurikulerData" :periode-ajar-id="ekstrakurikulerData.id_periode_ajar" v-model="anggotaList" />
    <v-btn @click="onSave" class="ma-4 mt-0">Simpan</v-btn>
  </v-card>
</template>
