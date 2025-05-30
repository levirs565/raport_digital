<script lang="ts" setup>
import { computed, ref } from 'vue';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';

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

const queryClient = useQueryClient();
function onDeleteMataPelajaran(idMapel: string) {
  deleteMataPelajaranAsync({
    id: id!,
    id_mata_pelajaran: idMapel
  }).then(() => {
    queryClient.invalidateQueries({
      queryKey: trpc!.operator.kelas.getMataPelajaranList.queryKey()
    })
  })
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Keleas </v-app-bar-title>

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
            <v-btn :to="`/operator/kelas/${id}/edit`">Ubah</v-btn>
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
                        <v-list-item title="Hapus"
                          @click="onDeleteMataPelajaran(item.mata_pelajaran.id_mata_pelajaran)" />
                        <!-- TODO: update guru -->
                      </v-list>
                    </v-menu>
                  </v-btn>
                </template>
              </v-list-item>
              <v-divider />
            </template>
          </v-list>
          <div class="d-flex justify-end ma-4">
            <v-btn :to="`/operator/kelas/${id}/mata-pelajaran/add`">Tambah</v-btn>
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
        <v-fab icon="mdi-pencil" app :to="`/operator/kelas/${id}/anggota`" />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-main>
</template>
