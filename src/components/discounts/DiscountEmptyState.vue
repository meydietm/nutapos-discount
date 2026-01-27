<script setup>
defineEmits(["add"]);
</script>

<template>
    <div class="empty">
        <div class="illus" aria-hidden="true">
            <img src="../../assets/empty-image.JPG" alt="Ilustrasi tidak ada diskon" />
        </div>

        <div class="title">Belum Ada Diskon</div>
        <div class="desc">
            Silahkan tambah diskon untuk menarik pelanggan dan<br />
            meningkatkan penjualan.
        </div>

        <v-btn color="green-nutapos" rounded="pill" size="large" prepend-icon="mdi-plus" class="mt-6 text-none px-6"
            @click="$emit('add')">
            Tambah diskon
        </v-btn>
    </div>
</template>

<style scoped>
.empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding-top: 64px;
    padding-bottom: 64px;
}

.illus {
    margin-top: 10px;
    margin-bottom: 10px;
}

.illus img {
    width: 250px;
    height: auto;
}

.title {
    font-size: 18px;
    font-weight: 700;
    margin-top: 6px;
}

.desc {
    margin-top: 6px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.6);
    line-height: 1.5;
}
</style>
