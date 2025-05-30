<script setup lang="ts">
import { SemesterType } from '@raport-digital/client-api-types';
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { id } = defineProps({
  id: String
})

const tahunAjarItems: number[] = [];
for (let i = 2000; i <= new Date().getFullYear(); i++) {
  tahunAjarItems.push(i);
}

const tahunAjarSelectItems = tahunAjarItems.map((tahun) => ({
  value: tahun,
  title: `${tahun}/${tahun + 1}`
}));

const semesterSelectItems = [
  {
    value: "GANJIL",
    title: "Ganjil"
  }, {
    value: "GENAP",
    title: "Genap"
  }
]

const selectedTahunAjar = ref<number>();
const selectedSemester = ref<SemesterType>();

const trpc = injectTrpc();
const queryClient = useQueryClient();
const { mutateAsync: addAsync } = useMutation(trpc!.operator.periodeAjar.add.mutationOptions())
const { mutateAsync: updateAsync } = useMutation(trpc!.operator.periodeAjar.update.mutationOptions());

const { data } = useTrcpQuery(trpc!.operator.periodeAjar.get.queryOptions({
  id: id!
}, {
  enabled: computed(() => !!id) as unknown as boolean
}))

watchEffect(() => {
  if (data.value) {
    selectedTahunAjar.value = data.value.tahunAjar;
    selectedSemester.value = data.value.semester;
  }
})

const router = useRouter();

function onSubmit() {
  if (!selectedTahunAjar.value || !selectedSemester.value) return;
  const update = () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.common.getAllPeriodeAjar.queryKey()
    })
    if (id)
      queryClient.invalidateQueries({
        queryKey: trpc!.operator.periodeAjar.get.queryKey({
          id
        })
      })
  }
  if (!id)
    addAsync({
      tahunAjar: selectedTahunAjar.value,
      semester: selectedSemester.value
    }).then((id) => {
      update();
      router.replace(`/operator/periode/${id}`);
    })
  else
    updateAsync({
      id,
      tahunAjar: selectedTahunAjar.value,
      semester: selectedSemester.value
    }).then(() => {
      update();
      router.back()
    })
}

</script>
<template>
  <v-app-bar>
    <v-app-bar-title>{{ id ? "Ubah" : "Tambah" }} Periode Ajar</v-app-bar-title>
  </v-app-bar>
  <v-main>
    <v-form class="px-4 py-2">
      <v-select label="Tahun Ajaran" v-model="selectedTahunAjar" :items="tahunAjarSelectItems" />
      <v-select label="Semester" v-model="selectedSemester" :items="semesterSelectItems" />
      <v-btn @click="onSubmit">{{ id ? "Ubah" : "Tambah" }}</v-btn>
    </v-form>
  </v-main>
</template>
