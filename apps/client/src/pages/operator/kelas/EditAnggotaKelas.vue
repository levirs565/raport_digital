<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue';
import CSiswaSelect from '../../../components/CSiswaSelect.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const { id } = defineProps({
  id: String
})
const emit = defineEmits(["close"])

const trpc = injectTrpc();
const { data: kelasData } = useTrcpQuery(trpc!.operator.kelas.get.queryOptions({
  id: computed(() => id!)
}))
const { data } = useTrcpQuery(trpc!.operator.kelas.getAnggotaList.queryOptions({
  id: computed(() => id!)
}))
const { mutateAsync } = useMutation(trpc!.operator.kelas.updateAnggotaList.mutationOptions());

const anggotaKelas = reactive(new Set<string>())

watchEffect(() => {
  if (data.value) {
    anggotaKelas.clear();
    data.value.forEach(siswa => anggotaKelas.add(siswa.id_siswa))
  }
});

const queryClient = useQueryClient();
function onSave() {
  mutateAsync({
    id: id!,
    id_siswa_list: [...anggotaKelas]
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.operator.kelas.getAnggotaList.queryKey()
    })
    emit('close');
  })
}

</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Ubah Siswa Kelas</v-toolbar-title>
    </v-toolbar>

    <c-siswa-select v-if="kelasData" :periode-ajar-id="kelasData.id_periode_ajar" v-model="anggotaKelas"
      :is-item-disabled="(item: any) => item.kelas?.id_kelas && item.kelas.id_kelas != id" />
    <v-btn @click="onSave" class="ma-4 mt-0">Simpan</v-btn>
  </v-card>
</template>
