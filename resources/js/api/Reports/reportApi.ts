import api from "../api";

// Shared Types

export interface ReportDateRange {
  from?: string;
  to?: string;
}

// SALES REPORT

export interface SalesReportSummary {
  total_transactions: number;
  completed_sales: number;
  pending_sales: number;
  cancelled_sales: number;
  total_sales: number;
  total_discount: number;
  net_sales: number;
}

export interface SalesReportData {
  id: number;
  reservation_id: number;
  created_by: number;
  invoice_number: string;
  selling_price: number;
  discount_amount: number | null;
  sale_date: string;
  status: "pending" | "completed" | "cancelled";

  reservation?: {
    id: number;
    customer?: any;
    vehicle?: any;
  };

  createdBy?: any;

  created_at?: string;
  updated_at?: string;
}

export interface SalesReportResponse {
  report: string;
  date_from: string;
  date_to: string;
  summary: SalesReportSummary;
  data: SalesReportData[];
}

// PAYMENT REPORT

export interface PaymentReportSummary {
  total_transactions: number;
  verified_payments: number;
  pending_payments: number;
  rejected_payments: number;
  total_verified_amount: number;
}

export interface PaymentReportData {
  id: number;
  reservation_id: number;
  payment_account_id: number;
  verified_by: number | null;
  amount: number;
  payment_date: string;
  payment_status: "pending" | "verified" | "rejected";

  reservation?: {
    id: number;
    customer?: any;
    vehicle?: any;
  };

  paymentAccount?: any;
  verifiedBy?: any;

  created_at?: string;
  updated_at?: string;
}

export interface PaymentReportResponse {
  report: string;
  date_from: string;
  date_to: string;
  summary: PaymentReportSummary;
  data: PaymentReportData[];
}

// RESERVATION REPORT

export interface ReservationReportSummary {
  total_reservations: number;
  pending: number;
  reserved: number;
  completed: number;
  cancelled: number;
  expired: number;
}

export interface ReservationReportData {
  id: number;
  customer_id: number;
  vehicle_id: number;
  reserved_by_id: number | null;
  reservation_source: "online" | "walk_in";
  reservation_status:
    | "pending_reservation"
    | "pending_documents"
    | "pending_financing"
    | "pending_payment"
    | "reserved"
    | "completed"
    | "cancelled"
    | "expired";

  reserved_at: string;
  expires_at: string | null;

  customer?: any;
  vehicle?: any;
  reservedBy?: any;

  created_at?: string;
  updated_at?: string;
}

export interface ReservationReportResponse {
  report: string;
  date_from: string;
  date_to: string;
  summary: ReservationReportSummary;
  data: ReservationReportData[];
}

// VEHICLE INVENTORY REPORT

export interface VehicleReportSummary {
  total_vehicles: number;
  available: number;
  reserved: number;
  sold: number;
  maintenance: number;
  unavailable: number;
}

export interface VehicleReportData {
  id: number;
  status: "available" | "reserved" | "sold" | "maintenance" | "unavailable";

  brand?: any;
  model?: any;
  variant?: any;
  spec?: any;

  created_at?: string;
  updated_at?: string;
}

export interface VehicleReportResponse {
  report: string;
  summary: VehicleReportSummary;
  data: VehicleReportData[];
}

// FINANCING REPORT

export interface FinancingReportSummary {
  total_applications: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  approved_amount: number;
}

export interface FinancingReportData {
  id: number;
  reservation_id: number;
  financing_company_id: number;
  verified_by: number | null;

  financed_amount: number | null;
  monthly_payment: number | null;
  loan_term_months: number | null;

  financing_status:
    | "pending"
    | "submitted"
    | "approved"
    | "rejected"
    | "cancelled";

  recorded_at: string;
  approval_date: string | null;
  remarks: string | null;

  reservation?: {
    id: number;
    customer?: any;
    vehicle?: any;
  };

  financingCompany?: any;
  verifiedBy?: any;

  created_at?: string;
  updated_at?: string;
}

export interface FinancingReportResponse {
  report: string;
  date_from: string;
  date_to: string;
  summary: FinancingReportSummary;
  data: FinancingReportData[];
}

// EXPENSE REPORT

export interface ExpenseReportSummary {
  total_expenses: number;
  total_amount: number;
}

export interface ExpenseReportData {
  id: number;
  vehicle_id: number;
  expense_type_id: number;
  amount: number;
  remarks: string;

  vehicle?: any;
  expenseType?: any;

  created_at?: string;
  updated_at?: string;
}

export interface ExpenseReportResponse {
  report: string;
  date_from: string;
  date_to: string;
  summary: ExpenseReportSummary;
  data: ExpenseReportData[];
}

// SERVICE REPORT

