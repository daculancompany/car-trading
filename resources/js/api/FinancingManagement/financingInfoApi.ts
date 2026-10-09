import api from "../api";

// Types

export type FinancingStatus = "pending" | "approved" | "rejected" | "completed";

// Interface

export interface Financing {
  id: number;
  reservation_id: number;

  company_name: string;
  contact_person: string;
  contact_number: string;
  email: string;
  address: string;

  financing_reference_no?: string | null;
  financed_amount: number;
  monthly_payment?: number | null;
  loan_term_months?: number | null;

  financing_status: FinancingStatus;

  verified_by?: number | null;
  remarks?: string | null;
  archived: boolean;

  created_at?: string;
  updated_at?: string;

  // Loaded Relationships

  reservation?: FinancingReservation;
  verifiedBy?: FinancingVerifiedBy;
  documents?: FinancingDocument[];
}

// Reservation

export interface FinancingReservation {
  id: number;
  customer_id?: number;
  vehicle_id?: number;

  customer?: FinancingCustomer;
  vehicle?: FinancingVehicle;

  [key: string]: unknown;
}

// Customer

export interface FinancingCustomer {
  id: number;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;

  user?: {
    id: number;
    name?: string;
    email?: string;
  };

  [key: string]: unknown;
}

// Vehicle

export interface FinancingVehicle {
  id: number;
  brand_id?: number;
  model_id?: number;
  variant_id?: number;

  brand?: {
    id: number;
    name?: string;
    brand_name?: string;
  };

  model?: {
    id: number;
    name?: string;
    model_name?: string;
  };

  variant?: {
    id: number;
    name?: string;
    variant_name?: string;
  };

  [key: string]: unknown;
}

// Verified By

export interface FinancingVerifiedBy {
  id: number;
  name?: string;
  username?: string;
  email?: string;

  [key: string]: unknown;
}

// Financing Document

export type FinancingDocumentStatus = "pending" | "verified" | "rejected";

export interface FinancingDocument {
  id: number;
  financing_info_id?: number;
  financing_requirement_id?: number;
  verified_by?: number | null;

  document_name?: string | null;
  file_name?: string | null;
  file_path?: string | null;
  uploaded_at?: string | null;

  verification_status: FinancingDocumentStatus;
  verified_at?: string | null;
  remarks?: string | null;

  financingRequirement?: {
    id: number;
    requirement_name?: string | null;
    name?: string | null;
  } | null;

  financing?: Financing;
}

// Request Interfaces

export interface CreateFinancingData {
  reservation_id: number;

  company_name: string;
  contact_person: string;
  contact_number: string;
  email: string;
  address: string;

  financing_reference_no?: string | null;
  financed_amount: number;
  monthly_payment?: number | null;
  loan_term_months?: number | null;

  remarks?: string | null;
}

export interface UpdateFinancingData {
  reservation_id?: number;

  company_name?: string;
  contact_person?: string;
  contact_number?: string;
  email?: string;
  address?: string;

  financing_reference_no?: string | null;
  financed_amount?: number;
  monthly_payment?: number | null;
  loan_term_months?: number | null;

  remarks?: string | null;
}

// Response Interfaces

interface FinancingListResponse {
  message: string;
  data: Financing[];
}

interface FinancingResponse {
  message: string;
  data: Financing;
}

interface FinancingMessageResponse {
  message: string;
}

// GET ALL
// GET /api/financing-info

export const getFinancings = async (): Promise<Financing[]> => {
  const response = await api.get<FinancingListResponse>("/financing-info");

  return response.data.data;
};

// GET ONE
// GET /api/financing-info/{id}

export const getFinancing = async (id: number): Promise<Financing> => {
  const response = await api.get<FinancingResponse>(`/financing-info/${id}`);

  return response.data.data;
};

// SUBMIT
// POST /api/financing-info

export const submitFinancing = async (
  data: CreateFinancingData,
): Promise<Financing> => {
  const response = await api.post<FinancingResponse>("/financing-info", data);

  return response.data.data;
};

// UPDATE
// PUT /api/financing-info/{id}

export const updateFinancing = async (
  id: number,
  data: UpdateFinancingData,
): Promise<Financing> => {
  const response = await api.put<FinancingResponse>(
    `/financing-info/${id}`,
    data,
  );

  return response.data.data;
};

// RESUBMIT
// POST /api/financing-info/{id}/resubmit

export const resubmitFinancing = async (
  id: number,
  data: CreateFinancingData,
): Promise<Financing> => {
  const response = await api.post<FinancingResponse>(
    `/financing-info/${id}/resubmit`,
    data,
  );

  return response.data.data;
};

export const approveFinancing = async (
  id: number,
  remarks?: string,
): Promise<Financing> => {
  const response = await api.post<FinancingResponse>(
    `/financing-info/${id}/approve`,
    {
      remarks,
    },
  );

  return response.data.data;
};

export const rejectFinancing = async (
  id: number,
  remarks: string,
): Promise<Financing> => {
  const response = await api.post<FinancingResponse>(
    `/financing-info/${id}/reject`,
    {
      remarks,
    },
  );

  return response.data.data;
};

// DELETE / ARCHIVE
// DELETE /api/financing-info/{id}

export const deleteFinancing = async (id: number): Promise<string> => {
  const response = await api.delete<FinancingMessageResponse>(
    `/financing-info/${id}`,
  );

  return response.data.message;
};

// VERIFY FINANCING DOCUMENT
// PUT /api/financing-documents/{id}

export const verifyFinancingDocument = async (
  documentId: number,
): Promise<FinancingDocument> => {
  const response = await api.put<{
    message: string;
    data: FinancingDocument;
  }>(`/financing-documents/${documentId}`, {
    verification_status: "verified",
  });

  return response.data.data;
};
