<script lang="ts" setup>
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import CAppBarHamburger from '../../../components/CAppBarHamburger.vue';
import { format } from "date-fns"
import AddSiswa from './AddSiswa.vue';

const { id } = defineProps({
  id: String
})

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.operator.siswa.get.queryOptions({
  id: id!
}));

function formatTanggal(date: Date | string) {
  return format(new Date(date), "dd-MM-yyyy")
}

const jenisKelaminMap = {
  "LAKI_LAKI": "Laki-Laki",
  "PEREMPUAN": "Perempuan"
}
</script>

<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Detail Siswa</v-app-bar-title>

    <v-dialog persistent>
      <template v-slot:activator="{ props }">
        <v-btn icon="mdi-pencil" app v-bind="props" />
      </template>
      <template v-slot:default="{ isActive }">
        <add-siswa :id="id" @close="isActive.value = !isActive.value" />
      </template>
    </v-dialog>
  </v-app-bar>
  <v-main v-if="data">
    <div class="px-4 py-2">
      <p>NIS</p>
      <p>{{ data.NIS }}</p>
      <p>NISN</p>
      <p>{{ data.NISN }}</p>
      <p>Nama Lengkap</p>
      <p>{{ data.nama }}</p>
      <p>Jenis Kelamin</p>
      <p>{{ data.jenis_kelamin ? jenisKelaminMap[data.jenis_kelamin] : "" }}</p>
      <p>Tempat/Tanggal Lahir</p>
      <p>{{ data.tempat_lahir }}, {{ data.tgl_lahir ? formatTanggal(data.tgl_lahir) : "" }}</p>
      <p>Alamat</p>
      <p>{{ data.alamat }}</p>
      <p>Agama</p>
      <p>{{ data.agama }}</p>
      <p>Status dalam Keluarga</p>
      <p>{{ data.status_dlm_keluarga }}</p>
      <p>Anak Ke</p>
      <p>{{ data.anak_ke }}</p>
      <p>Nomor Telepon Rumah/HP</p>
      <p>{{ data.no_telp }}</p>
      <p>Sekolah Asal</p>
      <p>{{ data.sekolah_asal }}</p>
      <v-divider class="ml-4" />
      <p class="ml-4">Diterima di Sekolah ini</p>
      <p>Di Kelas</p>
      <p>{{ data.tingkat_diterima }}</p>
      <p>Pada Tanggal</p>
      <p>{{ data.tgl_diterima ? formatTanggal(data.tgl_diterima) : "" }}</p>
      <v-divider class="ml-4" />
      <p class="ml-4">Data Orang Tua</p>
      <p>Nama Ayah</p>
      <p>{{ data.nama_ayah }}</p>
      <p>Nama Ibu</p>
      <p>{{ data.nama_ibu }}</p>
      <p>Alamat Orang Tua</p>
      <p>{{ data.alamat_ortu }}</p>
      <v-divider class="ml-4" />
      <p class="ml-4">Pekerjaan Orang Tua</p>
      <p>Pekerjaan Ayah</p>
      <p>{{ data.pekerjaan_ayah }}</p>
      <p>Pekerjaan Ibu</p>
      <p>{{ data.pekerjaan_ibu }}</p>
      <v-divider class="ml-4"></v-divider>
      <p class="ml-4">Data Wali</p>
      <p>Nama Wali</p>
      <p>{{ data.nama_wali }}</p>
      <p>Pekerjaan Wali</p>
      <p>{{ data.pekerjaan_wali }}</p>
      <p>Alamat Wali</p>
      <p>{{ data.alamat_wali }}</p>
    </div>
  </v-main>
</template>
