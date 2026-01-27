<script setup>
import { computed, reactive, ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  initialData: { type: Object, default: null },
  existingItems: { type: Array, default: () => [] },
});
const emit = defineEmits(["update:modelValue", "save", "request-delete"]);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const isEdit = computed(() => !!props.initialData?._id);

const formRef = ref(null);
const valid = ref(false);
const submitting = ref(false);

const form = reactive({
  name: "",
  type: "percent", // "percent" | "fixed"
  value: null,
});

watch(
  () => props.initialData,
  (val) => {
    if (val?._id) {
      form.name = val.name ?? "";
      form.type = val.type ?? "percent";
      form.value = Number(val.value ?? 0);
    } else {
      form.name = "";
      form.type = "percent";
      form.value = null;
    }
  },
  { immediate: true }
);

const normalize = (s) => String(s || "").trim().toLowerCase();

const uniqueNameRule = (v) => {
  const name = normalize(v);
  if (!name) return "Nama diskon tidak boleh kosong.";

  const currentId = props.initialData?._id;
  const dup = props.existingItems.some((it) => {
    return normalize(it?.name) === name && it?._id !== currentId;
  });

  return dup ? "Nama diskon sudah digunakan, silakan gunakan nama lain." : true;
};

const rules = {
  required: (v) => !!String(v || "").trim() || "Nama diskon tidak boleh kosong.",
  uniqueName: uniqueNameRule,
  requiredNumber: (v) => v !== null && v !== undefined && v !== "" || "Diskon tidak boleh kosong.",
  nonNegative: (v) => Number(v) >= 0 || "Diskon tidak boleh negatif.",
  nonZero: (v) => Number(v) !== 0 || 'Diskon tidak boleh "0".',
  percentRange: (v) => {
    if (form.type !== "percent") return true;
    const n = Number(v);
    if (n > 100) return "Persentase diskon maksimal 100%.";
    return true;
  },
};

function close() {
  open.value = false;
}

async function submit() {
  const ok = await formRef.value?.validate();
  if (!ok?.valid) return;

  submitting.value = true;
  try {
    emit("save", {
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value),
    });
    close();
  } finally {
    submitting.value = false;
    // reset form
    form.name = "";
    form.type = "percent";
    form.value = null;
    formRef.value?.resetValidation();
  }
}
</script>

<template>
  <v-dialog v-model="open" max-width="520">
    <v-card class="pa-6" rounded="xl">
      <div class="d-flex align-center justify-space-between mb-4">
        <div class="text-h5 font-weight-bold">{{ isEdit ? "Edit Diskon" : "Tambah Diskon" }}</div>
        <v-btn icon variant="text" color="grey-darken-2" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-form ref="formRef" v-model="valid">
        <div>
          <v-text-field v-model="form.name" label="Nama Diskon" placeholder="Misal: Diskon opening, diskon akhir tahun"
            persistent-placeholder variant="outlined" rounded="lg" density="comfortable"
            :rules="[rules.required, rules.uniqueName]" class="mb-2" />
        </div>

        <div class="d-flex ga-3 align-top">
          <v-text-field v-model.number="form.value" label="Diskon" placeholder="0" persistent-placeholder type="number"
            min="0" variant="outlined" rounded="lg" density="comfortable" class="flex-grow-1"
            :suffix="form.type === 'percent' ? '%' : ''" :prefix="form.type === 'fixed' ? 'Rp' : ''"
            :rules="[rules.requiredNumber, rules.nonNegative, rules.percentRange, rules.nonZero]" />

          <div class="segmented">
            <v-btn class="seg-btn left-seg-btn" :class="{ active: form.type === 'percent' }" variant="text"
              @click="form.type = 'percent'" color="grey-darken-3">
              <v-icon v-if="form.type === 'percent'" size="18" class="mr-1">mdi-check</v-icon>
              <span>%</span>
            </v-btn>

            <v-btn class="seg-btn" :class="{ active: form.type === 'fixed' }" variant="text"
              @click="form.type = 'fixed'" color="grey-darken-3">
              <v-icon v-if="form.type === 'fixed'" size="18" class="mr-1">mdi-check</v-icon>
              <span>Rp</span>
            </v-btn>
          </div>
        </div>

        <v-btn v-if="!isEdit" block class="mt-4 text-none" color="green-nutapos" rounded="pill" size="large"
          :loading="submitting" @click="submit">
          Simpan
        </v-btn>

        <div v-else class="d-flex align-center justify-space-between mt-4">
          <v-btn variant="text" color="error" class="text-none" @click="emit('request-delete', props.initialData)">
            Hapus
          </v-btn>

          <v-btn color="green-nutapos" rounded="pill" size="large" class="text-none" :loading="submitting"
            style="min-width: 160px" @click="submit">
            Simpan
          </v-btn>
        </div>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.segmented {
  display: inline-flex;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 14px;
  overflow: hidden;
  height: 44px;
}

.seg-btn {
  height: 44px !important;
  border-radius: 0 !important;
  text-transform: none;
  font-weight: 600;
}

.left-seg-btn {
  border-right: 1px solid rgba(0, 0, 0, 0.12) !important;
}

.seg-btn.active {
  background: #F0FBEF !important;
  color: #3dae2f !important;
}
</style>
