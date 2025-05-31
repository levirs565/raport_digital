<script setup lang="ts">
import { computed, ref } from 'vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { watchEffect } from 'vue';

const { idProyek, idKelas, idTarget } = defineProps({
  idKelas: String,
  idProyek: String,
  idTarget: String
})

const dimensi = ref("");
const elemen = ref("");
const subelemen = ref("");
const target = ref("");

const trpc = injectTrpc();
const { mutateAsync: addAsync } = useMutation(trpc!.guru.p5.addTarget.mutationOptions())
const { mutateAsync: updateAsync } = useMutation(trpc!.guru.p5.updateTarget.mutationOptions());
const { data } = useTrcpQuery(trpc!.guru.p5.getTarget.queryOptions({
  id_target: computed(() => idTarget!)
}, {
  enabled: computed(() => !!idTarget) as unknown as boolean
}))

watchEffect(() => {
  if (data.value) {
    dimensi.value = data.value.dimensi;
    elemen.value = data.value.elemen;
    subelemen.value = data.value.subelemen;
    target.value = data.value.target;
  }
})

const queryClient = useQueryClient();
const router = useRouter();

function onSubmit() {
  if (!idProyek) return;

  const update = () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.guru.p5.getAllTarget.queryKey({
        id_proyek: idProyek
      })
    })
    if (idTarget)
      queryClient.invalidateQueries({
        queryKey: trpc!.guru.p5.getTarget.queryKey({
          id_target: idTarget
        })
      })
  }

  if (!idTarget)
    addAsync({
      dimensi: dimensi.value,
      elemen: elemen.value,
      subelemen: subelemen.value,
      target: target.value,
      id_proyek: idProyek
    }).then((id) => {
      update();
      router.replace(`/guru/p5/${idKelas}/proyek/${idProyek}/target/${id}`)
    })
  else
    updateAsync({
      dimensi: dimensi.value,
      elemen: elemen.value,
      subelemen: subelemen.value,
      target: target.value,
      id_target: idTarget
    }).then(() => {
      update();
      router.back();
    })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>{{ idTarget ? 'Ubah' : 'Tambah' }} Target</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-form class="px-4 py-2">
      <v-text-field v-model="dimensi" label="Dimensi" />
      <v-text-field v-model="elemen" label="Elemen" />
      <v-text-field v-model="subelemen" label="Subelemen" />
      <v-text-field v-model="target" label="Target" />
      <v-btn @click="onSubmit">{{ idTarget ? 'Ubah' : 'Tambah' }}</v-btn>
    </v-form>
  </v-main>
</template>
