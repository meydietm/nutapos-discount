import { http } from "./http";

export async function listDiscounts() {
    const { data } = await http.get("");
    return data;
}

export async function createDiscount(payload) {
    const { data } = await http.post("", payload);
    return data;
}

export async function updateDiscount(id, payload) {
    const { _id, ...clean } = payload || {};
    await http.put(`/${id}`, clean);
}

export async function deleteDiscount(id) {
    await http.delete(`/${id}`);
}
