import axios from "axios";

const LS_KEY = "nutapos.crudcrud.discountUrl";
const DEFAULT_URL = import.meta.env.VITE_CRUDCRUD_BASE_URL;

const initial = localStorage.getItem(LS_KEY) || DEFAULT_URL;

export const http = axios.create({
    baseURL: initial,
    timeout: 15000,
});

export function setDiscountApiUrl(url) {
    const clean = String(url || "").trim().replace(/\/+$/, "");
    http.defaults.baseURL = clean;
    localStorage.setItem(LS_KEY, clean);
}

export function getDiscountApiUrl() {
    return http.defaults.baseURL;
}
