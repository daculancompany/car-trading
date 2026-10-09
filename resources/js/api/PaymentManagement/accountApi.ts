import api from "../api";

// Payment Account Interface

export interface PaymentAccount {
  id: number;

  account_provider: string;
  account_name: string;
  account_number: string;

  qr_code_path: string | null;

  is_active: boolean;

  payments_count?: number;

  created_at?: string;
  updated_at?: string;
}

// Create Payment Account

export interface CreatePaymentAccountData {
  account_provider: string;
  account_name: string;
  account_number: string;

  qr_code: File;

  is_active?: boolean;
}

// Update Payment Account

export interface UpdatePaymentAccountData {
  account_provider?: string;
  account_name?: string;
  account_number?: string;

  qr_code?: File | null;

  is_active?: boolean;
}

// API Responses

interface PaymentAccountResponse {
  message: string;
  data: PaymentAccount;
}

interface PaymentAccountListResponse {
  message: string;
  data: PaymentAccount[];
}

// GET ALL PAYMENT ACCOUNTS
// GET /api/payment-accounts

export const getPaymentAccounts = async (): Promise<PaymentAccount[]> => {
  const response =
    await api.get<PaymentAccountListResponse>("/payment-accounts");

  return response.data.data;
};

// GET SINGLE PAYMENT ACCOUNT
// GET /api/payment-accounts/{id}

export const getPaymentAccount = async (
  id: number,
): Promise<PaymentAccount> => {
  const response = await api.get<PaymentAccountResponse>(
    `/payment-accounts/${id}`,
  );

  return response.data.data;
};

// CREATE PAYMENT ACCOUNT
// POST /api/payment-accounts

export const createPaymentAccount = async (
  data: CreatePaymentAccountData,
): Promise<PaymentAccount> => {
  const formData = new FormData();

  formData.append("account_provider", data.account_provider);

  formData.append("account_name", data.account_name);

  formData.append("account_number", data.account_number);

  formData.append("qr_code", data.qr_code);

  if (data.is_active !== undefined) {
    formData.append("is_active", data.is_active ? "1" : "0");
  }

  const response = await api.post<PaymentAccountResponse>(
    "/payment-accounts",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

// UPDATE PAYMENT ACCOUNT
// POST /api/payment-accounts/{id}
// Laravel method spoofing:
// _method = PUT

export const updatePaymentAccount = async (
  id: number,
  data: UpdatePaymentAccountData,
): Promise<PaymentAccount> => {
  const formData = new FormData();

  if (data.account_provider !== undefined) {
    formData.append("account_provider", data.account_provider);
  }

  if (data.account_name !== undefined) {
    formData.append("account_name", data.account_name);
  }

  if (data.account_number !== undefined) {
    formData.append("account_number", data.account_number);
  }

  if (data.qr_code) {
    formData.append("qr_code", data.qr_code);
  }

  if (data.is_active !== undefined) {
    formData.append("is_active", data.is_active ? "1" : "0");
  }

  formData.append("_method", "PUT");

  const response = await api.post<PaymentAccountResponse>(
    `/payment-accounts/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

// DELETE PAYMENT ACCOUNT
// DELETE /api/payment-accounts/{id}

export const deletePaymentAccount = async (id: number): Promise<void> => {
  await api.delete(`/payment-accounts/${id}`);
};
