<script lang="ts" setup>
import { ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import CAppBarHamburger from '../../components/CAppBarHamburger.vue';
import { injectTrpc } from '../../api-vue';

const trpc = injectTrpc()
useMutation(trpc!.operator.siswa.add.mutationOptions())
const nis = ref('');
const nisn = ref('');
const namaLengkap = ref('');
const selectedGender = ref('');
const tempatLahir = ref('');
const tanggalLahir = ref('');
const alamat = ref('');
const selectedReligion = ref('');
const statusKeluarga = ref('');
const anakKe = ref('');
const nomorTelepon = ref('');
const asalSekolah = ref('');
const selectedDiKelas = ref('');
const padaTanggal = ref('');
const namaAyah = ref('');
const namaIbu = ref('');
const alamatOrangTua = ref('');
const pekerjaanAyah = ref('');
const pekerjaanIbu = ref('');
const namaWali = ref('');
const pekerjaanWali = ref('');
const alamatWali = ref('');
</script>

<template>
  <v-main>
    <v-app-bar>
    <CAppBarHamburger />
    <v-app-bar-title>Verifikasi Akun Guru</v-app-bar-title>

  </v-app-bar>

  <v-text-field v-model="nis" label="NIS"></v-text-field>
  <v-text-field v-model="nisn" label="NISN"></v-text-field>
  <v-text-field v-model="namaLengkap" label="Nama Lengkap"></v-text-field>
  <v-select label="Jenis Kelamin" :items="[{  value: 'LAKI_LAKI', title: 'Laki-Laki' }, {  value: 'PEREMPUAN', title: 'Perempuan'}]"  v-model="selectedGender"></v-select>
  <v-text-field v-model="tempatLahir" label="Tempat Lahir"></v-text-field>
  <v-date-input v-model="tanggalLahir" label="Tanggal Lahir"></v-date-input>
  <v-textarea v-model="alamat" label="Alamat"></v-textarea>
  <v-select label="Agama" :items="['Islam', 'Katolik', 'Kristen', 'Hindu', 'Buddha', 'Konghucu']" v-model="selectedReligion"></v-select>
  <v-text-field v-model="statusKeluarga" label="Status dalam Keluarga"></v-text-field>
  <v-text-field v-model="anakKe" label="Anak Ke"></v-text-field>
  <v-text-field v-model="nomorTelepon" label="Nomor Telepon Rumah/HP"></v-text-field>
  <v-text-field v-model="asalSekolah" label="Asal Sekolah"></v-text-field>
  <v-divider></v-divider>
  <p>Diterima di Sekolah Ini</p>
  <v-select label="Di Kelas" :items="['7', '8', '9']" v-model="selectedDiKelas"></v-select>
  <v-date-input v-model="padaTanggal" label="Pada Tanggal"></v-date-input>
  <v-divider></v-divider>
  <p>Nama Orang Tua</p>
  <v-text-field v-model="namaAyah" label="Nama Ayah"></v-text-field>
  <v-text-field v-model="namaIbu" label="Nama Ibu"></v-text-field>
  <v-textarea v-model="alamatOrangTua" label="Alamat Orang Tua"></v-textarea>
  <v-divider></v-divider>
  <p>Pekerjaan Orang Tua</p>
  <v-text-field v-model="pekerjaanAyah" label="Pekerjaan Ayah"></v-text-field>
  <v-text-field v-model="pekerjaanIbu" label="Pekerjaan Ibu"></v-text-field>
  <v-divider></v-divider>
  <p>Wali</p>
  <v-text-field v-model="namaWali" label="Nama Wali"></v-text-field>
  <v-text-field v-model="pekerjaanWali" label="Pekerjaan Wali"></v-text-field>
  <v-textarea v-model="alamatWali" label="Alamat Wali"></v-textarea>
  <v-btn @click="">Tambah</v-btn>
  </v-main>
</template>
