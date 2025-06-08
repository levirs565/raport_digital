<script lang="ts" setup>
import { ref } from 'vue';
import CPasswordField from '../../components/CPasswordField.vue';
import { injectTrpc } from '../../api-vue';
import { useMutation } from '@tanstack/vue-query';

const emit = defineEmits(["close"])

const oldPassword = ref("")
const newPassword = ref("")
const newPasswordConfirm = ref("")

const trpc = injectTrpc();
const { mutateAsync } = useMutation(trpc!.auth.updatePassword.mutationOptions());

function onSubmit() {
  if (!oldPassword.value || !newPassword.value || !newPasswordConfirm.value) return
  if (newPassword.value != newPasswordConfirm.value) return

  mutateAsync({
    oldPassword: oldPassword.value,
    newPassword: newPassword.value
  }).then(() => {
    emit('close')
  })
}

</script>
<template>
  <v-card>
    <v-toolbar color="surface">
      <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
      <v-toolbar-title>Ubah Password</v-toolbar-title>
    </v-toolbar>
    <v-form class="px-4 py-2">
      <c-password-field v-model="oldPassword" label="Password Lama"/>
      <c-password-field v-model="newPassword" label="Password Baru"/>
      <c-password-field v-model="newPasswordConfirm" label="Konfirmasi Password Baru"/>
      <v-btn @click="onSubmit">Ubah</v-btn>
    </v-form>
  </v-card>
</template>
