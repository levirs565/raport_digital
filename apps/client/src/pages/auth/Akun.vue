<script lang="ts" setup>
import { AkunType } from '@prisma/client';
import { injectTrpc, useTrcpQuery } from '../../api-vue';
import CAppBarHamburger from '../../components/CAppBarHamburger.vue';
import UpdatePassword from './UpdatePassword.vue';
import UpdateProfile from './UpdateProfile.vue';
import { computed } from 'vue';

const trpc = injectTrpc();
const { data } = useTrcpQuery(trpc!.auth.state.queryOptions())

const haveProfile = computed(() => !!data.value && data.value.type != "OPERATOR") as unknown as boolean;
const { data: profileData } = useTrcpQuery(trpc!.auth.getProfile.queryOptions(undefined, {
  enabled: haveProfile
}))
const { data: tandaTanganData } = useTrcpQuery(trpc!.auth.getTandaTangan.queryOptions(undefined, {
  enabled: haveProfile
}))

const typeMap: Record<AkunType, string> = {
  "GURU": "Guru",
  "KEPALA_SEKOLAH": "Kepala Sekolah",
  "OPERATOR": "Operator"
}

</script>
<template>
  <v-app-bar>
    <c-app-bar-hamburger />
    <v-app-bar-title>Akun</v-app-bar-title>
  </v-app-bar>

  <v-main>
    <v-card class="ma-4 pa-4">
      <p>Role</p>
      <p>{{ data ? typeMap[data.type] : "" }}</p>
      <p>Username</p>
      <p>{{ data?.username }}</p>
      <p>Password</p>
      <div class="d-flex justify-end">
        <v-dialog persistent>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props">Ubah Password</v-btn>
          </template>
          <template v-slot:default="{ isActive }">
            <update-password @close="isActive.value = !isActive.value" />
          </template>
        </v-dialog>
      </div>
    </v-card>

    <v-card v-if="profileData && profileData.type != 'OPERATOR'" class="ma-4 pa-4">
      <p>Nama Lengkap</p>
      <p>{{ profileData.nama_lengkap }}</p>
      <p>NIP</p>
      <p>{{ profileData.NIP ?? "-" }}</p>
      <p>Tanda Tangan</p>
      <img v-if="tandaTanganData" :src="`data:image/png;base64,${tandaTanganData}`" style="max-height: 100px;" />
      <p v-else>Belum ada tangan tangan</p>
      <div class="d-flex justify-end">
        <v-dialog persistent>
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props">Ubah</v-btn>
          </template>
          <template v-slot:default="{ isActive }">
            <update-profile @close="isActive.value = !isActive.value" />
          </template>
        </v-dialog>
      </div>
    </v-card>
  </v-main>
</template>
