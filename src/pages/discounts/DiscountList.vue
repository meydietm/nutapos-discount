<script setup>
import { computed, onMounted, ref } from "vue";
import { getDiscountApiUrl, setDiscountApiUrl } from "../../services/http";
import { useDiscountsStore } from "../../stores/discounts.store";
import DiscountEmptyState from "../../components/discounts/DiscountEmptyState.vue";
import DiscountDialog from "../../components/discounts/DiscountDialog.vue";
import DeleteConfirmDialog from "../../components/discounts/DeleteConfirmDialog.vue";
import { formatDiscountValue } from "../../utils/format";

const store = useDiscountsStore();
const apiMenu = ref(false);
const apiUrlInput = ref(getDiscountApiUrl());

async function applyApiUrl() {
  setDiscountApiUrl(apiUrlInput.value);
  apiMenu.value = false;
  await store.fetchAll();
}

const q = ref("");

const isTrulyEmpty = computed(() => !store.loading && store.items.length === 0);

// table selection
const selectedIds = ref([]);

const hasSelection = computed(() => selectedIds.value.length > 0);

const selectedOnPageCount = computed(() =>
  pagedItems.value.filter((x) => selectedIds.value.includes(x._id)).length
);

const headerChecked = computed(() => {
  if (pagedItems.value.length === 0) return false;
  return selectedOnPageCount.value === pagedItems.value.length;
});

const headerIndeterminate = computed(() => {
  if (pagedItems.value.length === 0) return false;
  return selectedOnPageCount.value > 0 && selectedOnPageCount.value < pagedItems.value.length;
});
function toggleAll(v) {
  const ids = pagedItems.value.map((x) => x._id);
  if (v) selectedIds.value = Array.from(new Set([...selectedIds.value, ...ids]));
  else selectedIds.value = selectedIds.value.filter((id) => !ids.includes(id));
}
function toggleOne(id, v) {
  if (v) selectedIds.value = Array.from(new Set([...selectedIds.value, id]));
  else selectedIds.value = selectedIds.value.filter((x) => x !== id);
}

// sort
const sortKey = ref("name"); // name | value
const sortDir = ref("asc");  // asc | desc
function toggleSort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  else {
    sortKey.value = key;
    sortDir.value = "asc";
  }
}

// pagination
const page = ref(1);
const perPage = ref(10);

const filtered = computed(() => {
  const keyword = q.value.trim().toLowerCase();
  let items = [...store.items];

  if (keyword) items = items.filter((x) => String(x.name || "").toLowerCase().includes(keyword));

  // sorting
  items.sort((a, b) => {
    const dir = sortDir.value === "asc" ? 1 : -1;

    if (sortKey.value === "name") {
      return String(a.name || "").localeCompare(String(b.name || "")) * dir;
    }

    // value sort: percent & fixed disortir berdasarkan angka value
    const av = Number(a.value || 0);
    const bv = Number(b.value || 0);
    return (av - bv) * dir;
  });

  return items;
});

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / perPage.value)));

const pagedItems = computed(() => {
  const start = (page.value - 1) * perPage.value;
  return filtered.value.slice(start, start + perPage.value);
});

// dialog create/edit
const dialog = ref(false);
const editing = ref(null);

function openCreate() {
  editing.value = null;
  dialog.value = true;
}

function openEdit(item) {
  editing.value = { ...item };
  dialog.value = true;
}

async function handleSave(payload) {
  if (editing.value?._id) {
    await store.update(editing.value._id, payload);
    snackbar.value = { open: true, text: `${payload.name} berhasil disimpan.` };
  } else {
    const oldItem = store.items.find((x) => x.isNew);
    if (oldItem) {
      // delete isNew key from old item object with slice and spread
      const updatedOldItem = { ...oldItem };
      delete updatedOldItem.isNew;
      // update store
      store.items = store.items.map((x) => (x._id === oldItem._id ? updatedOldItem : x));
      await store.update(oldItem._id, updatedOldItem);
    }
    await store.create({ ...payload, isNew: true });
    snackbar.value = { open: true, text: `${payload.name} berhasil ditambahkan.` };
  }
}

