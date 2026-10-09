import api from "../api";

// Reservation Enums / Types

export type ReservationSource = "online" | "walk_in";

export type PurchaseOption = "cash" | "financing";

export type ReservationStatus =
  | "pending_reservation"
  | "pending_documents"
  | "pending_financing"
  | "pending_payment"
  | "reserved"
  | "rejected"
  | "cancelled"
  | "expired"
  | "completed";

export type ReservationIdReviewStatus =
  | "approved"
  | "resubmit";

// Customer

export interface ReservationUser {
  id: number;
  username: string;
  email: string;
}

export interface ReservationCustomer {
  id: number;
  user_id: number;

  first_name: string;
  middle_name?: string | null;
  last_name: string;

  address: string;
  mobile_number: string;

  user?: ReservationUser;
  image_path?: string | null;
  image_url?: string | null;
}

// Vehicle

export interface ReservationBrand {
  id: number;
  brand: string;
}

export interface ReservationModel {
  id: number;
  brand_id: number;
  model: string;
}

export interface ReservationVariant {
  id: number;
  model_id: number;
  variant: string;
}

export interface ReservationVehicle {
  id: number;

  brand_id: number;
  model_id: number;
  variant_id: number;

  stock_no: string;
  year_model: number;
  color: string;

  selling_price?: number;
  reservation_price?: number;

  status?: string;

  brand?: ReservationBrand;
  model?: ReservationModel;
  variant?: ReservationVariant;
  images?: { id: number; image_path: string }[];
  specs?: { plate_number?: string; mileage?: number; transmission?: string; fuel_type?: string } | null;
}

export type ReservationHistoryAction =
  | "created"
  | "approved"
  | "rejected"
  | "status_changed"
  | "id_reviewed"
  | "payment_verified"
  | "released"
  | "expired"
  | "auto";

export interface ReservationStatusHistory {
  id: number;
  reservation_id: number;
  from_status: ReservationStatus | null;
  to_status: ReservationStatus;
  action: ReservationHistoryAction;
  note: string | null;
  user_id: number | null;
  user?: { id: number; username: string; role?: { id: number; name: string } | null } | null;
  created_at: string;
}

// Reserved By

export interface ReservedByUser {
  id: number;
  username: string;
  email: string;
}

// Financing Summary
// Only the reservation-level financing information is needed here.
// Full financing details can still be loaded from FinancingInfo API.

export interface ReservationFinancing {
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

  financing_status:
    | "pending"
    | "approved"
    | "rejected"
    | "completed";

  verified_by?: number | null;
  remarks?: string | null;
  archived: boolean;

  created_at?: string;
  updated_at?: string;
}

// Payment Summary

export interface ReservationPayment {
  id: number;
  reservation_id?: number | null;

  payment_type?: string;
  payment_method?: string;

  amount: number;

  reference_number?: string | null;
  payment_proof?: string | null;

  payment_date?: string | null;
  payment_status?: string;

  created_at?: string;
  updated_at?: string;
}

// Sale Summary

export interface ReservationSale {
  id: number;
  reservation_id: number;

  created_by?: number | null;

  invoice_number: string;
  sale_date: string;

  selling_price: number;
  discount_amount: number;
  total_amount: number;

  status: "completed" | "cancelled";

  archived: boolean;

  created_at?: string;
  updated_at?: string;
}

// Reservation Status Options

