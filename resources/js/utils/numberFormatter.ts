export const formatNumber = (value?: number | null): string => {
  if (value === undefined || value === null) {
    return "";
  }

  return value.toLocaleString("en-PH");
};

export const formatPeso = (value?: number): string => {
  if (value === undefined || value === null) {
    return "₱ 0.00";
  }

  return value.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseNumber = (value: string): number | undefined => {
  const cleaned = value.replace(/\D/g, "");

  if (cleaned === "") {
    return undefined;
  }

  return Number(cleaned);
};
