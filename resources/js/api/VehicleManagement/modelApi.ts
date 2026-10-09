import api from "../api";

// Vehicle Model Interfaces

export interface VehicleModelBrand {
  id: number;
  brand: string;
  is_active?: boolean;
}

export interface VehicleModel {
  id: number;
  brand_id: number;
  model: string;
  is_active: boolean;

  brand: VehicleModelBrand;

  variants_count?: number;

  created_at?: string;
  updated_at?: string;
}

// Create Vehicle Model

export interface CreateVehicleModelData {
  brand_id: number;
  model: string;
  is_active?: boolean;
}

// Update Vehicle Model

export interface UpdateVehicleModelData {
  brand_id?: number;
  model?: string;
  is_active?: boolean;
}

// API Responses

interface VehicleModelResponse {
  message: string;
  data: VehicleModel;
}

interface VehicleModelListResponse {
  message: string;
  data: VehicleModel[];
}

// GET ALL VEHICLE MODELS
// GET /api/vehicle-models
// Public

export const getVehicleModels = async (): Promise<VehicleModel[]> => {
  const response = await api.get<VehicleModelListResponse>("/vehicle-models");

  return response.data.data;
};

// GET SINGLE VEHICLE MODEL
// GET /api/vehicle-models/{id}
// Public

export const getVehicleModel = async (id: number): Promise<VehicleModel> => {
  const response = await api.get<VehicleModelResponse>(`/vehicle-models/${id}`);

  return response.data.data;
};

// CREATE VEHICLE MODEL
// POST /api/vehicle-models
// Protected

export const createVehicleModel = async (
  data: CreateVehicleModelData,
): Promise<VehicleModel> => {
  const response = await api.post<VehicleModelResponse>(
    "/vehicle-models",
    data,
  );

  return response.data.data;
};

// UPDATE VEHICLE MODEL
// PATCH /api/vehicle-models/{id}
// Protected

export const updateVehicleModel = async (
  id: number,
  data: UpdateVehicleModelData,
): Promise<VehicleModel> => {
  const response = await api.patch<VehicleModelResponse>(
    `/vehicle-models/${id}`,
    data,
  );

  return response.data.data;
};

// DELETE VEHICLE MODEL
// DELETE /api/vehicle-models/{id}
// Protected

export const deleteVehicleModel = async (id: number): Promise<void> => {
  await api.delete(`/vehicle-models/${id}`);
};
