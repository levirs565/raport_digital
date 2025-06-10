<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { usePeriodeStore } from '../../../store';
import GuruSelectCard from '../../../components/GuruSelectCard.vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { useRules } from 'vuetify/labs/rules';
import { formatError } from '../../../api';
import { SubmitEventPromise } from 'vuetify';

const { id } = defineProps({
  id: String
})
const emit = defineEmits(['close'])

const periodeStore = usePeriodeStore();

const trpc = injectTrpc();
const { mutateAsync: addAsync, error, isPending, reset } = useMutation(trpc!.operator.mataPelajaran.add.mutationOptions())
const { mutateAsync: updateAsync, error: updateError, isPending: updateIsPending, reset: updateReset } = useMutation(trpc!.operator.mataPelajaran.update.mutationOptions());

const nama = ref("");
const kelompok = ref("");
const guruList = reactive<Set<string>>(new Set());
const lockedGuruList = reactive(new Set<string>());

const { data } = useTrcpQuery(trpc!.operator.mataPelajaran.get.queryOptions({
  id: id!
}, {
  enabled: computed(() => !!id) as unknown as boolean
}))

watchEffect(() => {
  if (data.value) {
    nama.value = data.value.nama;
    kelompok.value = data.value.kelompok_mapel ?? "";
    guruList.clear();
    lockedGuruList.clear();
    data.value.guru.forEach(guru => {
      guruList.add(guru.username);
      if (guru.is_locked) lockedGuruList.add(guru.username)
    });
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
  const kelompokValue = kelompok.value == "" ? undefined : kelompok.value;
  const update = () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.operator.mataPelajaran.getAll.queryKey()
    })
    if (id)
      queryClient.invalidateQueries({
        queryKey: trpc!.operator.mataPelajaran.get.queryKey({
          id
        })
      })
  }
  if (!id)
    addAsync({
      name: nama.value,
      kelompok: kelompokValue,
      guruPengampu: [...guruList],
      periodeAjarId: periodeStore.selectedPeriode
    }).then((id) => {
      update();
      router.replace(`/operator/mata-pelajaran/${id}`)
    })
  else
    updateAsync({
      id,
      name: nama.value,
      kelompok: kelompokValue,
      guruPengampu: [...guruList],
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
      <v-toolbar-title>{{ id ? "Ubah" : "Tambah" }} Mata Pelajaran</v-toolbar-title>
    </v-toolbar>

    <v-form @submit.prevent="onSubmit" class="px-4 py-2">
      <v-text-field :rules="[rules!.required!()]" v-model="nama" label="Nama Mata Pelajaran" />
      <v-text-field v-model="kelompok" label="Kelompok" />
      <GuruSelectCard :is-item-disabled="(item: any) => lockedGuruList.has(item.username)" v-model="guruList" />
      <v-card-text class="text-error text-center pa-0 my-2" v-if="id ? updateError : error">{{ formatError(id ?
        updateError : error) }}</v-card-text>
      <v-btn class="my-2" type="submit" :loading="id ? updateIsPending : isPending">{{ id ? "Ubah" : "Tambah" }}
      </v-btn>
    </v-form>
  </v-card>
</template>
