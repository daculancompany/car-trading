export const labelize = (value: string): string =>
    value ? value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "—";

export const statusColor = (status: string): string => {
    if (["completed", "verified", "released", "available", "approved", "in", "receiving", "paid"].includes(status)) return "green";
    if (status.startsWith("pending")) return "yellow";
    if (["cancelled", "rejected", "expired", "out", "damage", "unavailable", "unpaid"].includes(status)) return "red";
    if (["reserved", "assigned", "in_progress", "stock_in"].includes(status)) return "blue";
    if (["sold"].includes(status)) return "purple";
    if (["low", "maintenance", "stock_out", "partial"].includes(status)) return "orange";
    return "gray";
};
