<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import CGuruCombobox from '../../../components/CGuruCombobox.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { usePeriodeStore } from '../../../store';
import { useRouter } from 'vue-router';
import { useRules } from 'vuetify/labs/rules';
import { SubmitEventPromise } from 'vuetify';
import { formatError } from '../../../api';

const { id } = defineProps({
  id: String
})
const emit = defineEmits(['close'])

const periodeStore = usePeriodeStore();

const nama = ref("")
const guru = ref("")

const trpc = injectTrpc();
const { mutateAsync: addAsync, error, isPending, reset } = useMutation(trpc!.operator.ekstrakurikuler.add.mutationOptions());
const { mutateAsync: updateAsync, error: updateError, isPending: updateIsPending, reset: updateReset } = useMutation(trpc!.operator.ekstrakurikuler.update.mutationOptions());

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

async function onSubmit(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    updateReset();
    return;
  }
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

const rules = useRules();
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>{{ id ? "Ubah" : "Tambah" }} Ekstrakurikuler</v-toolbar-title>
    </v-toolbar>
    <v-form @submit.prevent="onSubmit" class="px-4 py-2">
      <v-text-field :rules="[rules!.required!()]" v-model="nama" label="Nama" />
      <c-guru-combobox :rules="[rules!.required!()]" v-model="guru" label="Guru Pengampu" />
      <v-card-text class="text-error text-center pa-0 my-2" v-if="id ? updateError : error">{{ formatError(id ?
        updateError : error) }}</v-card-text>
      <v-btn class="my-2" type="submit" :loading="id ? updateIsPending : isPending">{{ id ? "Ubah" : "Tambah" }}</v-btn>
    </v-form>
  </v-card>
</template>
