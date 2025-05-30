<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { usePeriodeStore } from '../../../store';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import GuruSelectCard from '../../../components/GuruSelectCard.vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { id } = defineProps({
  id: String
})

const periodeStore = usePeriodeStore();

const trpc = injectTrpc();
const { mutateAsync: addAsync } = useMutation(trpc!.operator.mataPelajaran.add.mutationOptions())
const { mutateAsync: updateAsync } = useMutation(trpc!.operator.mataPelajaran.update.mutationOptions());

const nama = ref("");
const kelompok = ref("");
const guruList = reactive<Set<string>>(new Set());

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
    data.value.guru.forEach(guru => guruList.add(guru.username));
  }
})

const queryClient = useQueryClient();
const router = useRouter();
function onSubmit() {
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
      router.back();
    })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>{{ id ? "Ubah" : "Tambah" }} Mata Pelajaran</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-form class="px-4 py-2">
      <v-text-field v-model="nama" label="Nama Mata Pelajaran" />
      <v-text-field v-model="kelompok" label="Kelompok" />
      <GuruSelectCard v-model="guruList" />
      <v-btn class="my-2" @click="onSubmit">{{ id ? "Ubah" : "Tambah" }} </v-btn>
    </v-form>
  </v-main>

  <v-fab icon="mdi-plus" app to="/operator/mata-pelajaran/add" />
</template>
