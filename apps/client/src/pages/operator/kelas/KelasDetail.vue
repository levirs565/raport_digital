<script lang="ts" setup>
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import AddKelas from './AddKelas.vue';
import EditAnggotaKelas from './EditAnggotaKelas.vue';
import AddMataPelajaranKelas from './AddMataPelajaranKelas.vue';
import { useRouter } from 'vue-router';
import { useSnackbarStore } from '../../../store';
import { formatError } from '../../../api';

const { id } = defineProps({
  id: String
})

const trpc = injectTrpc();
const idComputed = computed(() => id!)
const { data } = useTrcpQuery(trpc!.operator.kelas.get.queryOptions({
  id: idComputed
}))
const { data: mataPelajaranData } = useTrcpQuery(trpc!.operator.kelas.getMataPelajaranList.queryOptions({
  id: idComputed
}))
const { data: anggotaKelasData } = useTrcpQuery(trpc!.operator.kelas.getAnggotaList.queryOptions({
  id: idComputed
}))

const activeTab = ref(0);

const { mutateAsync: deleteMataPelajaranAsync } = useMutation(trpc!.operator.kelas.deleteMataPelajaran.mutationOptions());
const { mutateAsync: deleteAsync } = useMutation(trpc!.operator.kelas.delete.mutationOptions());

const queryClient = useQueryClient();
const snackbar = useSnackbarStore();
const router = useRouter();

function onDeleteMataPelajaran(idMapel: string) {
  deleteMataPelajaranAsync({
    id: id!,
    id_mata_pelajaran: idMapel
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.operator.kelas.getMataPelajaranList.queryKey()
    })
  }).catch(e => {
    snackbar.errors.push(formatError(e));
  })
}

function onDelete() {
  deleteAsync({
    id: id!
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc?.operator.kelas.getAll.queryKey()
    })
    router.replace("/operator/kelas")
  }).catch(e => {
    snackbar.errors.push(formatError(e));
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Kelas {{ data?.kelas }}-{{ data?.kode_ruang_kelas }}</v-app-bar-title>
    <v-dialog>
      <template v-slot:activator="{ props: activatorProps }">
        <v-btn icon v-bind="activatorProps">
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>
      </template>
      <template v-slot:default="{ isActive }">
        <v-card title="Konfirmasi Hapus">
          <v-card-text>
            Apakah anda yakin menghapus Kelas?
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

    <template v-slot:extension>
      <v-tabs grow v-model="activeTab">
        <v-tab>Informasi Kelas</v-tab>
        <v-tab>Siswa</v-tab>
      </v-tabs>
    </template>
  </v-app-bar>

  <v-main>
    <v-tabs-window v-model="activeTab">
      <v-tabs-window-item class="pa-4">
        <v-card v-if="data" class="pa-4">
          <v-row>
            <v-col>
              <p>Kelas</p>
              <p>{{ data.kelas }}</p>
            </v-col>
            <v-col>
              <p>Kode Ruang Kelas</p>
              <p>{{ data.kode_ruang_kelas }}</p>
            </v-col>
          </v-row>
          <p>Pengampu</p>
          <p>{{ data.wali_kelas.nama_lengkap }}</p>
          <p>Koordinator P5</p>
          <p>{{ data.koor_p5.nama_lengkap }}</p>
          <div class="d-flex justify-end">
            <v-dialog persistent>
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props">Ubah</v-btn>
              </template>
              <template v-slot:default="{ isActive }">
                <add-kelas :id="id" @close="isActive.value = !isActive.value" />
              </template>
            </v-dialog>
          </div>
        </v-card>
        <v-card v-if="mataPelajaranData" class="mt-4">
          <v-card-title>Mata Pelajaran</v-card-title>
          <v-list>
            <template v-for="item in mataPelajaranData" :key="item.mata_pelajaran.id_mata_pelajaran">
              <v-list-item>
                <v-list-item-title>{{ item.mata_pelajaran.nama }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.guru.nama_lengkap }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn variant="text" icon color="text">
                    <v-icon>mdi-dots-vertical</v-icon>
                    <v-menu activator="parent">
                      <v-list>
                        <v-list-item title="Hapus" v-if="!data?.is_locked"
                          @click="onDeleteMataPelajaran(item.mata_pelajaran.id_mata_pelajaran)" />
                        <v-dialog persistent v-if="!data?.is_locked">
                          <template v-slot:activator="{ props }">
                            <v-list-item title="Ubah" v-bind="props" />
                          </template>
                          <template v-slot:default="{ isActive }">
                            <add-mata-pelajaran-kelas :id="id"
                              :id-mata-pelajaran="item.mata_pelajaran.id_mata_pelajaran"
                              @close="isActive.value = !isActive.value" />
                          </template>
                        </v-dialog>
                      </v-list>
                    </v-menu>
                  </v-btn>
                </template>
              </v-list-item>
              <v-divider />
            </template>
          </v-list>
          <div class="d-flex justify-end ma-4">
            <v-dialog persistent v-if="!data?.is_locked">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props">Tambah</v-btn>
              </template>
              <template v-slot:default="{ isActive }">
                <add-mata-pelajaran-kelas :id="id" @close="isActive.value = !isActive.value" />
              </template>
            </v-dialog>
            <p v-else>
              <v-icon size="small" class="mr-2">mdi-lock</v-icon>
              <span>Dikunci</span>
            </p>
          </div>
        </v-card>
      </v-tabs-window-item>
      <v-tabs-window-item>
        <v-list>
          <template v-for="item in anggotaKelasData" :key="item.id_siswa">
            <v-list-item>
              <v-list-item-title>{{ item.nama }}</v-list-item-title>
              <v-list-item-subtitle>NIS. {{ item.NIS }} NISN. {{ item.NISN }}</v-list-item-subtitle>
            </v-list-item>
            <v-divider />
          </template>
        </v-list>

        <v-dialog persistent fullscreen>
          <template v-slot:activator="{ props }">
            <v-fab icon="mdi-pencil" app v-bind="props" />
          </template>
          <template v-slot:default="{ isActive }">
            <edit-anggota-kelas :id="id" @close="isActive.value = !isActive.value" />
          </template>
        </v-dialog>
      </v-tabs-window-item>
    </v-tabs-window>
  </v-main>
</template>
