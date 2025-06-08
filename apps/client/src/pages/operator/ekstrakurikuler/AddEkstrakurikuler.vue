<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import CGuruCombobox from '../../../components/CGuruCombobox.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { usePeriodeStore } from '../../../store';
import { useRouter } from 'vue-router';

const { id } = defineProps({
  id: String
})
const emit = defineEmits(['close'])

const periodeStore = usePeriodeStore();

const nama = ref("")
const guru = ref("")

const trpc = injectTrpc();
const { mutateAsync: addAsync } = useMutation(trpc!.operator.ekstrakurikuler.add.mutationOptions());
const { mutateAsync: updateAsync } = useMutation(trpc!.operator.ekstrakurikuler.update.mutationOptions());

const { data } = useTrcpQuery(trpc!.operator.ekstrakurikuler.get.queryOptions({
  id: computed(() => id!)
}, {
  enabled: computed(() => !!id) as unknown as boolean
}))

watchEffect(() => {
  if (data.value) {
    nama.value = data.value.nama;
    guru.value = data.value.guru.username;
  }
})

const queryClient = useQueryClient();
const router = useRouter();

function onSubmit() {
  if (!periodeStore.selectedPeriode) return;
  const update = () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.operator.ekstrakurikuler.getAll.queryKey()
    })
    if (id)
      queryClient.invalidateQueries({
        queryKey: trpc!.operator.ekstrakurikuler.get.queryKey({
          id
        })
      })
  }
  if (!id)
    addAsync({
      nama: nama.value,
      usernameGuru: guru.value,
      periodeAjarId: periodeStore.selectedPeriode
    }).then((id) => {
      update();
      router.push(`/operator/ekstrakurikuler/${id}`)
    })
  else
    updateAsync({
      nama: nama.value,
      usernameGuru: guru.value,
      id: id
    }).then(() => {
      update();
      emit('close')
    })
}
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>{{ id ? "Ubah" : "Tambah" }} Ekstrakurikuler</v-toolbar-title>
    </v-toolbar>
    <v-form class="px-4 py-2">
      <v-text-field v-model="nama" label="Nama" />
      <c-guru-combobox v-model="guru" label="Guru Pengampu" />
      <v-btn @click="onSubmit">{{ id ? "Ubah" : "Tambah" }}</v-btn>
    </v-form>
  </v-card>
</template>
