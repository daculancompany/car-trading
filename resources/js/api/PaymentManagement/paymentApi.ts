import api from "../api";

export type PaymentType =
  | "reservation_fee"
  | "partial_payment"
  | "full_payment"
  | "financing_release";
export type PaymentMethod = "cash" | "gcash" | "bank_transfer" | "check";
export type PayerType = "customer" | "financing_company";
export type PaymentStatus = "pending" | "verified" | "rejected";

export interface PaymentUser {
  id: number;
  username?: string;
  email: string;
}

export interface PaymentCustomer {
  id: number;
  user_id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  mobile_number: string;
  user?: PaymentUser | null;
}

export interface PaymentBrand {
  id: number;
  brand: string;
}

export interface PaymentModel {
  id: number;
  brand_id: number;
  model: string;
}

export interface PaymentVariant {
  id: number;
  model_id: number;
  variant: string;
}

export type PaymentVehicleStatus =
  | "available"
  | "unavailable"
  | "reserved"
  | "sold"
  | "maintenance";

export interface PaymentVehicle {
  id: number;
  created_by_user_id?: number;
  brand_id: number;
  model_id: number;
  variant_id: number;
  stock_no: string;
  year_model: number;
  color: string;
  selling_price: number;
  discount_amount?: number;
  reservation_price: number;
  status: PaymentVehicleStatus;
  brand?: PaymentBrand;
  model?: PaymentModel;
  variant?: PaymentVariant;
}

export type ReservationSource = "online" | "walk_in";
export type PurchaseOption = "cash" | "financing";

export interface PaymentReservation {
  id: number;
  customer_id: number;
  vehicle_id: number;
  reservation_source?: ReservationSource;
  purchase_option?: PurchaseOption;
  reservation_status?: string;
  reserved_at?: string | null;
  expires_at?: string | null;
  customer?: PaymentCustomer;
  vehicle?: PaymentVehicle;
}

export interface PaymentSale {
  id: number;
  reservation_id: number;
  created_by: number;
  invoice_number: string;
  discount_amount?: number | null;
  sale_date: string;
  archived?: boolean;
}

