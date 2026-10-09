import api from "../api";

// Vehicle Variant Interfaces

export interface VehicleVariantBrand {
  id: number;
  brand: string;
  is_active?: boolean;
}

export interface VehicleVariantModel {
  id: number;
  brand_id: number;
  model: string;
  is_active?: boolean;
  brand?: VehicleVariantBrand;
}

export interface VehicleVariant {
  id: number;
  model_id: number;
  variant: string;
  is_active: boolean;

  model: VehicleVariantModel;

  vehicles_count?: number;

  created_at?: string;
  updated_at?: string;
}

// Create Vehicle Variant

export interface CreateVehicleVariantData {
  model_id: number;
  variant: string;
  is_active?: boolean;
}

// Update Vehicle Variant

export interface UpdateVehicleVariantData {
  model_id?: number;
  variant?: string;
  is_active?: boolean;
}

// API Responses

interface VehicleVariantResponse {
  message: string;
  data: VehicleVariant;
}

interface VehicleVariantListResponse {
  message: string;
  data: VehicleVariant[];
}

// GET ALL VEHICLE VARIANTS
// GET /api/vehicle-variants
// Public

export const getVehicleVariants = async (): Promise<VehicleVariant[]> => {
  const response =
    await api.get<VehicleVariantListResponse>("/vehicle-variants");

  return response.data.data;
};

// GET SINGLE VEHICLE VARIANT
// GET /api/vehicle-variants/{id}
// Public

export const getVehicleVariant = async (
  id: number,
): Promise<VehicleVariant> => {
  const response = await api.get<VehicleVariantResponse>(
    `/vehicle-variants/${id}`,
  );

  return response.data.data;
};

// CREATE VEHICLE VARIANT
// POST /api/vehicle-variants
// Protected

export const createVehicleVariant = async (
  data: CreateVehicleVariantData,
): Promise<VehicleVariant> => {
  const response = await api.post<VehicleVariantResponse>(
    "/vehicle-variants",
    data,
  );

  return response.data.data;
};

// UPDATE VEHICLE VARIANT
// PATCH /api/vehicle-variants/{id}
// Protected

export const updateVehicleVariant = async (
  id: number,
  data: UpdateVehicleVariantData,
): Promise<VehicleVariant> => {
  const response = await api.patch<VehicleVariantResponse>(
    `/vehicle-variants/${id}`,
    data,
  );

  return response.data.data;
};

// DELETE VEHICLE VARIANT
// DELETE /api/vehicle-variants/{id}
// Protected

export const deleteVehicleVariant = async (id: number): Promise<void> => {
  await api.delete(`/vehicle-variants/${id}`);
};
