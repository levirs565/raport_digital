import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { id } from 'vuetify/locale';
import { md3 } from 'vuetify/blueprints';
import { createRulesPlugin } from 'vuetify/labs/rules';

export const vuetify = createVuetify({
  components,
  directives,
  blueprint: md3,
  locale: {
    locale: 'id',
    messages: { id },
  },
});

export const vuetifyRule = createRulesPlugin({}, vuetify.locale);
