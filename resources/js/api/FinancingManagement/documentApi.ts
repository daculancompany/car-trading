import api from "../api";

// Interfaces

export interface FinancingDocument {
  id: number;
  financing_requirement_id: number;
  financing_info_id: number;

  verified_by: number | null;

  file_name: string;
  file_path: string;
  uploaded_at: string;

  verification_status: "pending" | "verified" | "rejected";

  verified_at: string | null;
  remarks: string | null;

  created_at?: string;
  updated_at?: string;

  financing_requirement?: FinancingRequirement;
  financing?: FinancingInfo;
  verifiedBy?: User;
}

// Financing Requirement Group

export interface FinancingRequirementGroup {
  id: number;
  group_name: string;
  group_code: string;
  description?: string | null;
  is_active?: boolean;
}

// Financing Requirement

export interface FinancingRequirement {
  id: number;
  group_id?: number;
  requirement_name: string;
  description?: string | null;
  is_active?: boolean;

  group?: FinancingRequirementGroup;
}

// Financing Info
// Matches financing_info table

export interface FinancingInfo {
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

  financing_status: "pending" | "approved" | "rejected" | "completed";

  verified_by?: number | null;
  remarks?: string | null;
  archived: boolean;

  created_at?: string;
  updated_at?: string;

  reservation?: FinancingReservation;
  verifiedBy?: User;
}

// User

export interface User {
  id: number;
  username?: string;
  name?: string;
  email?: string;
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

// CREATE

export interface CreateFinancingDocumentData {
  financing_requirement_id: number;
  financing_info_id: number;

  file: File;

  uploaded_at?: string;

  verified_by?: number | null;
  verified_at?: string | null;
  remarks?: string | null;
}

// UPDATE

export interface UpdateFinancingDocumentData {
  financing_requirement_id?: number;
  financing_info_id?: number;

  verified_by?: number | null;

  file_name?: string;
  file_path?: string;

  uploaded_at?: string;

  verification_status?: "pending" | "verified" | "rejected";

  verified_at?: string | null;
  remarks?: string | null;
}

// RESUBMIT

export interface ResubmitFinancingDocumentData {
  file: File;
  uploaded_at?: string;
  remarks?: string | null;
}

// API RESPONSE

interface FinancingDocumentListResponse {
  message: string;
  data: FinancingDocument[];
}

interface FinancingDocumentResponse {
  message: string;
  data: FinancingDocument;
}

interface FinancingDocumentMessageResponse {
  message: string;
}

// GET ALL
// GET /api/financing-documents

export const getFinancingDocuments = async (): Promise<FinancingDocument[]> => {
  const response = await api.get<FinancingDocumentListResponse>(
    "/financing-documents",
  );

  return response.data.data;
};

// GET ONE
// GET /api/financing-documents/{id}

export const getFinancingDocument = async (
  id: number,
): Promise<FinancingDocument> => {
  const response = await api.get<FinancingDocumentResponse>(
    `/financing-documents/${id}`,
  );

  return response.data.data;
};

// CREATE
// POST /api/financing-documents

export const createFinancingDocument = async (
  data: CreateFinancingDocumentData,
): Promise<FinancingDocument> => {
  const formData = new FormData();

  formData.append(
    "financing_requirement_id",
    String(data.financing_requirement_id),
  );

  formData.append("financing_info_id", String(data.financing_info_id));

  formData.append("file", data.file);

  if (data.uploaded_at) {
    formData.append("uploaded_at", data.uploaded_at);
  }

  if (data.verified_by != null) {
    formData.append("verified_by", String(data.verified_by));
  }

  if (data.verified_at != null) {
    formData.append("verified_at", data.verified_at);
  }

  if (data.remarks !== undefined) {
    formData.append("remarks", data.remarks ?? "");
  }

  const response = await api.post<FinancingDocumentResponse>(
    "/financing-documents",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

// UPDATE
// PUT /api/financing-documents/{id}

export const updateFinancingDocument = async (
  id: number,
  data: UpdateFinancingDocumentData,
): Promise<FinancingDocument> => {
  const response = await api.put<FinancingDocumentResponse>(
    `/financing-documents/${id}`,
    data,
  );

  return response.data.data;
};

// RESUBMIT
// POST /api/financing-documents/{id}/resubmit

export const resubmitFinancingDocument = async (
  id: number,
  data: ResubmitFinancingDocumentData,
): Promise<FinancingDocument> => {
  const formData = new FormData();

  formData.append("file", data.file);

  if (data.uploaded_at) {
    formData.append("uploaded_at", data.uploaded_at);
  }

  if (data.remarks !== undefined) {
    formData.append("remarks", data.remarks ?? "");
  }

  const response = await api.post<FinancingDocumentResponse>(
    `/financing-documents/${id}/resubmit`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

// REJECT
// PATCH /api/financing-documents/{id}/reject

export const rejectFinancingDocument = async (
  id: number,
  remarks?: string | null,
): Promise<FinancingDocument> => {
  const response = await api.patch<FinancingDocumentResponse>(
    `/financing-documents/${id}/reject`,
    {
      remarks: remarks ?? null,
    },
  );

  return response.data.data;
};

// VERIFY
// PUT /api/financing-documents/{id}

export const verifyFinancingDocument = async (
  id: number,
): Promise<FinancingDocument> => {
  const response = await api.put<FinancingDocumentResponse>(
    `/financing-documents/${id}`,
    {
      verification_status: "verified",
    },
  );

  return response.data.data;
};

// DELETE / ARCHIVE
// DELETE /api/financing-documents/{id}

export const deleteFinancingDocument = async (id: number): Promise<string> => {
  const response = await api.delete<FinancingDocumentMessageResponse>(
    `/financing-documents/${id}`,
  );

  return response.data.message;
};

// PREVIEW
// GET /api/financing-documents/{id}/preview

export const getFinancingDocumentPreview = async (
  documentId: number,
): Promise<string> => {
  const response = await api.get(`/financing-documents/${documentId}/preview`, {
    responseType: "blob",
  });

  return URL.createObjectURL(response.data);
};
