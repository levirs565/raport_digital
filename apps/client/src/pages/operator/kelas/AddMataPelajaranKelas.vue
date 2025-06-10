<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { formatError } from '../../../api';
import { useRules } from 'vuetify/labs/rules';
import { SubmitEventPromise } from 'vuetify';

const { id } = defineProps({
  id: String,
  idMataPelajaran: String,
})
const emit = defineEmits(["close"])

const trpc = injectTrpc();
const { data: dataKelas } = useTrcpQuery(trpc!.operator.kelas.get.queryOptions({
  id: computed(() => id!)
}))

const { data: dataMataPelajaran } = useTrcpQuery(trpc!.operator.mataPelajaran.getAll.queryOptions({
  periodeAjarId: computed(() => dataKelas.value?.id_periode_ajar!)
}, {
  enabled: computed(() => !!dataKelas.value) as unknown as boolean
}));

const selectedMataPelajaran = ref<string>();

const { data: dataPengampu } = useTrcpQuery(trpc!.operator.mataPelajaran.get.queryOptions({
  id: computed(() => selectedMataPelajaran.value!)
}, {
  enabled: computed(() => !!selectedMataPelajaran.value) as unknown as boolean
}))


const selectedGuru = ref<string>();

const { mutateAsync: addAsync, error, isPending, reset } = useMutation(trpc!.operator.kelas.addMataPelajaran.mutationOptions());
// TODO: Add update
const { mutateAsync: updateAsync, error: updateError, isPending: updateIsPending, reset: updateReset } = useMutation(trpc!.operator.kelas.addMataPelajaran.mutationOptions());



const queryClient = useQueryClient();
async function onSubmit(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    updateReset();
    return;
  }

  if (!dataKelas.value || !selectedMataPelajaran.value || !selectedGuru.value) return;
  const update = () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.operator.kelas.getMataPelajaranList.queryKey()
    })
  }
  addAsync({
    id: id!,
    id_mata_pelajaran: selectedMataPelajaran.value,
    username_guru: selectedGuru.value
  }).then(() => {
    update();
    emit('close')
  })
}

const rules = useRules();
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Tambah Mata Pelajaran</v-toolbar-title>
    </v-toolbar>

    <v-form @submit.prevent="onSubmit" class="px-4 py-2">
      <v-combobox :rules="[rules!.required!()]" v-model="selectedMataPelajaran" :items="dataMataPelajaran"
        item-title="nama" item-value="id_mata_pelajaran" :return-object="false" />
      <v-combobox :rules="[rules!.required!()]" v-model="selectedGuru" :items="dataPengampu?.guru"
        item-title="nama_lengkap" item-value="username" :return-object="false" />
      <v-card-text class="text-error text-center pa-0 my-2" v-if="idMataPelajaran ? updateError : error">{{ formatError(idMataPelajaran ?
        updateError : error) }}</v-card-text>
      <v-btn class="my-2" type="submit" :loading="idMataPelajaran ? updateIsPending : isPending">Tambah</v-btn>
    </v-form>
  </v-card>
</template>
