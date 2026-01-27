import { defineStore } from "pinia";
import { listDiscounts, createDiscount, updateDiscount, deleteDiscount } from "../services/discounts.api";

export const useDiscountsStore = defineStore("discounts", {
    state: () => ({
        items: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchAll() {
            this.loading = true;
            this.error = null;
            try {
                this.items = await listDiscounts();
            } catch (e) {
                this.error = e?.message || "Gagal memuat data diskon";
            } finally {
                this.loading = false;
            }
        },

        async create(payload) {
            this.error = null;
            const created = await createDiscount(payload);
            this.items.unshift(created);
            return created;
        },

        async update(id, payload) {
            this.error = null;
            await updateDiscount(id, payload);
            const idx = this.items.findIndex((x) => x._id === id);
            if (idx >= 0) this.items[idx] = { ...this.items[idx], ...payload, _id: id };
        },

        /**
         * Bulk delete by ids.
         * Returns { successIds: string[], failedIds: string[] }
         */
        async deleteMany(ids = []) {
            this.error = null;

            const uniqueIds = Array.from(new Set(ids)).filter(Boolean);
            if (uniqueIds.length === 0) return { successIds: [], failedIds: [] };

            const successIds = [];
            const failedIds = [];

            for (const id of uniqueIds) {
                try {
                    await deleteDiscount(id);
                    successIds.push(id);
                } catch (e) {
                    failedIds.push(id);
                }
            }

            if (successIds.length) {
                this.items = this.items.filter((x) => !successIds.includes(x._id));
            }

            if (failedIds.length) {
                this.error = "Sebagian diskon gagal dihapus";
            }

            return { successIds, failedIds };
        },
    },
});
