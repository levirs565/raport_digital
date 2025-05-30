<script setup lang="ts">
import { computed, ref } from 'vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { id } = defineProps({
  id: String
})

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

const { mutateAsync: addAsync } = useMutation(trpc!.operator.kelas.addMataPelajaran.mutationOptions());

const queryClient = useQueryClient();
const router = useRouter();
function onSubmit() {
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
    router.back();
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Tambah Mata Pelajaran</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <form class="px-4 py-2">
      <v-combobox v-model="selectedMataPelajaran" :items="dataMataPelajaran" item-title="nama"
        item-value="id_mata_pelajaran" :return-object="false" />
      <v-combobox v-model="selectedGuru" :items="dataPengampu?.guru" item-title="nama_lengkap" item-value="username"
        :return-object="false" />
      <v-btn @click="onSubmit">Tambah</v-btn>
    </form>
  </v-main>
</template>