// bulk delete
const deleteDialog = ref(false);
const deleting = ref(false);

const deleteTargetLabel = computed(() => {
  const count = selectedIds.value.length;
  if (count === 0) return "";
  if (count === 1) {
    const id = selectedIds.value[0];
    const item = store.items.find((x) => x._id === id);
    return item?.name || "";
  }
  return `yang dipilih`;
});

const snackbar = ref({ open: false, text: "" });

function clearSelection() {
  selectedIds.value = [];
}

function openDelete() {
  deleteDialog.value = true;
}

function openSingleDelete(item) {
  selectedIds.value = [item._id];
  dialog.value = false;
  deleteDialog.value = true;
}

async function confirmDelete() {
  if (!selectedIds.value.length) return;
  deleting.value = true;
  try {
    const { successIds, failedIds } = await store.deleteMany(selectedIds.value);

    // remove deleted ids from current selection
    if (successIds.length) {
      selectedIds.value = selectedIds.value.filter((id) => !successIds.includes(id));
      snackbar.value = { open: true, text: `Diskon berhasil dihapus.` };
    }

    if (failedIds.length) {
      snackbar.value = { open: true, text: `Diskon gagal dihapus.` };
    }

    // close dialog when nothing left selected
    if (selectedIds.value.length === 0) deleteDialog.value = false;
  } finally {
    deleting.value = false;
  }
}


onMounted(() => store.fetchAll());
</script>

