<script setup lang="ts">
import { ref } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { injectTrpc } from "../../api-vue";
import logo from "../../logo.png";
import { useRouter } from "vue-router";

const trpc = injectTrpc();
const router = useRouter();

const { mutateAsync } = useMutation(trpc!.auth.registerAkunGuru.mutationOptions());

const namaLengkap = ref("")
const userName = ref("");
const password = ref("");
const showPassword = ref(false);
const konfirmasiPassword = ref("");
const showKonfirmasiPassword = ref(false);
const error = ref("")

function onRegister() {
    error.value = ""
    if (konfirmasiPassword.value != password.value) {
        error.value = "Konfirmasi password harus sama dengan password."
        return
    }

    mutateAsync({
        namaLengkap: namaLengkap.value,
        password: password.value,
        username: userName.value
    }).then(() => {
        router.push("/login")
    })
}
</script>

<template>
    <v-main max-width="360px" class="mx-auto w-100">
        <v-form>
            <v-img :src="logo" height="200" width="200" class="mx-auto" />
            <v-card class="pa-4" style="text-align: center">
                <v-card-title>REGISTER</v-card-title>
                <v-text-field v-model="namaLengkap" label="Nama Lengkap" />
                <v-text-field v-model="userName" label="Username" autocomplete="current-username" />
                <v-text-field v-model="password" label="Password" :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showPassword = !showPassword" autocomplete="current-password" />
                <v-text-field v-model="konfirmasiPassword" label="Konfirmasi Password"
                    :type="showKonfirmasiPassword ? 'text' : 'password'"
                    :append-inner-icon="showKonfirmasiPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append-inner="showKonfirmasiPassword = !showKonfirmasiPassword"
                    autocomplete="current-password" />
                <v-btn @click="onRegister">Register</v-btn>
                <v-card-text v-if="error">{{ error }}</v-card-text>
                <v-card-text>Sudah punya akun? <router-link to="/login" text="Login"></router-link></v-card-text>
            </v-card>
        </v-form>
    </v-main>
</template>