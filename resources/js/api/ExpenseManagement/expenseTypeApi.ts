import api from "../api";

// Expense Type Interface

export interface ExpenseType {
  id: number;

  expense_name: string;

  is_active: boolean;

  vehicle_expenses_count?: number;

  created_at?: string;
  updated_at?: string;
}

// Create Expense Type

export interface CreateExpenseTypeData {
  expense_name: string;
  is_active?: boolean;
}

// Update Expense Type

export interface UpdateExpenseTypeData {
  expense_name: string;
  is_active?: boolean;
}

// API Responses

interface ExpenseTypeResponse {
  message: string;
  data: ExpenseType;
}

interface ExpenseTypeListResponse {
  message: string;
  data: ExpenseType[];
}

// GET ALL EXPENSE TYPES
// GET /api/expense-types

export const getExpenseTypes = async (): Promise<ExpenseType[]> => {
  const response = await api.get<ExpenseTypeListResponse>("/expense-types");

  return response.data.data;
};

// GET SINGLE EXPENSE TYPE
// GET /api/expense-types/{id}

export const getExpenseType = async (id: number): Promise<ExpenseType> => {
  const response = await api.get<ExpenseTypeResponse>(`/expense-types/${id}`);

  return response.data.data;
};

// CREATE EXPENSE TYPE
// POST /api/expense-types

export const createExpenseType = async (
  data: CreateExpenseTypeData,
): Promise<ExpenseType> => {
  const response = await api.post<ExpenseTypeResponse>("/expense-types", data);

  return response.data.data;
};

// UPDATE EXPENSE TYPE
// PATCH /api/expense-types/{id}

export const updateExpenseType = async (
  id: number,
  data: UpdateExpenseTypeData,
): Promise<ExpenseType> => {
  const response = await api.patch<ExpenseTypeResponse>(
    `/expense-types/${id}`,
    data,
  );

  return response.data.data;
};

// DELETE EXPENSE TYPE
// DELETE /api/expense-types/{id}

export const deleteExpenseType = async (id: number): Promise<void> => {
  await api.delete(`/expense-types/${id}`);
};
