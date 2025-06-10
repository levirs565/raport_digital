<script lang="ts" setup>
import { ref } from 'vue';
import { useMutation } from '@tanstack/vue-query';
import { injectTrpc } from '../../../api-vue';

const emit = defineEmits(['close'])
const dialog = ref(true);

const trpc = injectTrpc()

const form = ref<any>(null);
const requiredRule = [
  (v: any) => !!v || 'Kolom ini wajib diisi',
];

const { mutateAsync: addAsync, isPending } = useMutation(trpc!.operator.siswa.add.mutationOptions());

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

async function simpanDataSiswa() {
  const { valid } = await form.value.validate();
  if (!valid) {
    return;
  }
  try{
    addAsync({
      NIS: nis.value,
      NISN: nisn.value,
      nama: namaLengkap.value,
      jenis_kelamin: selectedGender.value as 'LAKI_LAKI' | 'PEREMPUAN',
      tempat_lahir: tempatLahir.value,
      tgl_lahir: new Date(tanggalLahir.value),
      alamat: alamat.value,
      agama: selectedReligion.value,
      status_dlm_keluarga: statusKeluarga.value,
      anak_ke: parseInt(anakKe.value) || 0,
      no_telp: nomorTelepon.value,
      sekolah_asal: asalSekolah.value,
      tingkat_diterima: parseInt(selectedDiKelas.value) || 0,
      tgl_diterima: new Date(padaTanggal.value),
      nama_ayah: namaAyah.value,
      nama_ibu: namaIbu.value,
      alamat_ortu: alamatOrangTua.value,
      pekerjaan_ayah: pekerjaanAyah.value,
      pekerjaan_ibu: pekerjaanIbu.value,
      nama_wali: namaWali.value,
      pekerjaan_wali: pekerjaanWali.value,
      alamat_wali: alamatWali.value,
    });
    emit('close');
  } catch (err: any) {
    alert(`Gagal menyimpan data: ${err.message}`);
  }
}
</script>

<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="headline">
        <v-btn color="#000" variant="plain" icon="mdi-close" @click="$emit('close')"></v-btn>
        Tambah Siswa
      </v-card-title>
      <v-card-text style="max-height: 75vh; overflow-y: auto;">
        <v-form ref="form" @submit.prevent="simpanDataSiswa">
          <v-text-field v-model="nis" label="NIS" :rules="requiredRule"></v-text-field>
          <v-text-field v-model="nisn" label="NISN" :rules="requiredRule"></v-text-field>
          <v-text-field v-model="namaLengkap" label="Nama Lengkap" :rules="requiredRule"></v-text-field>
          <v-select label="Jenis Kelamin"
            :items="[{ value: 'LAKI_LAKI', title: 'Laki-Laki' }, { value: 'PEREMPUAN', title: 'Perempuan' }]"
            v-model="selectedGender"
            :rules="requiredRule"></v-select>
          <v-text-field v-model="tempatLahir" label="Tempat Lahir" :rules="requiredRule"></v-text-field>
          <v-date-input v-model="tanggalLahir" label="Tanggal Lahir" :rules="requiredRule"></v-date-input>
          <v-textarea v-model="alamat" label="Alamat" :rules="requiredRule"></v-textarea>
          <v-select label="Agama" :items="['Islam', 'Katolik', 'Kristen', 'Hindu', 'Buddha', 'Konghucu']"
            v-model="selectedReligion"
            :rules="requiredRule"></v-select>
          <v-text-field v-model="statusKeluarga" label="Status dalam Keluarga" :rules="requiredRule"></v-text-field>
          <v-text-field v-model="anakKe" label="Anak Ke" :rules="requiredRule"></v-text-field>
          <v-text-field v-model="nomorTelepon" label="Nomor Telepon Rumah/HP" :rules="requiredRule"></v-text-field>
          <v-text-field v-model="asalSekolah" label="Asal Sekolah" :rules="requiredRule"></v-text-field>
          <v-divider></v-divider>
          <p>Diterima di Sekolah Ini</p>
          <v-select label="Di Kelas" :items="['7', '8', '9']" v-model="selectedDiKelas" :rules="requiredRule"></v-select>
          <v-date-input v-model="padaTanggal" label="Pada Tanggal" :rules="requiredRule"></v-date-input>
          <v-divider></v-divider>
          <p>Nama Orang Tua</p>
          <v-text-field v-model="namaAyah" label="Nama Ayah" :rules="requiredRule"></v-text-field>
          <v-text-field v-model="namaIbu" label="Nama Ibu" :rules="requiredRule"></v-text-field>
          <v-textarea v-model="alamatOrangTua" label="Alamat Orang Tua" :rules="requiredRule"></v-textarea>
          <v-divider></v-divider>
          <p>Pekerjaan Orang Tua</p>
          <v-text-field v-model="pekerjaanAyah" label="Pekerjaan Ayah" :rules="requiredRule"></v-text-field>
          <v-text-field v-model="pekerjaanIbu" label="Pekerjaan Ibu" :rules="requiredRule"></v-text-field>
          <v-divider></v-divider>
          <p>Wali</p>
          <v-text-field v-model="namaWali" label="Nama Wali" :rules="requiredRule"></v-text-field>
          <v-text-field v-model="pekerjaanWali" label="Pekerjaan Wali" :rules="requiredRule"></v-text-field>
          <v-textarea v-model="alamatWali" label="Alamat Wali" :rules="requiredRule"></v-textarea>
          <v-btn color="primary" variant="elevated" type="submit" :loading="isPending">Tambah</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
