<script setup lang="ts">
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { watchEffect } from 'vue';
import { formatError } from '../../../api';
import { useRules } from 'vuetify/labs/rules';
import { SubmitEventPromise } from 'vuetify';

const { idProyek, idKelas, idTarget } = defineProps({
  idKelas: String,
  idProyek: String,
  idTarget: String
})
const emit = defineEmits(['close']);

const dimensi = ref("");
const elemen = ref("");
const subelemen = ref("");
const target = ref("");

const trpc = injectTrpc();
const { mutateAsync: addAsync, error, isPending, reset } = useMutation(trpc!.guru.p5.addTarget.mutationOptions())
const { mutateAsync: updateAsync, error: updateError, isPending: updateIsPending, reset: updateReset } = useMutation(trpc!.guru.p5.updateTarget.mutationOptions());
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

async function onSubmit(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    updateReset();
    return;
  }

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
      router.push(`/guru/p5/${idKelas}/proyek/${idProyek}/target/${id}`)
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
      emit('close');
    })
}

const rules = useRules()
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>{{ idTarget ? 'Ubah' : 'Tambah' }} Target</v-toolbar-title>
    </v-toolbar>

    <v-form class="px-4 py-2" @submit.prevent="onSubmit">
      <v-text-field :rules="[rules!.required!()]" v-model="dimensi" label="Dimensi" />
      <v-text-field :rules="[rules!.required!()]" v-model="elemen" label="Elemen" />
      <v-text-field :rules="[rules!.required!()]" v-model="subelemen" label="Subelemen" />
      <v-text-field :rules="[rules!.required!()]" v-model="target" label="Target" />
      <v-card-text class="text-error text-center pa-0 my-2" v-if="idTarget ? updateError : error">{{
        formatError(idTarget ?
          updateError : error) }}</v-card-text>
      <v-btn class="my-2" type="submit" :loading="idTarget ? updateIsPending : isPending">{{ idTarget ? 'Ubah' :
        'Tambah' }}</v-btn>
    </v-form>
  </v-card>
</template>
