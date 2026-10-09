import api from "../api";

// Interfaces

export interface VehiclePart {
  id: number;
  part_name: string;
  category: string;
  quantity: number;
  unit_price: string | number;
  image_path?: string | null;
  image_url?: string | null;
  archived: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VehiclePartFormData {
  part_name: string;
  category: string;
  unit_price: number;
  quantity?: number;
  reference_no?: string;
  image?: File | null;
  remove_image?: boolean;
  archived?: boolean;
}

export interface VehiclePartsResponse {
  message: string;
  data: VehiclePart[];
}

export interface VehiclePartResponse {
  message: string;
  data: VehiclePart;
}

const toFormData = (data: VehiclePartFormData): FormData => {
  const formData = new FormData();

  formData.append("part_name", data.part_name);
  formData.append("category", data.category);
  formData.append("unit_price", String(data.unit_price));

  if (data.quantity !== undefined) {
    formData.append("quantity", String(data.quantity));
  }
  if (data.reference_no) {
    formData.append("reference_no", data.reference_no);
  }
  if (data.image) {
    formData.append("image", data.image, data.image.name);
  }
  if (data.remove_image) {
    formData.append("remove_image", "1");
  }
  if (data.archived !== undefined) {
    formData.append("archived", data.archived ? "1" : "0");
  }

  return formData;
};

// API

/**
 * Get all active vehicle parts.
 */
export const getVehicleParts = async (): Promise<VehiclePart[]> => {
  const response = await api.get<VehiclePartsResponse>("/vehicle-parts");

  return response.data.data;
};

/**
 * Get a single vehicle part.
 */
export const getVehiclePart = async (id: number): Promise<VehiclePart> => {
  const response = await api.get<VehiclePartResponse>(`/vehicle-parts/${id}`);

  return response.data.data;
};

/**
 * Create a new vehicle part.
 */
export const createVehiclePart = async (
  data: VehiclePartFormData,
): Promise<VehiclePart> => {
  const response = await api.post<VehiclePartResponse>(
    "/vehicle-parts",
    toFormData(data),
  );

  return response.data.data;
};

/**
 * Update a vehicle part.
 */
export const updateVehiclePart = async (
  id: number,
  data: VehiclePartFormData,
): Promise<VehiclePart> => {
  const formData = toFormData({ ...data, quantity: undefined });

  formData.append("_method", "PUT");

  const response = await api.post<VehiclePartResponse>(
    `/vehicle-parts/${id}`,
    formData,
  );

  return response.data.data;
};

/**
 * Archive a vehicle part.
 */
export const archiveVehiclePart = async (id: number): Promise<void> => {
  await api.delete(`/vehicle-parts/${id}`);
};