<template>

  <div class="page">
    <v-card class="pa-6 bg-card" rounded="xl" elevation="0">
      <div class="d-flex align-start justify-space-between">
        <div>
          <div class="text-h5 font-weight-bold">Daftar Diskon</div>
          <div class="text-caption text-medium-emphasis">
            Total jumlah diskon: {{ store.items.length }}
          </div>
        </div>

        <div v-if="!isTrulyEmpty" class="d-flex align-center ga-3">
          <template v-if="hasSelection">
            <v-btn class="text-none px-6" variant="outlined" color="error" rounded="pill" @click="clearSelection">
              Batalkan
            </v-btn>
            <v-btn class="text-none px-6" color="error" rounded="pill" @click="openDelete">
              Hapus
            </v-btn>
          </template>

          <v-btn v-else class="add-btn px-6" color="green-nutapos" rounded="pill" prepend-icon="mdi-plus"
            @click="openCreate">
            Tambah diskon
          </v-btn>
        </div>
      </div>

      <div class="d-flex ga-3 mt-4">
        <v-text-field v-if="!isTrulyEmpty" v-model="q" placeholder="Cari diskon" variant="outlined" rounded="pill"
          density="comfortable" prepend-inner-icon="mdi-magnify" class="search" hide-details />
        <v-menu v-model="apiMenu" :close-on-content-click="false" location="bottom">
          <template #activator="{ props }">
            <v-btn v-bind="props" variant="outlined" rounded="lg" class="px-4" height="44"
              prepend-icon="mdi-storefront-outline" color="grey-darken-2 text-none">
              Kopi Anak Bangsa
              <v-icon end>{{ apiMenu ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </template>

          <v-card class="pa-5" rounded="lg" min-width="520">
            <v-text-field v-model="apiUrlInput" label="API URL crudcrud.com" persistent-placeholder variant="outlined"
              rounded="lg" density="comfortable" placeholder="https://crudcrud.com/api/.../diskon" hide-details />

            <div class="d-flex justify-end mt-4">
              <v-btn color="green" class="text-none" rounded="pill" size="large" @click="applyApiUrl">
                Terapkan
              </v-btn>
            </div>
          </v-card>
        </v-menu>
      </div>

      <div v-if="isTrulyEmpty" class="mt-4">
        <v-card variant="outlined" rounded="lg" class="empty-card">
          <DiscountEmptyState @add="openCreate" />
        </v-card>
      </div>

      <div v-else class="table-wrap mt-4">
        <!-- Table -->
        <v-table>
          <thead>
            <tr class="thead">
              <th class="w-checkbox">
                <v-checkbox density="compact" color="green-nutapos" hide-details :model-value="headerChecked"
                  :indeterminate="headerIndeterminate" true-icon="mdi-checkbox-marked"
                  false-icon="mdi-checkbox-blank-outline" indeterminate-icon="mdi-minus-box"
                  @update:model-value="toggleAll" />
              </th>
              <th @click="toggleSort('name')" class="sortable">
                <div class="d-flex align-center ga-2">
                  <span class="font-weight-semibold">Nama Diskon</span>
                  <v-icon v-if="sortKey === 'name'" size="16">
                    {{ sortDir === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                  </v-icon>
                </div>
              </th>
              <th @click="toggleSort('value')" class="sortable">
                <div class="d-flex align-center ga-2">
                  <span class="font-weight-semibold">Nilai Diskon</span>
                  <v-icon size="16">
                    <!-- ikon sort umum jika belum aktif -->
                    {{ sortKey === 'value' ? (sortDir === 'asc' ? 'mdi-arrow-up' : 'mdi-arrow-down') :
                      'mdi-unfold-more-horizontal' }}
                  </v-icon>
                </div>
              </th>
              <th class="w-action"></th>
            </tr>
          </thead>

          <tbody class="bg-table">
            <tr v-if="store.loading">
              <td colspan="4" class="py-8 text-center text-medium-emphasis">Loading...</td>
            </tr>

            <tr v-else-if="pagedItems.length === 0">
              <td colspan="4" class="py-8 text-center text-medium-emphasis">Tidak ditemukan data yang cocok</td>
            </tr>

            <tr v-else v-for="item in pagedItems" :key="item._id">
              <td class="w-checkbox">
                <v-checkbox density="compact" color="green-nutapos" hide-details true-icon="mdi-checkbox-marked"
                  false-icon="mdi-checkbox-blank-outline" :model-value="selectedIds.includes(item._id)"
                  @update:model-value="(v) => toggleOne(item._id, v)" />
              </td>

              <td>
                <div class="d-flex align-center ga-2">
                  <span class="font-weight-medium">{{ item.name }}</span>
                  <v-chip v-if="item.isNew" size="small" color="info" variant="tonal" rounded="pill">
                    baru
                  </v-chip>
                </div>
              </td>

              <td class="text-medium-emphasis">{{ formatDiscountValue(item) }}</td>

              <td class="w-action text-right">
                <v-btn icon variant="text" size="small" @click="openEdit(item)">
                  <v-icon size="18" color="grey-darken-2">mdi-pencil-outline</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <!-- Footer: per page + pagination -->
      <div v-if="!isTrulyEmpty" class="d-flex align-center justify-space-between mt-4">
        <div class="d-flex align-center ga-3">
          <v-select v-model="perPage" :items="[10, 25, 50]" variant="outlined" rounded="lg" density="comfortable"
            hide-details style="max-width: 90px" />
          <div class="text-body-2 text-medium-emphasis">data per halaman</div>
        </div>

        <v-pagination v-model="page" :length="totalPages" total-visible="7" rounded="circle"
          active-color="green-nutapos" />
      </div>
    </v-card>

    <!-- Dialog -->
    <DiscountDialog v-model="dialog" :initial-data="editing" :existing-items="store.items" @save="handleSave"
      @request-delete="openSingleDelete" />

    <DeleteConfirmDialog v-model="deleteDialog" :target-label="deleteTargetLabel" :loading="deleting"
      @cancel="deleteDialog = false" @confirm="confirmDelete" />

    <v-snackbar v-model="snackbar.open" :timeout="3000" location="top center" color="teal-darken-4" rounded="lg">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<style scoped>
.page {
  padding: 28px;
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.bg-card {
  background-color: #ffffff;
}

.search {
  max-width: 320px;
}

.outlet {
  max-width: 260px;
}

.add-btn {
  text-transform: none;
}

.table-wrap {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  overflow: hidden;
}

.bg-table {
  background: #ffffff;
}

.thead {
  background: #f9fafa;
}

.w-checkbox {
  width: 52px;
}

.w-action {
  width: 64px;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.empty-card {
  padding: 42px 20px;
  min-height: 420px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