export interface PaymentFinancingInfo {
  id: number;
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
  financing_status?: string;
  remarks?: string | null;
  verified_by?: number | null;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentAccount {
  id: number;
  account_provider: string;
  account_name: string;
  account_number: string;
  qr_code_path?: string | null;
  is_active: boolean;
}

export interface Payment {
  id: number;
  reservation_id: number;
  sale_id: number;
  financing_info_id?: number | null;
  payer_type: PayerType;
  payment_account_id?: number | null;
  verified_by?: number | null;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  amount: number;
  reference_number?: string | null;
  payment_proof?: string | null;
  payment_date: string;
  payment_status: PaymentStatus;
  verified_at?: string | null;
  remarks?: string | null;
  archived: boolean;
  reservation?: PaymentReservation;
  sale?: PaymentSale | null;
  financingInfo?: PaymentFinancingInfo | null;
  paymentAccount?: PaymentAccount | null;
  verifiedBy?: PaymentUser | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePaymentData {
  reservation_id: number;
  sale_id?: number | null;
  financing_info_id?: number | null;
  payer_type: PayerType;
  payment_account_id?: number | null;
  payment_type: PaymentType;
  payment_method: PaymentMethod;
  amount: number;
  reference_number?: string | null;
  payment_proof?: File | null;
  remarks?: string | null;
}

export interface UpdatePaymentData {
  reservation_id?: number;
  sale_id?: number;
  financing_info_id?: number | null;
  payer_type?: PayerType;
  payment_account_id?: number | null;
  payment_type?: PaymentType;
  payment_method?: PaymentMethod;
  amount?: number;
  reference_number?: string | null;
  payment_proof?: File | null;
  remarks?: string | null;
}

export interface RejectPaymentData {
  remarks: string;
}

export interface ResubmitPaymentProofData {
  payment_proof: File;
  reference_number?: string | null;
}

interface PaymentResponse {
  message: string;
  data: Payment;
}

interface PaymentListResponse {
  message: string;
  data: Payment[];
}

export const getPayments = async (): Promise<Payment[]> => {
  const response = await api.get<PaymentListResponse>("/payments");
  return response.data.data;
};

export const getPayment = async (id: number): Promise<Payment> => {
  const response = await api.get<PaymentResponse>(`/payments/${id}`);
  return response.data.data;
};

export const createPayment = async (
  data: CreatePaymentData,
): Promise<Payment> => {
  const formData = new FormData();

  formData.append("reservation_id", String(data.reservation_id));
  if (data.sale_id !== undefined && data.sale_id !== null) {
    formData.append("sale_id", String(data.sale_id));
  }
  formData.append("payer_type", data.payer_type);
  formData.append("payment_type", data.payment_type);
  formData.append("payment_method", data.payment_method);
  formData.append("amount", String(data.amount));

  if (data.financing_info_id !== undefined && data.financing_info_id !== null) {
    formData.append("financing_info_id", String(data.financing_info_id));
  }

  if (
    data.payment_account_id !== undefined &&
    data.payment_account_id !== null
  ) {
    formData.append("payment_account_id", String(data.payment_account_id));
  }

  if (data.reference_number) {
    formData.append("reference_number", data.reference_number);
  }

  if (data.payment_proof) {
    formData.append("payment_proof", data.payment_proof);
  }

  if (data.remarks) {
    formData.append("remarks", data.remarks);
  }

  const response = await api.post<PaymentResponse>("/payments", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.data;
};

export const updatePayment = async (
  id: number,
  data: UpdatePaymentData,
): Promise<Payment> => {
  const formData = new FormData();

  formData.append("_method", "PATCH");

  if (data.reservation_id !== undefined) {
    formData.append("reservation_id", String(data.reservation_id));
  }

  if (data.sale_id !== undefined) {
    formData.append("sale_id", String(data.sale_id));
  }

  if (data.financing_info_id !== undefined) {
    if (data.financing_info_id !== null) {
      formData.append("financing_info_id", String(data.financing_info_id));
    }
  }

  if (data.payer_type !== undefined) {
    formData.append("payer_type", data.payer_type);
  }

  if (data.payment_account_id !== undefined) {
    if (data.payment_account_id !== null) {
      formData.append("payment_account_id", String(data.payment_account_id));
    }
  }

  if (data.payment_type !== undefined) {
    formData.append("payment_type", data.payment_type);
  }

  if (data.payment_method !== undefined) {
    formData.append("payment_method", data.payment_method);
  }

  if (data.amount !== undefined) {
    formData.append("amount", String(data.amount));
  }

  if (data.reference_number !== undefined && data.reference_number !== null) {
    formData.append("reference_number", data.reference_number);
  }

  if (data.payment_proof) {
    formData.append("payment_proof", data.payment_proof);
  }

  if (data.remarks !== undefined && data.remarks !== null) {
    formData.append("remarks", data.remarks);
  }

  const response = await api.post<PaymentResponse>(
    `/payments/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

export const verifyPayment = async (
  id: number,
  remarks?: string,
): Promise<Payment> => {
  const response = await api.patch<PaymentResponse>(`/payments/${id}/verify`, {
    remarks: remarks?.trim() || null,
  });

  return response.data.data;
};

export const rejectPayment = async (
  id: number,
  data: RejectPaymentData,
): Promise<Payment> => {
  const response = await api.patch<PaymentResponse>(
    `/payments/${id}/reject`,
    data,
  );
  return response.data.data;
};

export const resubmitPaymentProof = async (
  id: number,
  data: ResubmitPaymentProofData,
): Promise<Payment> => {
  const formData = new FormData();

  formData.append("payment_proof", data.payment_proof);

  if (data.reference_number !== undefined && data.reference_number !== null) {
    formData.append("reference_number", data.reference_number);
  }

  const response = await api.post<PaymentResponse>(
    `/payments/${id}/resubmit-proof`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

export const archivePayment = async (id: number): Promise<void> => {
  await api.delete(`/payments/${id}`);
};
