import './styles.css';
import { createApp } from 'vue';
import App from './app/App.vue';
import { VueQueryPlugin, VueQueryPluginOptions } from "@tanstack/vue-query";
import { queryClient, trpc } from './api';
import { TRPC_KEY } from './api-vue';
import { vuetify } from './plugins/vuetify';

const app = createApp(App);

app.use<VueQueryPluginOptions>(VueQueryPlugin, {
    queryClient: queryClient
})
app.provide(TRPC_KEY, trpc);

app.use(vuetify);

app.mount('#root');
