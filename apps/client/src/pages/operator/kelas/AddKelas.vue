<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue';
import CGuruCombobox from '../../../components/CGuruCombobox.vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { usePeriodeStore } from '../../../store';
import { useRouter } from 'vue-router';
import { useRules } from 'vuetify/labs/rules';
import { formatError } from '../../../api';
import { SubmitEventPromise } from 'vuetify';

const { id } = defineProps({
  id: String
})
const emit = defineEmits(['close'])

const kelas = ref<number>()
const kodeRuangKelas = ref("");
const guruPengampu = ref<string>()
const guruKoordinatorP5 = ref<string>();

const periodeStore = usePeriodeStore();
const trpc = injectTrpc();
const { mutateAsync: addAsync, error, isPending, reset } = useMutation(trpc!.operator.kelas.add.mutationOptions());
const { mutateAsync: updateAsync, error: updateError, isPending: updateIsPending, reset: updateReset } = useMutation(trpc!.operator.kelas.update.mutationOptions());

const { data } = useTrcpQuery(trpc!.operator.kelas.get.queryOptions({
  id: computed(() => id!)
}, {
  enabled: computed(() => !!id) as unknown as boolean
}))

watchEffect(() => {
  if (data.value) {
    kelas.value = data.value.kelas;
    kodeRuangKelas.value = data.value.kode_ruang_kelas;
    guruPengampu.value = data.value.wali_kelas.username;
    guruKoordinatorP5.value = data.value.koor_p5.username;
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

  if (!kelas.value || !guruPengampu.value || !guruKoordinatorP5.value || !periodeStore.selectedPeriode) return;
  const update = () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.operator.kelas.getAll.queryKey()
    })
    if (id)
      queryClient.invalidateQueries({
        queryKey: trpc!.operator.kelas.get.queryKey({
          id
        })
      })
  }
  if (!id)
    addAsync({
      kelas: kelas.value,
      kode_ruang_kelas: kodeRuangKelas.value,
      username_wali_kelas: guruPengampu.value,
      username_koor_p5: guruKoordinatorP5.value,
      periode_ajar_id: periodeStore.selectedPeriode
    }).then((id) => {
      update();
      router.replace(`/operator/kelas/${id}`);
    })
  else updateAsync({
    kelas: kelas.value,
    kode_ruang_kelas: kodeRuangKelas.value,
    username_wali_kelas: guruPengampu.value,
    username_koor_p5: guruKoordinatorP5.value,
    id
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
      <v-toolbar-title>{{ id ? "Ubah" : "Tambah" }} Kelas</v-toolbar-title>
    </v-toolbar>

    <v-form class="px-4 py-2"  @submit.prevent="onSubmit">
      <v-select :rules="[rules!.required!()]" v-model="kelas" label="Kelas" :items="[7, 8, 9]" />
      <v-text-field :rules="[rules!.required!()]" v-model="kodeRuangKelas" label="Kode Ruang Kelas" />
      <c-guru-combobox :rules="[rules!.required!()]" v-model="guruPengampu" label="Guru Pengampu" />
      <c-guru-combobox :rules="[rules!.required!()]" v-model="guruKoordinatorP5" label="Guru Koordinator P5" />
      <v-card-text class="text-error text-center pa-0 my-2" v-if="id ? updateError : error">{{ formatError(id ?
        updateError : error) }}</v-card-text>
      <v-btn class="my-2" type="submit" :loading="id ? updateIsPending : isPending">{{ id ? "Ubah" : "Tambah" }}</v-btn>
    </v-form>
  </v-card>
</template>