export const RESERVATION_STATUSES: {
  value: ReservationStatus;
  label: string;
}[] = [
  {
    value: "pending_reservation",
    label: "Pending Reservation",
  },
  {
    value: "pending_documents",
    label: "Pending Documents",
  },
  {
    value: "pending_financing",
    label: "Pending Financing",
  },
  {
    value: "pending_payment",
    label: "Pending Payment",
  },
  {
    value: "reserved",
    label: "Reserved",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
  {
    value: "expired",
    label: "Expired",
  },
  {
    value: "completed",
    label: "Completed",
  },
];

// Reservation

export interface Reservation {
  id: number;

  customer_id: number;
  vehicle_id: number;
  reserved_by_id?: number | null;

  reservation_source: ReservationSource;

  valid_id_type: string;
  valid_id_front: string;
  valid_id_back: string;

  valid_id_front_status?:
    | ReservationIdReviewStatus
    | "pending"
    | null;

  valid_id_front_remarks?: string | null;

  valid_id_back_status?:
    | ReservationIdReviewStatus
    | "pending"
    | null;

  valid_id_back_remarks?: string | null;

  purchase_option: PurchaseOption;

  reserved_at: string;
  expires_at: string;

  reservation_status: ReservationStatus;

  remarks: string | null;

  customer: ReservationCustomer;
  vehicle: ReservationVehicle;

  reservedBy?: ReservedByUser | null;

  payments?: ReservationPayment[];
  financing?: ReservationFinancing | null;
  sale?: ReservationSale | null;
  status_histories?: ReservationStatusHistory[];

  created_at?: string;
  updated_at?: string;
}

// Create Reservation

export interface CreateReservationData {
  vehicle_id: number;

  reservation_source: ReservationSource;

  // Leave the ID fields out to reuse the ID already on file.
  valid_id_type?: string;

  valid_id_front?: File;
  valid_id_back?: File;

  purchase_option: PurchaseOption;

  remarks?: string | null;
}

export interface ValidIdOnFile {
  valid_id_type: string;
  valid_id_front: string;
  valid_id_back: string;
  valid_id_front_status: string;
  valid_id_back_status: string;
  from_reservation_id: number;
}

// Update Reservation

export interface UpdateReservationData {
  customer_id?: number;
  vehicle_id?: number;

  reserved_by_id?: number | null;

  reservation_source?: ReservationSource;

  valid_id_type?: string;

  // Existing stored file paths.
  valid_id_front?: string;
  valid_id_back?: string;

  purchase_option?: PurchaseOption;

  // Status is included for admin/backend-controlled updates.
  reservation_status?: ReservationStatus;

  remarks?: string | null;
}

// Review Reservation ID

export interface ReviewReservationIdData {
  front_status?: ReservationIdReviewStatus;
  front_remarks?: string | null;

  back_status?: ReservationIdReviewStatus;
  back_remarks?: string | null;
}

// Resubmit Reservation ID

export interface ResubmitReservationIdData {
  valid_id_front?: File;
  valid_id_back?: File;
}

// API Responses

interface ReservationResponse {
  message: string;
  data: Reservation;
}

interface ReservationListResponse {
  message: string;
  data: Reservation[];
}

// GET ALL RESERVATIONS
// GET /api/reservations

export const getReservations = async (): Promise<Reservation[]> => {
  const response =
    await api.get<ReservationListResponse>("/reservations");

  return response.data.data;
};

// GET SINGLE RESERVATION
// GET /api/reservations/{id}

export const getReservation = async (
  id: number
): Promise<Reservation> => {
  const response =
    await api.get<ReservationResponse>(
      `/reservations/${id}`
    );

  return response.data.data;
};

// CREATE RESERVATION
// POST /api/reservations

// GET /api/customer/valid-id — null when the customer has no reusable ID yet.
export const getValidIdOnFile = async (): Promise<ValidIdOnFile | null> => {
  const response = await api.get<{ data: ValidIdOnFile | null }>(
    "/customer/valid-id"
  );

  return response.data.data;
};

export const createReservation = async (
  data: CreateReservationData
): Promise<Reservation> => {
  const formData = new FormData();

  formData.append(
    "vehicle_id",
    String(data.vehicle_id)
  );

  formData.append(
    "reservation_source",
    data.reservation_source
  );

  if (data.valid_id_front && data.valid_id_back) {
    formData.append("valid_id_type", data.valid_id_type ?? "");
    formData.append("valid_id_front", data.valid_id_front);
    formData.append("valid_id_back", data.valid_id_back);
  }

  formData.append(
    "purchase_option",
    data.purchase_option
  );

  if (data.remarks) {
    formData.append(
      "remarks",
      data.remarks
    );
  }

  const response =
    await api.post<ReservationResponse>(
      "/reservations",
      formData
    );

  return response.data.data;
};

// UPDATE RESERVATION
// PATCH /api/reservations/{id}

export const updateReservation = async (
  id: number,
  data: UpdateReservationData
): Promise<Reservation> => {
  const response =
    await api.patch<ReservationResponse>(
      `/reservations/${id}`,
      data
    );

  return response.data.data;
};

// REVIEW RESERVATION ID
// PATCH /api/reservations/{id}/review-id

export const reviewReservationId = async (
  id: number,
  data: ReviewReservationIdData
): Promise<Reservation> => {
  const response =
    await api.patch<ReservationResponse>(
      `/reservations/${id}/review-id`,
      data
    );

  return response.data.data;
};

// RESUBMIT RESERVATION ID
// POST /api/reservations/{id}/resubmit-id

export const resubmitReservationId = async (
  id: number,
  data: ResubmitReservationIdData
): Promise<Reservation> => {
  const formData = new FormData();

  if (data.valid_id_front) {
    formData.append(
      "valid_id_front",
      data.valid_id_front
    );
  }

  if (data.valid_id_back) {
    formData.append(
      "valid_id_back",
      data.valid_id_back
    );
  }

  const response =
    await api.post<ReservationResponse>(
      `/reservations/${id}/resubmit-id`,
      formData
    );

  return response.data.data;
};

// DELETE / CANCEL RESERVATION
// DELETE /api/reservations/{id}

export const deleteReservation = async (
  id: number
): Promise<void> => {
  await api.delete(`/reservations/${id}`);
};

export const approveReservation = async (id: number, note?: string | null): Promise<Reservation> => {
  const response = await api.post<ReservationResponse>(`/reservations/${id}/approve`, { note: note || null });

  return response.data.data;
};

export const rejectReservation = async (id: number, reason: string): Promise<Reservation> => {
  const response = await api.post<ReservationResponse>(`/reservations/${id}/reject`, { reason });

  return response.data.data;
};
