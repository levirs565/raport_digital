<script setup lang="ts">
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import AddMataPelajaran from './AddMataPelajaran.vue';
import { useRouter } from 'vue-router';
import { useSnackbarStore } from '../../../store';
import { formatError } from '../../../api';

const { id } = defineProps({
  id: String
});

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.mataPelajaran.get.queryOptions({
  id: id!
}))

const { mutateAsync: deleteAsync } = useMutation(trpc!.operator.mataPelajaran.delete.mutationOptions())

const router = useRouter();
const snackbar = useSnackbarStore();
const queryClient = useQueryClient();
function onDelete() {
  deleteAsync({
    id: id!
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc?.operator.mataPelajaran.getAll.queryKey()
    })
    router.replace("/operator/mata-pelajaran")
  }).catch(e => {
    snackbar.errors.push(formatError(e));
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Detail Mata Pelajaran</v-app-bar-title>
    <v-dialog persistent fullscreen>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <template v-slot:default="{ isActive }">
        <add-mata-pelajaran :id="id" @close="isActive.value = !isActive.value" />
      </template>
    </v-dialog>
    <v-dialog>
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn icon v-bind="activatorProps">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
      <template v-slot:default="{ isActive }">
        <v-card title="Konfirmasi Hapus">
          <v-card-text>
            Apakah anda yakin menghapus Mata Pelajaran?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text="Batal" @click="isActive.value = false"></v-btn>
            <v-btn text="Hapus" color="red" @click="() => {
              isActive.value = false
              onDelete();
            }"></v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
  </v-app-bar>

  <v-main v-if="data">
    <div class="px-4 pt-2">
      <p>Nama Mata Pelajaran</p>
      <p>{{ data.nama }}</p>
      <p>Kelompok Mata Pelajaran</p>
      <p>{{ data.kelompok_mapel ?? "-" }}</p>
      <p>Guru Pengampu</p>
    </div>
    <v-list>
      <template v-for="item in data.guru" :key="item.username">
        <v-list-item>
          <v-list-item-title>{{ item.nama_lengkap }}</v-list-item-title>
          <v-list-item-subtitle>NIP. {{ item.NIP }}</v-list-item-subtitle>
        </v-list-item>
        <v-divider />
      </template>
    </v-list>
  </v-main>
</template>
