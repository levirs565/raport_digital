<script setup lang="ts">
import { ref } from "vue";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { injectTrpc } from "../../api-vue";

const trpc = injectTrpc();
const queryClient = useQueryClient();

const { mutateAsync } = useMutation(trpc!.auth.login.mutationOptions());
const key = trpc!.auth.state.queryKey()

const userName = ref("");
const password = ref("");

function onLogin() {
    console.log("Test")
    mutateAsync({
        username: userName.value,
        password: password.value
    }).then(() => {
        queryClient.invalidateQueries({
            queryKey: key
        })
    })
}
</script>

<template>
    <v-main max-width="360px" class="mx-auto w-100">
        <v-form>
            <v-card class="pa-4" style="text-align: center">
                <v-text-field v-model="userName" label="Username" autocomplete="current-username" />
                <v-text-field v-model="password" label="Password" type="password" autocomplete="current-password" />
                <v-btn @click="onLogin">Login</v-btn>
            </v-card>
        </v-form>
    </v-main>
</template>
