<script lang="ts" setup>
import { ref } from 'vue';
import CPasswordField from '../../components/CPasswordField.vue';
import { injectTrpc } from '../../api-vue';
import { useMutation } from '@tanstack/vue-query';
import { formatError } from '../../api';
import { SubmitEventPromise } from 'vuetify';
import { useRules } from 'vuetify/labs/rules';

const emit = defineEmits(["close"])

const oldPassword = ref("")
const newPassword = ref("")
const newPasswordConfirm = ref("")

const trpc = injectTrpc();
const { mutateAsync, isPending, error, reset } = useMutation(trpc!.auth.updatePassword.mutationOptions());

async function onSubmit(event: SubmitEventPromise) {
  if (!(await event).valid) {
    reset();
    return;
  }
  if (!oldPassword.value || !newPassword.value || !newPasswordConfirm.value) return

  mutateAsync({
    oldPassword: oldPassword.value,
    newPassword: newPassword.value
  }).then(() => {
    emit('close')
  })
}

function konfirmasiPasswordRule() {
  if (newPassword.value != newPasswordConfirm.value) return "Konfirmasi password harus sesuai";
  return true;
}

const rules = useRules();
</script>
<template>
  <v-form @submit.prevent="onSubmit">
    <v-card>
      <v-toolbar color="surface">
        <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
        <v-toolbar-title>Ubah Password</v-toolbar-title>
      </v-toolbar>

      <div class="px-4 py-2">
        <c-password-field :rules="[rules!.required!()]" v-model="oldPassword" label="Password Lama" />
        <c-password-field :rules="[rules!.required!(), rules!.minLength!(8)]" v-model="newPassword"
          label="Password Baru" />
        <c-password-field :rules="[rules!.required!(), konfirmasiPasswordRule]" v-model="newPasswordConfirm"
          label="Konfirmasi Password Baru" />
        <v-card-text class="text-error text-center pa-0 my-2" v-if="error">{{ formatError(error) }}</v-card-text>
        <v-btn class="my-2" type="submit" :loading="isPending">Ubah</v-btn>
      </div>
    </v-card>
  </v-form>
</template>
