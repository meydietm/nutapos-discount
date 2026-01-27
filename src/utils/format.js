export function formatIDR(amount) {
    const n = Number(amount || 0);
    return "Rp " + n.toLocaleString("id-ID");
}

export function formatDiscountValue(item) {
    if (!item) return "-";
    if (item.type === "percent") return `${Number(item.value || 0)}%`;
    return formatIDR(item.value);
}
