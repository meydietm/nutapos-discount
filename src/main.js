import { createApp } from "vue";
import App from "./App.vue";

import { createPinia } from "pinia";
import router from "./app/router";

import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import vuetify from "./app/vuetify";

createApp(App)
    .use(createPinia())
    .use(router)
    .use(vuetify)
    .mount("#app");
