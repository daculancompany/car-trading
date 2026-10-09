import api from "../api";

// Vehicle Specification Interfaces

export interface VehicleSpecVehicleBrand {
  id: number;
  brand: string;
  is_active?: boolean;
}

export interface VehicleSpecVehicleModel {
  id: number;
  brand_id: number;
  model: string;
  is_active?: boolean;
}

export interface VehicleSpecVehicleVariant {
  id: number;
  model_id: number;
  variant: string;
  is_active?: boolean;
}

export interface VehicleSpecVehicle {
  id: number;

  brand_id: number;
  model_id: number;
  variant_id: number;

  stock_no?: string;
  year_model?: number;
  color?: string;

  brand?: VehicleSpecVehicleBrand;
  model?: VehicleSpecVehicleModel;
  variant?: VehicleSpecVehicleVariant;
}

// Vehicle Specification

export interface VehicleSpec {
  id: number;

  vehicle_id: number;

  plate_number: string;
  engine_number: string;
  chassis_number: string;

  mileage: number;

  fuel_type: FuelType;

  transmission: TransmissionType;

  vehicle: VehicleSpecVehicle;

  created_at?: string;
  updated_at?: string;
}

// Vehicle Specification Request Types

export type FuelType = "gasoline" | "diesel" | "electric";

export type TransmissionType = "manual" | "automatic";

export interface VehicleSpecRequest {
  plate_number: string;
  engine_number: string;
  chassis_number: string;

  mileage?: number;

  fuel_type?: FuelType;

  transmission?: TransmissionType;
}

// Create Vehicle Specification

export interface CreateVehicleSpecData {
  vehicle_id: number;

  plate_number: string;
  engine_number: string;
  chassis_number: string;

  mileage: number;

  fuel_type: FuelType;

  transmission: TransmissionType;
}

// Update Vehicle Specification

export interface UpdateVehicleSpecData {
  vehicle_id?: number;

  plate_number?: string;
  engine_number?: string;
  chassis_number?: string;

  mileage?: number;

  fuel_type?: FuelType;

  transmission?: TransmissionType;
}

// API Responses

interface VehicleSpecResponse {
  message: string;
  data: VehicleSpec;
}

interface VehicleSpecListResponse {
  message: string;
  data: VehicleSpec[];
}

// GET ALL VEHICLE SPECIFICATIONS
// GET /api/vehicle-specs
// Protected

export const getVehicleSpecs = async (): Promise<VehicleSpec[]> => {
  const response = await api.get<VehicleSpecListResponse>("/vehicle-specs");

  return response.data.data;
};

// GET SINGLE VEHICLE SPECIFICATION
// GET /api/vehicle-specs/{id}
// Protected

export const getVehicleSpec = async (id: number): Promise<VehicleSpec> => {
  const response = await api.get<VehicleSpecResponse>(`/vehicle-specs/${id}`);

  return response.data.data;
};

// CREATE VEHICLE SPECIFICATION
// POST /api/vehicle-specs
// Protected

export const createVehicleSpec = async (
  data: CreateVehicleSpecData,
): Promise<VehicleSpec> => {
  const response = await api.post<VehicleSpecResponse>("/vehicle-specs", data);

  return response.data.data;
};

// UPDATE VEHICLE SPECIFICATION
// PATCH /api/vehicle-specs/{id}
// Protected

export const updateVehicleSpec = async (
  id: number,
  data: UpdateVehicleSpecData,
): Promise<VehicleSpec> => {
  const response = await api.patch<VehicleSpecResponse>(
    `/vehicle-specs/${id}`,
    data,
  );

  return response.data.data;
};

// DELETE VEHICLE SPECIFICATION
// DELETE /api/vehicle-specs/{id}
// Protected

export const deleteVehicleSpec = async (id: number): Promise<void> => {
  await api.delete(`/vehicle-specs/${id}`);
};
