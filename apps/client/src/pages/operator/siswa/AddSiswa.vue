<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { injectTrpc, useTrcpQuery } from '../../../api-vue';
import { useRules } from 'vuetify/labs/rules';
import { SubmitEventPromise } from 'vuetify';
import { formatError } from '../../../api';
import { useRouter } from 'vue-router';

const { id } = defineProps({
  id: String
})
const emit = defineEmits(['close'])

const trpc = injectTrpc()

const { mutateAsync: addAsync, error, isPending, reset } = useMutation(trpc!.operator.siswa.add.mutationOptions());
const { mutateAsync: updateAsync, error: updateError, isPending: updateIsPending, reset: updateReset } = useMutation(trpc!.operator.siswa.update.mutationOptions());

const nis = ref('');
const nisn = ref('');
const namaLengkap = ref('');
const selectedGender = ref('');
const tempatLahir = ref('');
const tanggalLahir = ref<Date>();
const alamat = ref('');
const selectedReligion = ref('');
const statusKeluarga = ref('');
const anakKe = ref<number>();
const nomorTelepon = ref('');
const asalSekolah = ref('');
const selectedDiKelas = ref<number>();
const padaTanggal = ref<Date>();
const namaAyah = ref('');
const namaIbu = ref('');
const alamatOrangTua = ref('');
const pekerjaanAyah = ref('');
const pekerjaanIbu = ref('');
const namaWali = ref('');
const pekerjaanWali = ref('');
const alamatWali = ref('');

const { data } = useTrcpQuery(trpc!.operator.siswa.get.queryOptions({
  id: computed(() => id!)
}, {
  enabled: computed(() => !!id) as unknown as boolean
}))
const queryClient = useQueryClient();

watchEffect(() => {
  if (data.value) {
    nis.value = data.value.NIS;
    nisn.value = data.value.NISN;
    namaLengkap.value = data.value.nama;
    selectedGender.value = data.value.jenis_kelamin;
    tempatLahir.value = data.value.tempat_lahir;
    tanggalLahir.value = new Date(data.value.tgl_lahir);
    alamat.value = data.value.alamat;
    selectedReligion.value = data.value.agama;
    statusKeluarga.value = data.value.status_dlm_keluarga;
    anakKe.value = data.value.anak_ke;
    nomorTelepon.value = data.value.no_telp;
    asalSekolah.value = data.value.sekolah_asal;
    selectedDiKelas.value = data.value.tingkat_diterima;
    padaTanggal.value = new Date(data.value.tgl_diterima);
    namaAyah.value = data.value.nama_ayah;
    namaIbu.value = data.value.nama_ibu;
    alamatOrangTua.value = data.value.alamat_ortu;
    pekerjaanAyah.value = data.value.pekerjaan_ayah;
    pekerjaanIbu.value = data.value.pekerjaan_ibu;
    namaWali.value = data.value.nama_wali;
    pekerjaanWali.value = data.value.pekerjaan_wali;
    alamatWali.value = data.value.alamat_wali;

  }
})


const router = useRouter();
async function onSave(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    updateReset();
    return;
  }

  const update = () => {
    queryClient.invalidateQueries({
      queryKey: trpc!.operator.siswa.getAll.queryKey()
    })
    if (id)
      queryClient.invalidateQueries({
        queryKey: trpc!.operator.siswa.get.queryKey({
          id
        })
      })
  }
  if (!id)
    addAsync({
      NIS: nis.value,
      NISN: nisn.value,
      nama: namaLengkap.value,
      jenis_kelamin: selectedGender.value as 'LAKI_LAKI' | 'PEREMPUAN',
      tempat_lahir: tempatLahir.value,
      tgl_lahir: tanggalLahir.value!,
      alamat: alamat.value,
      agama: selectedReligion.value,
      status_dlm_keluarga: statusKeluarga.value,
      anak_ke: anakKe.value!,
      no_telp: nomorTelepon.value,
      sekolah_asal: asalSekolah.value,
      tingkat_diterima: selectedDiKelas.value!,
      tgl_diterima: padaTanggal.value!,
      nama_ayah: namaAyah.value,
      nama_ibu: namaIbu.value,
      alamat_ortu: alamatOrangTua.value,
      pekerjaan_ayah: pekerjaanAyah.value,
      pekerjaan_ibu: pekerjaanIbu.value,
      nama_wali: namaWali.value,
      pekerjaan_wali: pekerjaanWali.value,
      alamat_wali: alamatWali.value,
    }).then((id) => {
      update();
      router.push(`/operator/siswa/${id}`);
    })
  else updateAsync({
    id_siswa: id,
    NIS: nis.value,
    NISN: nisn.value,
    nama: namaLengkap.value,
    jenis_kelamin: selectedGender.value as 'LAKI_LAKI' | 'PEREMPUAN',
    tempat_lahir: tempatLahir.value,
    tgl_lahir: tanggalLahir.value!,
    alamat: alamat.value,
    agama: selectedReligion.value,
    status_dlm_keluarga: statusKeluarga.value,
    anak_ke: anakKe.value!,
    no_telp: nomorTelepon.value,
    sekolah_asal: asalSekolah.value,
    tingkat_diterima: selectedDiKelas.value!,
    tgl_diterima: padaTanggal.value!,
    nama_ayah: namaAyah.value,
    nama_ibu: namaIbu.value,
    alamat_ortu: alamatOrangTua.value,
    pekerjaan_ayah: pekerjaanAyah.value,
    pekerjaan_ibu: pekerjaanIbu.value,
    nama_wali: namaWali.value,
    pekerjaan_wali: pekerjaanWali.value,
    alamat_wali: alamatWali.value,
  }).then((id) => {
    update();
    emit("close");
  })

}