export interface ServiceReportSummary {
  total_requests: number;
  pending: number;
  assigned: number;
  in_progress: number;
  completed: number;
  cancelled: number;
}

export interface ServiceReportData {
  id: number;
  vehicle_release_id: number;
  service_request_number: string;
  request_detail: string;
  request_proof: string;
  request_date_pref: string;

  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";

  vehicleRelease?: any;
  jobOrder?: any;

  created_at?: string;
  updated_at?: string;
}

export interface ServiceReportResponse {
  report: string;
  date_from: string;
  date_to: string;
  summary: ServiceReportSummary;
  data: ServiceReportData[];
}

// REPORT API

// SALES

export const getSalesReport = async (
  params?: ReportDateRange,
): Promise<SalesReportResponse> => {
  const response = await api.get<SalesReportResponse>("/reports/sales", {
    params,
  });

  return response.data;
};

// PAYMENTS

export const getPaymentsReport = async (
  params?: ReportDateRange,
): Promise<PaymentReportResponse> => {
  const response = await api.get<PaymentReportResponse>("/reports/payments", {
    params,
  });

  return response.data;
};

// RESERVATIONS

export const getReservationsReport = async (
  params?: ReportDateRange,
): Promise<ReservationReportResponse> => {
  const response = await api.get<ReservationReportResponse>(
    "/reports/reservations",
    {
      params,
    },
  );

  return response.data;
};

// VEHICLES

export const getVehiclesReport = async (): Promise<VehicleReportResponse> => {
  const response = await api.get<VehicleReportResponse>("/reports/vehicles");

  return response.data;
};

// FINANCING

export const getFinancingReport = async (
  params?: ReportDateRange,
): Promise<FinancingReportResponse> => {
  const response = await api.get<FinancingReportResponse>(
    "/reports/financing",
    {
      params,
    },
  );

  return response.data;
};

// EXPENSES

export const getExpensesReport = async (
  params?: ReportDateRange,
): Promise<ExpenseReportResponse> => {
  const response = await api.get<ExpenseReportResponse>("/reports/expenses", {
    params,
  });

  return response.data;
};

// SERVICES

export const getServicesReport = async (
  params?: ReportDateRange,
): Promise<ServiceReportResponse> => {
  const response = await api.get<ServiceReportResponse>("/reports/services", {
    params,
  });

  return response.data;
};

// PDF REPORT API

export const downloadReportPdf = async (
  path: string,
  params?: ReportDateRange,
): Promise<Blob> => {
  const response = await api.get<Blob>(path, {
    params,
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  });

  return response.data;
};

// SALES PDF

export const downloadSalesReportPdf = async (
  params?: ReportDateRange,
): Promise<Blob> => {
  return downloadReportPdf("/reports/sales/pdf", params);
};

// PAYMENTS PDF

export const downloadPaymentsReportPdf = async (
  params?: ReportDateRange,
): Promise<Blob> => {
  return downloadReportPdf("/reports/payments/pdf", params);
};

// RESERVATIONS PDF

export const downloadReservationsReportPdf = async (
  params?: ReportDateRange,
): Promise<Blob> => {
  return downloadReportPdf("/reports/reservations/pdf", params);
};

// VEHICLES PDF

export const downloadVehiclesReportPdf = async (): Promise<Blob> => {
  return downloadReportPdf("/reports/vehicles/pdf");
};

// FINANCING PDF

export const downloadFinancingReportPdf = async (
  params?: ReportDateRange,
): Promise<Blob> => {
  return downloadReportPdf("/reports/financing/pdf", params);
};

// EXPENSES PDF

export const downloadExpensesReportPdf = async (
  params?: ReportDateRange,
): Promise<Blob> => {
  return downloadReportPdf("/reports/expenses/pdf", params);
};

// SERVICES PDF

export const downloadServicesReportPdf = async (
  params?: ReportDateRange,
): Promise<Blob> => {
  return downloadReportPdf("/reports/services/pdf", params);
};

export type ReportPath =
  | "sales"
  | "payments"
  | "reservations"
  | "vehicles"
  | "financing"
  | "expenses"
  | "services"
  | "job-orders"
  | "parts"
  | "stock-movements"
  | "releases"
  | "mechanics"
  | "service-billing";

export type ReportRow = Record<string, unknown>;

export interface GenericReportResponse {
  report: string;
  date_from?: string;
  date_to?: string;
  summary: Record<string, number>;
  data: ReportRow[];
}

export const getReport = async (
  path: ReportPath,
  params?: ReportDateRange,
): Promise<GenericReportResponse> => {
  const response = await api.get<GenericReportResponse>(`/reports/${path}`, {
    params,
  });

  return response.data;
};

export const downloadReport = async (
  path: ReportPath,
  params?: ReportDateRange,
): Promise<Blob> => {
  return downloadReportPdf(`/reports/${path}/pdf`, params);
};
