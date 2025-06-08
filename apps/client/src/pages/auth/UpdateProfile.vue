<script lang="ts" setup>
import { ref, useTemplateRef, watchEffect } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../api-vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

const emit = defineEmits(["close"])

const namaLengkap = ref("")
const nip = ref("")
const imageDataUrl = ref()

const trpc = injectTrpc();
const { data: profileData } = useTrcpQuery(trpc!.auth.getProfile.queryOptions())
const { data: tandaTanganData } = useTrcpQuery(trpc!.auth.getTandaTangan.queryOptions())

watchEffect(() => {
  if (profileData.value && profileData.value.type != "OPERATOR") {
    namaLengkap.value = profileData.value.nama_lengkap;
    nip.value = profileData.value.NIP ?? "";
  }
})

const fileInput = useTemplateRef("file-input");

const { mutateAsync } = useMutation(trpc!.auth.updateProfile.mutationOptions());
const { mutateAsync: updateTandaTanganAsync } = useMutation(trpc!.auth.updateTandaTangan.mutationOptions());

function onFileChange() {
  const files = fileInput.value?.files;
  if (files && files.length >= 1) {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      imageDataUrl.value = e.target?.result;
    }
    fileReader.readAsDataURL(files[0])
  }
}

const queryClient = useQueryClient();

function onSubmit() {
  const file = fileInput.value?.files && fileInput.value.files.length >= 1 ? fileInput.value.files[0] : undefined;
  Promise.all([
    file ? updateTandaTanganAsync(file) : Promise.resolve(),
    mutateAsync({
      nama_lengkap: namaLengkap.value,
      NIP: nip.value ? nip.value : null
    })
  ]).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.auth.getProfile.queryKey()
    })
    queryClient.invalidateQueries({
      queryKey: trpc!.auth.getTandaTangan.queryKey()
    })
    emit('close')
  })
}

</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Ubah Password</v-toolbar-title>
    </v-toolbar>
    <v-form class="px-4 py-2">
      <v-text-field label="Nama Lengkap" v-model="namaLengkap" />
      <v-text-field label="NIP" v-model="nip" />
      <p>Tanda Tangan</p>
      <input ref="file-input" type="file" accept=".jpg, .jpeg, .png" @change="onFileChange" hidden>
      <img v-if="tandaTanganData || imageDataUrl"
        :src="imageDataUrl ? imageDataUrl : `data:image/png;base64,${tandaTanganData}`" style="max-height: 100px;" />
      <p v-else>Belum ada tangan tangan</p>
      <v-btn class="d-block" variant="outlined" @click="fileInput?.click()">Upload Tanda Tangan Baru</v-btn>
      <v-btn class="d-block mt-4" @click="onSubmit">Ubah</v-btn>
    </v-form>
  </v-card>
</template>
