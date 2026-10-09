import api from "../api";

export type StockMovementType =
  | "receiving"
  | "stock_in"
  | "stock_out"
  | "damage";

export interface StockMovement {
  id: number;
  vehicle_part_id: number;
  type: StockMovementType;
  quantity: number;
  unit_cost: string | number;
  amount: string | number;
  previous_quantity: number;
  new_quantity: number;
  reference_type: "job_order" | "manual" | null;
  job_order_id: number | null;
  parts_used_id: number | null;
  reference_no: string | null;
  remarks: string | null;
  image_url?: string | null;
  created_by: number | null;
  moved_at: string;

  vehicle_part?: {
    id: number;
    part_name: string;
    category: string;
    image_url?: string | null;
  };
  job_order?: { id: number; job_order_no: string } | null;
  creator?: { id: number; username: string } | null;
}

export interface StockMovementFormData {
  vehicle_part_id: number;
  type: StockMovementType;
  quantity: number;
  unit_cost: number;
  job_order_id?: number | null;
  reference_no?: string;
  remarks?: string;
  moved_at?: string;
  image?: File | null;
}

export interface StockMovementFilters {
  vehicle_part_id?: number;
  type?: StockMovementType | "";
  from?: string;
  to?: string;
}

export const STOCK_MOVEMENT_TYPES: {
  value: StockMovementType;
  label: string;
  color: string;
  incoming: boolean;
}[] = [
  { value: "receiving", label: "In · Receiving", color: "green", incoming: true },
  { value: "stock_in", label: "In · Returned", color: "blue", incoming: true },
  { value: "stock_out", label: "Out · Used", color: "orange", incoming: false },
  { value: "damage", label: "Out · Damage", color: "red", incoming: false },
];

export const stockMovementType = (type: StockMovementType) =>
  STOCK_MOVEMENT_TYPES.find((item) => item.value === type) ??
  STOCK_MOVEMENT_TYPES[0];

export const getStockMovements = async (
  filters: StockMovementFilters = {},
): Promise<StockMovement[]> => {
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== "" && value != null),
  );

  const response = await api.get<{ message: string; data: StockMovement[] }>(
    "/part-stock-movements",
    { params },
  );

  return response.data.data;
};

export const createStockMovement = async (
  data: StockMovementFormData,
): Promise<StockMovement> => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (value instanceof File) {
      formData.append(key, value, value.name);
    } else {
      formData.append(key, String(value));
    }
  });

  const response = await api.post<{ message: string; data: StockMovement }>(
    "/part-stock-movements",
    formData,
  );

  return response.data.data;
};
