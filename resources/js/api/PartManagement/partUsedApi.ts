import api from "../api";

// Interfaces

export interface JobOrder {
  id: number;
  job_order_number?: string;
  status?: string;
}

export interface VehiclePart {
  id: number;
  part_name: string;
  category: string;
  quantity: number;
  unit_price: string | number;
  archived: boolean;
}

export interface PartsUsed {
  id: number;
  job_order_id: number;
  vehicle_part_id: number;
  quantity: number;
  used_at: string;

  // Loaded relationships
  job_order?: JobOrder;
  vehicle_part?: VehiclePart;

  created_at?: string;
  updated_at?: string;
}

export interface PartsUsedFormData {
  job_order_id: number;
  vehicle_part_id: number;
  quantity: number;
  used_at: string;
}

export interface PartsUsedResponse {
  message: string;
  data: PartsUsed;
}

export interface PartsUsedListResponse {
  message: string;
  data: PartsUsed[];
}

// API

/**
 * Get all parts used.
 */
export const getPartsUsed = async (): Promise<PartsUsed[]> => {
  const response = await api.get<PartsUsedListResponse>(
    "/parts-used"
  );

  return response.data.data;
};

/**
 * Get a specific parts-used record.
 */
export const getPartsUsedById = async (
  id: number
): Promise<PartsUsed> => {
  const response = await api.get<PartsUsedResponse>(
    `/parts-used/${id}`
  );

  return response.data.data;
};

/**
 * Create a parts-used record.
 *
 * This also deducts the quantity from vehicle_parts
 * on the Laravel backend.
 */
export const createPartsUsed = async (
  data: PartsUsedFormData
): Promise<PartsUsed> => {
  const response = await api.post<PartsUsedResponse>(
    "/parts-used",
    data
  );

  return response.data.data;
};

/**
 * Update a parts-used record.
 *
 * The Laravel backend automatically adjusts the
 * vehicle part inventory.
 */
export const updatePartsUsed = async (
  id: number,
  data: PartsUsedFormData
): Promise<PartsUsed> => {
  const response = await api.put<PartsUsedResponse>(
    `/parts-used/${id}`,
    data
  );

  return response.data.data;
};

/**
 * Delete a parts-used record.
 *
 * The Laravel backend returns the used quantity
 * back to the vehicle parts inventory.
 */
export const deletePartsUsed = async (
  id: number
): Promise<void> => {
  await api.delete(`/parts-used/${id}`);
};

