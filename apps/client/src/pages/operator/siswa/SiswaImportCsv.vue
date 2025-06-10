<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { injectTrpc } from '../../../api-vue';
import { computed, reactive, useTemplateRef } from 'vue';
import { formatError } from '../../../api';

const emit = defineEmits(['close'])
const trpc = injectTrpc();
const queryClient = useQueryClient();
const { mutateAsync, isPending } = useMutation(trpc!.operator.siswa.importCsv.mutationOptions())

const fileInput = useTemplateRef("file-input");

const errors = reactive<string[]>([]);

const error = computed(() => errors.join("\n"))

function onFileChange() {
  if (fileInput.value) {
    const files = fileInput.value.files;
    if (files && files.length >= 1) {
      errors.length = 0;

      mutateAsync(files[0]).then((result) => {
        queryClient.invalidateQueries({
          queryKey: trpc!.operator.siswa.getAll.queryKey()
        })

        if (result.error)
          errors.push(result.error)
        for (const item of result.list) {
          if ("error" in item)
            errors.push(item.error)
        }

        if (errors.length == 0) emit('close')
      })
    }
    fileInput.value.value = "";
  }
}
</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-app-bar-title>Import CSV Siswa</v-app-bar-title>
    </v-toolbar>
    <v-card-text style="overflow-y: auto;">
      <v-btn class="w-100" variant="outlined" href="/Template_Siswa.csv">Download Template</v-btn>
      <input type="file" accept="*.csv" ref="file-input" hidden @change="onFileChange" />
      <v-card-text class="text-error text-center pa-0 my-2" v-if="error">{{ error }}</v-card-text>
      <v-btn class="my-2 d-block w-100" @click="fileInput?.click()" :loading="isPending">Upload CSV</v-btn>
    </v-card-text>
  </v-card>
</template>
