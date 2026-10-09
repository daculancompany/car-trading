import api from "../api";

// Interfaces

export type SaleStatus = "pending" | "completed" | "cancelled";

export interface Sale {
  id: number;
  reservation_id: number;
  created_by: number;
  invoice_number: string;
  discount_amount: number | null;
  sale_date: string;
  status: SaleStatus;
  created_at?: string;
  updated_at?: string;

  // Relationships
  reservation?: Reservation;
  createdBy?: User;
  vehicleRelease?: VehicleRelease | null;
}

// Related Interfaces

export interface Reservation {
  id: number;
  customer_id?: number;
  vehicle_id?: number;
  reservation_source?: "online" | "walk_in";
  purchase_option?: "cash" | "financing";
  reservation_status?: string;
  reserved_at?: string;
  expires_at?: string;
  customer?: Customer;
  vehicle?: Vehicle;
}

export interface Customer {
  id: number;
  user_id?: number;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  mobile_number?: string;
  email?: string;
  user?: User;
}

export interface Vehicle {
  id: number;
  stock_no?: string;
  brand_id?: number;
  model_id?: number;
  variant_id?: number;
  year_model?: number;
  color?: string;
  selling_price?: number;
  status?: string;
  brand?: VehicleBrand;
  model?: VehicleModel;
  variant?: VehicleVariant;
  images?: { id: number; image_path: string }[];
  specs?: { plate_number?: string; mileage?: number; transmission?: string; fuel_type?: string } | null;
}

export interface VehicleBrand {
  id: number;
  brand: string;
}

export interface VehicleModel {
  id: number;
  brand_id?: number;
  model: string;
}

export interface VehicleVariant {
  id: number;
  model_id?: number;
  variant: string;
}

export interface User {
  id: number;
  username?: string;
  email?: string;
}

export interface VehicleRelease {
  id: number;
  sale_id?: number;
  vehicle_id?: number;
  release_date?: string;
  release_status?: string;
}

// Create Interface

export interface CreateSaleData {
  reservation_id: number;
  discount_amount?: number | null;
}

// Update Interface

export interface UpdateSaleData {
  reservation_id?: number;
  created_by?: number;
  invoice_number?: string;
  discount_amount?: number | null;
}

// API Response Interfaces

interface SaleListResponse {
  message: string;
  data: Sale[];
}

interface SaleResponse {
  message: string;
  data: Sale;
}

interface SaleMessageResponse {
  message: string;
}

// GET ALL SALES
// GET /api/sales

export const getSales = async (): Promise<Sale[]> => {
  const response = await api.get<SaleListResponse>("/sales");

  return response.data.data;
};

// GET ONE SALE
// GET /api/sales/{id}

export const getSale = async (id: number): Promise<Sale> => {
  const response = await api.get<SaleResponse>(`/sales/${id}`);

  return response.data.data;
};

export const getSaleByReservation = async (
  reservationId: number,
): Promise<Sale | null> => {
  const response = await api.get<{ message: string; data: Sale[] }>("/sales");
  return (
    response.data.data.find(
      (sale) => Number(sale.reservation_id) === Number(reservationId),
    ) ?? null
  );
};

// DOWNLOAD SALE PDF
// GET /api/sales/{id}/pdf

export const downloadSalePdf = async (id: number): Promise<Blob> => {
  const response = await api.get(`/sales/${id}/pdf`, {
    responseType: "blob",
  });

  return response.data;
};

// CREATE SALE
// POST /api/sales

export const createSale = async (data: CreateSaleData): Promise<Sale> => {
  const response = await api.post<SaleResponse>("/sales", data);

  return response.data.data;
};

// UPDATE SALE
// PUT /api/sales/{id}

export const updateSale = async (
  id: number,
  data: UpdateSaleData,
): Promise<Sale> => {
  const response = await api.put<SaleResponse>(`/sales/${id}`, data);

  return response.data.data;
};

// DELETE SALE
// DELETE /api/sales/{id}

export const deleteSale = async (id: number): Promise<string> => {
  const response = await api.delete<SaleMessageResponse>(`/sales/${id}`);

  return response.data.message;
};

// COMPLETE SALE
// PATCH /api/sales/{id}/complete

export const completeSale = async (id: number): Promise<Sale> => {
  const response = await api.patch<SaleResponse>(`/sales/${id}/complete`);

  return response.data.data;
};

// CANCEL SALE
// PATCH /api/sales/{id}/cancel

export const cancelSale = async (id: number): Promise<Sale> => {
  const response = await api.patch<SaleResponse>(`/sales/${id}/cancel`);

  return response.data.data;
};