const rules = useRules();
</script>

<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-app-bar-title>{{ id ? "Ubah" : "Tambah" }} Siswa</v-app-bar-title>
    </v-toolbar>
    <v-card-text style="overflow-y: auto;">
      <v-form ref="form" @submit.prevent="onSave">
        <v-text-field v-model="nis" label="NIS" :rules="[rules!.required!()]"></v-text-field>
        <v-text-field v-model="nisn" label="NISN" :rules="[rules!.required!()]"></v-text-field>
        <v-text-field v-model="namaLengkap" label="Nama Lengkap" :rules="[rules!.required!()]"></v-text-field>
        <v-select label="Jenis Kelamin"
          :items="[{ value: 'LAKI_LAKI', title: 'Laki-Laki' }, { value: 'PEREMPUAN', title: 'Perempuan' }]"
          v-model="selectedGender" :rules="[rules!.required!()]"></v-select>
        <v-text-field v-model="tempatLahir" label="Tempat Lahir" :rules="[rules!.required!()]"></v-text-field>
        <v-date-input v-model="tanggalLahir" label="Tanggal Lahir" :rules="[rules!.required!()]"></v-date-input>
        <v-textarea v-model="alamat" label="Alamat" :rules="[rules!.required!()]"></v-textarea>
        <v-select label="Agama" :items="['Islam', 'Katolik', 'Kristen', 'Hindu', 'Buddha', 'Konghucu']"
          v-model="selectedReligion" :rules="[rules!.required!()]"></v-select>
        <v-text-field v-model="statusKeluarga" label="Status dalam Keluarga"
          :rules="[rules!.required!()]"></v-text-field>
        <v-number-input v-model="anakKe" label="Anak Ke" :rules="[rules!.required!()]"></v-number-input>
        <v-text-field v-model="nomorTelepon" label="Nomor Telepon Rumah/HP"
          :rules="[rules!.required!()]"></v-text-field>
        <v-text-field v-model="asalSekolah" label="Asal Sekolah" :rules="[rules!.required!()]"></v-text-field>
        <v-divider></v-divider>
        <p>Diterima di Sekolah Ini</p>
        <v-select label="Di Kelas" :items="[7, 8, 9]" v-model="selectedDiKelas"
          :rules="[rules!.required!()]"></v-select>
        <v-date-input v-model="padaTanggal" label="Pada Tanggal" :rules="[rules!.required!()]"></v-date-input>
        <v-divider></v-divider>
        <p>Nama Orang Tua</p>
        <v-text-field v-model="namaAyah" label="Nama Ayah" :rules="[rules!.required!()]"></v-text-field>
        <v-text-field v-model="namaIbu" label="Nama Ibu" :rules="[rules!.required!()]"></v-text-field>
        <v-textarea v-model="alamatOrangTua" label="Alamat Orang Tua" :rules="[rules!.required!()]"></v-textarea>
        <v-divider></v-divider>
        <p>Pekerjaan Orang Tua</p>
        <v-text-field v-model="pekerjaanAyah" label="Pekerjaan Ayah" :rules="[rules!.required!()]"></v-text-field>
        <v-text-field v-model="pekerjaanIbu" label="Pekerjaan Ibu" :rules="[rules!.required!()]"></v-text-field>
        <v-divider></v-divider>
        <p>Wali</p>
        <v-text-field v-model="namaWali" label="Nama Wali" :rules="[rules!.required!()]"></v-text-field>
        <v-text-field v-model="pekerjaanWali" label="Pekerjaan Wali" :rules="[rules!.required!()]"></v-text-field>
        <v-textarea v-model="alamatWali" label="Alamat Wali" :rules="[rules!.required!()]"></v-textarea>
        <v-card-text class="text-error text-center pa-0 my-2" v-if="id ? updateError : error">{{ formatError(id ?
          updateError : error) }}</v-card-text>
        <v-btn class="my-2" type="submit" :loading="id ? updateIsPending : isPending">{{ id ? "Ubah" : "Tambah"
        }}</v-btn>
      </v-form>
    </v-card-text>
  </v-card>
</template>
