import './styles.css';
import { createApp } from 'vue';
import App from './app/App.vue';
import { VueQueryPlugin, VueQueryPluginOptions } from '@tanstack/vue-query';
import { queryClient, trpc } from './api';
import { QUERY_CLIENT_KEY, TRPC_KEY } from './api-vue';
import { vuetify, vuetifyRule } from './plugins/vuetify';
import { router } from './router';
import { createPinia } from "pinia";

const pinia = createPinia();
const app = createApp(App);

app.use<VueQueryPluginOptions>(VueQueryPlugin, {
  queryClient: queryClient,
});
app.provide(TRPC_KEY, trpc);
app.provide(QUERY_CLIENT_KEY, queryClient);

app.use(vuetify);
app.use(vuetifyRule);
app.use(router);
app.use(pinia);

app.mount('#root');
