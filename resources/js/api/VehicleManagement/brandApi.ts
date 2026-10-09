import api from "../api";

// Vehicle Brand Interfaces

export interface VehicleBrand {
  id: number;
  brand: string;
  is_active: boolean;

  models_count?: number;

  created_at?: string;
  updated_at?: string;
}

// Create Vehicle Brand

export interface CreateVehicleBrandData {
  brand: string;
  is_active?: boolean;
}

// Update Vehicle Brand

export interface UpdateVehicleBrandData {
  brand: string;
  is_active?: boolean;
}

// API Responses

interface VehicleBrandResponse {
  message: string;
  data: VehicleBrand;
}

interface VehicleBrandListResponse {
  message: string;
  data: VehicleBrand[];
}

// GET ALL VEHICLE BRANDS
// Public endpoint:
// GET /api/vehicle-brands

export const getVehicleBrands = async (): Promise<VehicleBrand[]> => {
  const response = await api.get<VehicleBrandListResponse>("/vehicle-brands");

  return response.data.data;
};

// GET SINGLE VEHICLE BRAND
// Public endpoint:
// GET /api/vehicle-brands/{id}

export const getVehicleBrand = async (id: number): Promise<VehicleBrand> => {
  const response = await api.get<VehicleBrandResponse>(`/vehicle-brands/${id}`);

  return response.data.data;
};

// CREATE VEHICLE BRAND
// Protected endpoint:
// POST /api/vehicle-brands

export const createVehicleBrand = async (
  data: CreateVehicleBrandData,
): Promise<VehicleBrand> => {
  const response = await api.post<VehicleBrandResponse>(
    "/vehicle-brands",
    data,
  );

  return response.data.data;
};

// UPDATE VEHICLE BRAND
// Protected endpoint:
// PUT/PATCH /api/vehicle-brands/{id}

export const updateVehicleBrand = async (
  id: number,
  data: UpdateVehicleBrandData,
): Promise<VehicleBrand> => {
  const response = await api.patch<VehicleBrandResponse>(
    `/vehicle-brands/${id}`,
    data,
  );

  return response.data.data;
};

// DELETE VEHICLE BRAND
// Protected endpoint:
// DELETE /api/vehicle-brands/{id}

export const deleteVehicleBrand = async (id: number): Promise<void> => {
  await api.delete(`/vehicle-brands/${id}`);
};
