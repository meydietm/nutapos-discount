<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  targetLabel: { type: String, default: "" },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

const open = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

function cancel() {
  emit("cancel");
  open.value = false;
}

function confirm() {
  emit("confirm");
}
</script>

<template>
  <v-dialog v-model="open" max-width="560" scrim="rgba(0,0,0,0.35)">
    <v-card class="pa-6" rounded="xl">
      <div class="text-h6 font-weight-bold mb-4">Hapus Diskon</div>

      <div class="text-body-2 text-medium-emphasis">
        Apakah Anda yakin ingin menghapus diskon {{ targetLabel }}?
      </div>

      <ul class="mt-1 mb-0 note ms-1">
        <li class="text-body-2 text-medium-emphasis">
          Diskon yang dihapus tidak bisa dikembalikan lagi.
        </li>
      </ul>

      <div class="d-flex justify-end ga-3 mt-6">
        <v-btn class="text-none px-6" variant="outlined" color="error" rounded="pill" @click="cancel">
          Batalkan
        </v-btn>

        <v-btn class="text-none px-6" color="error" rounded="pill" :loading="loading" @click="confirm">
          Hapus
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.note {
  padding-left: 18px;
}
</style>
