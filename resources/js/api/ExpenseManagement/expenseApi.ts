import api from "../api";

// Vehicle Expense Interfaces

export interface VehicleExpenseBrand {
  id: number;
  brand: string;
  is_active?: boolean;
}

export interface VehicleExpenseModel {
  id: number;
  brand_id: number;
  model: string;
  is_active?: boolean;
}

export interface VehicleExpenseVariant {
  id: number;
  model_id: number;
  variant: string;
  is_active?: boolean;
}

export interface VehicleExpenseVehicle {
  id: number;

  brand_id: number;
  model_id: number;
  variant_id: number;

  stock_no?: string;
  year_model?: number;
  color?: string;

  brand?: VehicleExpenseBrand;
  model?: VehicleExpenseModel;
  variant?: VehicleExpenseVariant;
}

export interface VehicleExpenseType {
  id: number;
  expense_name: string;
  is_active?: boolean;
}

// Vehicle Expense

export interface VehicleExpense {
  id: number;

  vehicle_id: number;
  expense_type_id: number;

  amount: number;
  remarks: string | null;

  vehicle: VehicleExpenseVehicle;
  expenseType?: VehicleExpenseType;
  expense_type?: VehicleExpenseType;

  created_at?: string;
  updated_at?: string;
}

export interface VehicleExpenseRequest {
  vehicle_id: number;
  expense_type_id: number;
  amount?: number;
  remarks?: string;
}

// Create Vehicle Expense

export interface CreateVehicleExpenseData {
  vehicle_id: number;
  expense_type_id: number;
  amount: number;
  remarks: string | null;
}

// Update Vehicle Expense

export interface UpdateVehicleExpenseData {
  vehicle_id?: number;
  expense_type_id?: number;
  amount?: number;
  remarks: string | null;
}

// API Responses

interface VehicleExpenseResponse {
  message: string;
  data: VehicleExpense;
}

interface VehicleExpenseListResponse {
  message: string;
  data: VehicleExpense[];
}

// GET ALL VEHICLE EXPENSES
// GET /api/vehicle-expenses

export const getVehicleExpenses = async (): Promise<VehicleExpense[]> => {
  const response =
    await api.get<VehicleExpenseListResponse>("/vehicle-expenses");

  return response.data.data;
};

// GET SINGLE VEHICLE EXPENSE
// GET /api/vehicle-expenses/{id}

export const getVehicleExpense = async (
  id: number,
): Promise<VehicleExpense> => {
  const response = await api.get<VehicleExpenseResponse>(
    `/vehicle-expenses/${id}`,
  );

  return response.data.data;
};

// CREATE VEHICLE EXPENSE
// POST /api/vehicle-expenses

export const createVehicleExpense = async (
  data: CreateVehicleExpenseData,
): Promise<VehicleExpense> => {
  const response = await api.post<VehicleExpenseResponse>(
    "/vehicle-expenses",
    data,
  );

  return response.data.data;
};

// UPDATE VEHICLE EXPENSE
// PATCH /api/vehicle-expenses/{id}

export const updateVehicleExpense = async (
  id: number,
  data: UpdateVehicleExpenseData,
): Promise<VehicleExpense> => {
  const response = await api.patch<VehicleExpenseResponse>(
    `/vehicle-expenses/${id}`,
    data,
  );

  return response.data.data;
};

// DELETE VEHICLE EXPENSE
// DELETE /api/vehicle-expenses/{id}

export const deleteVehicleExpense = async (id: number): Promise<void> => {
  await api.delete(`/vehicle-expenses/${id}`);
};
