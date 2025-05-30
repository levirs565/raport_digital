<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import CSiswaSelect from '../../../components/CSiswaSelect.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';

const { id } = defineProps({
  id: String
})

const trpc = injectTrpc();
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
const router = useRouter();
function onSave() {
  mutateAsync({
    id: id!,
    id_siswa_list: [...anggotaKelas]
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.operator.kelas.getAnggotaList.queryKey()
    })
    router.back();
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Ubah Siswa Kelas</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <c-siswa-select v-model="anggotaKelas" />
    <v-btn @click="onSave" class="ma-4 mt-0">Simpan</v-btn>
  </v-main>
</template>
