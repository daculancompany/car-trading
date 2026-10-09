import api from "../api";

// Interfaces

export interface VehicleDocument {
  id: number;

  vehicle_id: number;

  vehicle_cr_path: string | null;
  vehicle_or_path: string | null;

  created_at?: string;
  updated_at?: string;

  // Relationship
  vehicle?: Vehicle;
}

// Vehicle Interface

export interface Vehicle {
  id: number;

  stock_no?: string;

  brand_id?: number;
  model_id?: number;
  variant_id?: number;

  year_model?: number;
  color?: string;

  description?: string | null;
  features?: string | null;

  selling_price?: number;
  discount_amount?: number;
  reservation_price?: number;

  status?: string;

  brand?: VehicleBrand;
  model?: VehicleModel;
  variant?: VehicleVariant;
}

// Vehicle Related Interfaces

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

// Create Vehicle Document Data

export interface CreateVehicleDocumentData {
  vehicle_id: number;

  vehicle_cr?: File;
  vehicle_or?: File;
}

// Update Vehicle Document Data

export interface UpdateVehicleDocumentData {
  vehicle_id?: number;

  vehicle_cr?: File;
  vehicle_or?: File;
}

// API Response Interfaces

interface VehicleDocumentListResponse {
  message: string;
  data: VehicleDocument[];
}

interface VehicleDocumentResponse {
  message: string;
  data: VehicleDocument;
}

interface VehicleDocumentMessageResponse {
  message: string;
}

// GET ALL VEHICLE DOCUMENTS
//
// GET /api/vehicle-documents

export const getVehicleDocuments = async (): Promise<VehicleDocument[]> => {
  const response =
    await api.get<VehicleDocumentListResponse>("/vehicle-documents");

  return response.data.data;
};

// GET ONE VEHICLE DOCUMENT
//
// GET /api/vehicle-documents/{id}

export const getVehicleDocument = async (
  id: number,
): Promise<VehicleDocument> => {
  const response = await api.get<VehicleDocumentResponse>(
    `/vehicle-documents/${id}`,
  );

  return response.data.data;
};

// CREATE VEHICLE DOCUMENT
//
// POST /api/vehicle-documents
//
// Content-Type:
// multipart/form-data

export const createVehicleDocument = async (
  data: CreateVehicleDocumentData,
): Promise<VehicleDocument> => {
  const formData = new FormData();

  formData.append("vehicle_id", String(data.vehicle_id));

  if (data.vehicle_cr) {
    formData.append("vehicle_cr", data.vehicle_cr);
  }

  if (data.vehicle_or) {
    formData.append("vehicle_or", data.vehicle_or);
  }

  const response = await api.post<VehicleDocumentResponse>(
    "/vehicle-documents",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

// UPDATE VEHICLE DOCUMENT
//
// PUT /api/vehicle-documents/{id}
//
// Content-Type:
// multipart/form-data

export const updateVehicleDocument = async (
  id: number,
  data: UpdateVehicleDocumentData,
): Promise<VehicleDocument> => {
  const formData = new FormData();

  if (data.vehicle_id !== undefined) {
    formData.append("vehicle_id", String(data.vehicle_id));
  }

  if (data.vehicle_cr) {
    formData.append("vehicle_cr", data.vehicle_cr);
  }

  if (data.vehicle_or) {
    formData.append("vehicle_or", data.vehicle_or);
  }

  const response = await api.post(
    `/vehicle-documents/${id}?_method=PUT`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data ?? response.data;
};

// DELETE VEHICLE DOCUMENT
//
// DELETE /api/vehicle-documents/{id}

export const deleteVehicleDocument = async (id: number): Promise<string> => {
  const response = await api.delete<VehicleDocumentMessageResponse>(
    `/vehicle-documents/${id}`,
  );

  return response.data.message;
};
