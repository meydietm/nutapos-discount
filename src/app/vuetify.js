import "vuetify/styles";
import { createVuetify } from "vuetify";
import { md3 } from "vuetify/blueprints";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default createVuetify({
    blueprint: md3,
    components,
    directives,
    theme: {
        themes: {
            light: {
                dark: false,
                colors: {
                    "green-nutapos": '#3dae2f',
                    "error": '#ff3553',
                },
            },
        },
    },
});
