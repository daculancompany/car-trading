import api from "../api";

// Vehicle User

export interface VehicleUser {
  id: number;
  username: string;
  email: string;
}

// Vehicle Brand

export interface VehicleBrand {
  id: number;
  brand: string;
  is_active?: boolean;
}

// Vehicle Model

export interface VehicleModel {
  id: number;
  brand_id: number;
  model: string;
  is_active?: boolean;
  brand?: VehicleBrand;
}

// Vehicle Variant

export interface VehicleVariant {
  id: number;
  model_id: number;
  variant: string;
  is_active?: boolean;
  model?: VehicleModel;
}

// Vehicle Specification

export interface VehicleSpec {
  id: number;
  vehicle_id: number;
  transmission?: string | null;
  fuel_type?: string | null;
  mileage?: number | null;
  engine_number?: string | null;
  chassis_number?: string | null;
  plate_number?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Vehicle Image

export interface VehicleImage {
  id: number;
  vehicle_id: number;
  image_path: string;
  is_primary?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Vehicle Reservation

export interface VehicleReservation {
  id: number;
  vehicle_id: number;
  customer_id?: number;
  reserved_by_id?: number | null;

  reservation_source?: "online" | "walk_in" | string;

  valid_id_type?: string | null;
  valid_id_front?: string | null;
  valid_id_back?: string | null;

  purchase_option?: "cash" | "financing" | string;

  reserved_at?: string | null;
  expires_at?: string | null;

  reservation_amount?: number | null;

  reservation_status?: string;
  remarks?: string | null;

  created_at?: string;
  updated_at?: string;
}

// Vehicle Expense Type

export interface VehicleExpenseType {
  id: number;
  expense_name: string;
}

// Vehicle Expense

export interface VehicleExpense {
  id: number;
  vehicle_id: number;
  expense_type_id: number;

  amount?: number | null;
  description?: string | null;
  remarks?: string | null;

  expense_type?: VehicleExpenseType;

  created_at?: string;
  updated_at?: string;
}

// Vehicle Document

export interface VehicleDocument {
  id: number;
  vehicle_id: number;

  vehicle_cr_path: string | null;
  vehicle_or_path: string | null;

  created_at?: string;
  updated_at?: string;
}

// Vehicle

export interface Vehicle {
  id: number;

  inspection_badge?: {
    score: number | null;
    good: number;
    attention: number;
    urgent: number;
    damages: number;
    inspected_at: string | null;
    odometer: number | null;
  } | null;

  brand_id: number;
  model_id: number;
  variant_id: number;

  stock_no: string;
  year_model: number;
  color: string;

  description?: string | null;
  features?: string | null;

  selling_price: number;
  reservation_price: number;

  status: string;
  archived: number;

  /**
   * Laravel customer-specific vehicle visibility
   *
   * true  = vehicle is reserved by the logged-in customer
   * false = vehicle is not reserved by the logged-in customer
   */
  is_my_reservation?: boolean;

  is_reservable?: boolean;

  created_at?: string;
  updated_at?: string;

  // Relationships

  createdBy?: VehicleUser;

  brand?: VehicleBrand;
  model?: VehicleModel;
  variant?: VehicleVariant;

  specs?: VehicleSpec | null;
  images?: VehicleImage[];

  expenses?: VehicleExpense[];
  reservations?: VehicleReservation[];

  vehicle_documents?: VehicleDocument | null;
}

// Create Vehicle Request

export interface CreateVehicleData {
  brand_id: number;
  model_id: number;
  variant_id: number;

  year_model: number;
  color: string;

  description?: string | null;
  features?: string | null;

  selling_price: number;
  reservation_price: number;

  archived?: number;
  status?: string;
}

// Update Vehicle Request

export interface UpdateVehicleData {
  brand_id?: number;
  model_id?: number;
  variant_id?: number;

  year_model?: number;
  color?: string;

  description?: string | null;
  features?: string | null;

  selling_price?: number;
  reservation_price?: number;

  archived?: number;
  status?: string;
}

// API Response Types

export interface VehicleResponse {
  message: string;
  data: Vehicle;
}

export interface VehicleListResponse {
  message: string;
  data: Vehicle[];
}
// GET ALL VEHICLES (PUBLIC)
// GET /api/vehicles

export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get<VehicleListResponse>("/vehicles");

  return response.data.data;
};

// GET CUSTOMER VEHICLES (AUTHENTICATED)
// GET /api/customer/vehicles

export const getVehicleCustomer = async (): Promise<Vehicle[]> => {
  const response = await api.get("/customer/vehicles");

  return response.data.data ?? response.data;
};

// GET SINGLE VEHICLE
// GET /api/vehicles/{id}

export const getVehicle = async (id: number): Promise<Vehicle> => {
  const response = await api.get<VehicleResponse>(`/vehicles/${id}`);

  return response.data.data;
};

// CREATE VEHICLE
// POST /api/vehicles

export const createVehicle = async (
  data: CreateVehicleData,
): Promise<Vehicle> => {
  const response = await api.post<VehicleResponse>("/vehicles", data);

  return response.data.data;
};

// UPDATE VEHICLE
// PATCH /api/vehicles/{id}

export const updateVehicle = async (
  id: number,
  data: UpdateVehicleData,
): Promise<Vehicle> => {
  const response = await api.patch<VehicleResponse>(`/vehicles/${id}`, data);

  return response.data.data;
};

// ARCHIVE VEHICLE
// DELETE /api/vehicles/{id}

export const archiveVehicle = async (id: number): Promise<void> => {
  await api.delete(`/vehicles/${id}`);
};
