<script setup lang="ts">
import { SemesterType } from '@raport-digital/client-api-types';
import { computed, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { SubmitEventPromise } from 'vuetify';
import { useRules } from 'vuetify/labs/rules';
import { formatError } from '../../../api';

const { id } = defineProps({
  id: String
})
const emit = defineEmits(['close'])

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
const { mutateAsync: addAsync, error, isPending, reset } = useMutation(trpc!.operator.periodeAjar.add.mutationOptions())
const { mutateAsync: updateAsync, error: updateError, isPending: updateIsPending, reset: updateReset } = useMutation(trpc!.operator.periodeAjar.update.mutationOptions());

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

async function onSubmit(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    updateReset();
    return;
  }

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
      emit('close')
    })
}

const rules = useRules();
</script>
<template>
  <v-form @submit.prevent="onSubmit">
    <v-card>
      <v-toolbar color="surface">
        <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
        <v-app-bar-title>{{ id ? "Ubah" : "Tambah" }} Periode Ajar</v-app-bar-title>
      </v-toolbar>
      <div class="px-4 py-2">
        <v-select :rules="[rules!.required!()]" label="Tahun Ajaran" v-model="selectedTahunAjar"
          :items="tahunAjarSelectItems" />
        <v-select :rules="[rules!.required!()]" label="Semester" v-model="selectedSemester"
          :items="semesterSelectItems" />
        <v-card-text class="text-error text-center pa-0 my-2" v-if="id ? updateError : error">{{ formatError(id ? updateError : error) }}</v-card-text>
        <v-btn class="my-2" type="submit" :loading="id ? updateIsPending : isPending">{{ id ? "Ubah" : "Tambah" }}</v-btn>
      </div>
    </v-card>
  </v-form>
</template>
