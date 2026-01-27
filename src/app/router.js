import { createRouter, createWebHistory } from "vue-router";
import DiscountList from "../pages/discounts/DiscountList.vue";

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: "/", redirect: "/discounts" },
        { path: "/discounts", component: DiscountList },
    ],
});
