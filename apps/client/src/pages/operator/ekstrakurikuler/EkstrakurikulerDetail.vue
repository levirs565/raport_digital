<script setup lang="ts">
import { computed } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import AddEkstrakurikuler from './AddEkstrakurikuler.vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { useRouter } from 'vue-router';
import { useSnackbarStore } from '../../../store';
import { formatError } from '../../../api';

const { id } = defineProps({
  id: String
})

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.ekstrakurikuler.get.queryOptions({
  id: computed(() => id!)
}))

const { mutateAsync: deleteAsync } = useMutation(trpc!.operator.ekstrakurikuler.delete.mutationOptions())

const router = useRouter();
const snackbar = useSnackbarStore();
const queryClient = useQueryClient();
function onDelete() {
  deleteAsync({
    id: id!
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc?.operator.ekstrakurikuler.getAll.queryKey()
    })
    router.replace("/operator/ekstrakurikuler")
  }).catch(e => {
    snackbar.errors.push(formatError(e));
  })
}
</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>
      <span>Detail Ekstrakurikuler</span>
    </v-app-bar-title>
    <v-dialog persistent>
      <template v-slot:activator="{ props }">
        <v-btn icon v-bind="props">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <template v-slot:default="{ isActive }">
        <add-ekstrakurikuler :id="id" @close="isActive.value = !isActive.value" />
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
            Apakah anda yakin menghapus Ekstrakurikuler?
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
  <v-main>
    <div class="px-4 py-2" v-if="data">
      <p>Nama</p>
      <p>{{ data.nama }}</p>
      <p>Guru Pengampu</p>
      <p>{{ data.guru.nama_lengkap }}</p>
      <p>NIP Guru Pengampu</p>
      <p>{{ data.guru.NIP ?? "-" }}</p>
    </div>
  </v-main>
</template>
