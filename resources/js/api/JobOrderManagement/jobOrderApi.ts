import api from "../api";

// ROLE

export type RoleType = "system" | "staffs" | "customer";

export interface Role {
  id: number;
  name: string;
  role_type: RoleType;
  description?: string | null;
}

// JOB ORDER STATUS
export type JobOrderStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

// WORK TYPE
export type JobOrderWorkType =
  | "repair"
  | "maintenance"
  | "inspection"
  | "washing"
  | "detailing"
  | "other";

// REQUEST SERVICE STATUS
export type RequestServiceStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

// USER
export interface User {
  id: number;
  role_id?: number;
  username?: string;
  email?: string;
  name?: string;
  role?: Role;
}

// STAFF
export interface Staff {
  id: number;
  user_id?: number;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  address?: string;
  mobile_number?: string;
  hire_date?: string;
  work_start_hour?: string;
  work_end_hour?: string;
  status?: "active" | "inactive" | "resigned" | "terminated";
  user?: User;
}

// VEHICLE BRAND
export interface VehicleBrand {
  id: number;
  brand: string;
}

// VEHICLE MODEL
export interface VehicleModel {
  id: number;
  brand_id?: number;
  model: string;
}

// VEHICLE VARIANT
export interface VehicleVariant {
  id: number;
  model_id?: number;
  variant: string;
}

// VEHICLE
export interface Vehicle {
  id: number;
  stock_no?: string;
  brand_id?: number;
  model_id?: number;
  variant_id?: number;
  status?: string;
  year_model?: number;
  color?: string;
  brand?: VehicleBrand;
  model?: VehicleModel;
  variant?: VehicleVariant;
  images?: { id: number; image_path: string }[];
  specs?: { plate_number?: string | null; mileage?: number | null; transmission?: string | null; fuel_type?: string | null } | null;
}

// CUSTOMER
export interface Customer {
  id: number;
  user_id?: number;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  mobile_number?: string;
  address?: string;
  email?: string;
  user?: User;
}

// RESERVATION
export interface Reservation {
  id: number;
  customer_id?: number;
  vehicle_id?: number;
  customer?: Customer;
  vehicle?: Vehicle;
}

// SALE
export interface Sale {
  id: number;
  reservation_id: number;
  invoice_number?: string;
  selling_price?: number;
  sale_date?: string;
  status?: string;
  reservation?: Reservation;
}

// VEHICLE RELEASE
export interface VehicleRelease {
  id: number;
  sale_id: number;
  release_number: string;
  release_date?: string | null;
  status: "pending" | "released" | "cancelled";
  sale?: Sale;
}

// REQUEST SERVICE
export interface RequestService {
  id: number;
  vehicle_release_id: number;
  service_request_number: string;
  request_detail: string;
  request_proof: string;
  request_date_pref: string;
  status: RequestServiceStatus;
  created_at?: string;
  service_type?: JobOrderWorkType;
  urgency?: JobOrderPriority;
  symptoms?: string[] | null;
  problem_started?: string | null;
  mileage?: number | null;
  preferred_time?: string | null;
  contact_number?: string | null;
  photo_urls?: string[];
  vehicle_release?: VehicleRelease;
  job_order?: JobOrder | null;
}

// PART
export interface Part {
  id: number;
  part_code?: string;
  part_name?: string;
  description?: string | null;
  unit?: string;
  archived?: boolean;
}

// VEHICLE PART

export interface VehiclePart {
  id: number;
  job_order_id?: number;
  part_id?: number;
  quantity?: number;
  unit_price?: number;
  part?: Part;
}

// JOB ORDER

export interface JobOrder {
  id: number;
  // Required vehicle
  vehicle_id: number;
  // Optional customer service request
  request_service_id?: number | null;
  // Assigned staff
  assigned_staff_id: number;
  // Admin or business creator
  created_by: number;
  job_order_no: number;
  work_type: JobOrderWorkType;
  start_job: string | null;
  finish_job: string | null;
  description: string;
  labor_cost: number;
  status: JobOrderStatus;
  archived?: boolean;
  created_at?: string;
  updated_at?: string;

  priority?: JobOrderPriority;
  scheduled_at?: string | null;
  estimated_completion?: string | null;
  reported_problem?: string | null;
  estimated_labor_cost?: number | string | null;
  odometer_in?: number | null;
  fuel_level?: FuelLevel | null;
  personal_items?: string | null;
  requires_inspection?: boolean;
  inspection?: JobOrderInspection | null;
  progress?: number;
  updates?: JobOrderUpdate[];

  invoice_no?: string | null;
  invoiced_at?: string | null;
  estimate_status?: EstimateStatus;
  estimate_amount?: number | string | null;
  estimate_note?: string | null;
  estimate_sent_at?: string | null;
  estimate_responded_at?: string | null;
  estimate_response_note?: string | null;
  estimate_responded_by?: number | null;
  estimate_responder?: { id: number; username: string } | null;
  needs_estimate_approval?: boolean;
  warranty_days?: number | null;
  warranty_km?: number | null;
  warranty_until?: string | null;
  warranty_active?: boolean;
  rating?: number | null;
  feedback?: string | null;
  rated_at?: string | null;
  parts_total?: number;
  total_cost?: number;
  amount_paid?: number;
  balance?: number;
  payment_status?: "not_billed" | "unpaid" | "partial" | "paid";
  payments?: JobOrderPayment[];

  // RELATIONSHIPS

  vehicle?: Vehicle;

  requestService?: RequestService | null;

  assignedStaff?: Staff | null;

  creator?: User;

  partsUsed?: JobOrderPartUsed[];
}

export interface JobOrderPartUsed {
  id: number;
  job_order_id: number;
  vehicle_part_id: number;
  quantity: number;
  used_at: string;
  vehicle_part?: {
    id: number;
    part_name: string;
    category?: string;
    unit_price: number | string;
    quantity?: number;
  } | null;
}

export type JobOrderPriority = "low" | "normal" | "high" | "urgent";

export type EstimateStatus = "none" | "pending" | "approved" | "declined";

export type PaymentMethod = "cash" | "gcash" | "bank_transfer" | "card" | "other";

export interface JobOrderPayment {
  id: number;
  job_order_id: number;
  amount: number | string;
  method: PaymentMethod;
  reference_no?: string | null;
  paid_at: string;
  note?: string | null;
  received_by?: number | null;
  receiver?: { id: number; username: string } | null;
}

export interface ServiceReminder {
  inspection_id: number;
  job_order_id: number;
  job_order_no: string;
  next_service_date: string;
  days_left: number;
  service_required?: string | null;
  recommended_services: string[];
  reminder_sent_at?: string | null;
  vehicle?: Vehicle | null;
  customer?: { id: number; first_name?: string; last_name?: string; mobile_number?: string; image_url?: string | null } | null;
}

export type FuelLevel = "empty" | "quarter" | "half" | "three_quarter" | "full";

export type InspectionResult = "confirmed" | "partial" | "not_found";

export type InspectionCheckStatus = "good" | "attention" | "urgent" | "na" | "ok" | "issue";

export type InspectionRating = "good" | "attention" | "urgent" | "na";

export type WheelKey = "lf" | "rf" | "lr" | "rr";

export type DamageView = "left" | "right" | "top" | "front" | "rear";

export interface DamageMark {
  no: number;
  view: DamageView;
  x: number;
  y: number;
  type: string;
  severity: "attention" | "urgent";
  note?: string | null;
}

export interface InspectionTires {
  size?: string | null;
  spare_ok?: boolean;
  wheels?: Partial<Record<WheelKey, { psi?: number | null; tread_mm?: number | null; status?: InspectionCheckStatus | null }>>;
}

export type InspectionBrakes = Partial<Record<WheelKey, { pad_mm?: number | null; status?: InspectionCheckStatus | null }>>;

export interface InspectionSummary {
  good: number;
  attention: number;
  urgent: number;
  na: number;
  damages: number;
}

export interface InspectionCheckItem {
  section?: string | null;
  item: string;
  status: InspectionCheckStatus;
  note?: string | null;
}

export interface InspectionPhoto {
  path: string;
  url: string;
  item: string | null;
  caption: string | null;
}

export interface JobOrderInspection {
  id: number;
  job_order_id: number;
  inspected_by: number | null;
  inspected_at: string;
  odometer: number | null;
  result: InspectionResult;
  findings: string;
  recommendation: string | null;
  checklist: InspectionCheckItem[] | null;
  photo_list: InspectionPhoto[];
  fuel_level?: string | null;
  pre_checks?: Record<string, boolean> | null;
  tires?: InspectionTires | null;
  brakes?: InspectionBrakes | null;
  damage_marks?: DamageMark[] | null;
  recommended_services?: string[] | null;
  next_service_date?: string | null;
  service_required?: string | null;
  estimated_cost?: number | string | null;
  notes?: string | null;
  summary?: InspectionSummary;
  office_decision: "proceed" | "cancel" | null;
  decided_at: string | null;
  decision_note: string | null;
  inspector?: { id: number; username: string } | null;
  decider?: { id: number; username: string } | null;
}

export interface JobOrderUpdate {
  id: number;
  job_order_id: number;
  user_id: number | null;
  progress: number;
  comment: string;
  photo_urls: string[];
  created_at: string;
  user?: { id: number; username: string } | null;
}

export interface JobOrderDetailFields {
  priority?: JobOrderPriority;
  scheduled_at?: string | null;
  estimated_completion?: string | null;
  reported_problem?: string | null;
  estimated_labor_cost?: number | null;
  odometer_in?: number | null;
  fuel_level?: FuelLevel | null;
  personal_items?: string | null;
}

// CREATE JOB ORDER
// POST /api/job-orders
export interface CreateJobOrderData extends JobOrderDetailFields {
  vehicle_id: number;
  request_service_id?: number | null;
  assigned_staff_id: number;
  work_type: JobOrderWorkType;
  description: string;
  labor_cost: number;
}

// UPDATE JOB ORDER
// PUT/PATCH /api/job-orders/{id}
export interface UpdateJobOrderData {
  vehicle_id?: number;
  request_service_id?: number | null;
  assigned_staff_id?: number;
  work_type?: JobOrderWorkType;
  start_job?: string | null;
  finish_job?: string | null;
  description?: string;
  labor_cost?: number;
  status?: JobOrderStatus;
}

// ASSIGN REQUEST SERVICE
// POST /api/job-orders

export interface AssignJobOrderData extends JobOrderDetailFields {
  vehicle_id: number;
  request_service_id: number;
  assigned_staff_id: number;
  work_type: JobOrderWorkType;
  description: string;
  labor_cost: number;
}

// API RESPONSE TYPES

interface JobOrderListResponse {
  message: string;
  data: JobOrder[];
}

interface JobOrderResponse {
  message: string;
  data: JobOrder;
}

interface MessageResponse {
  message: string;
}

// GET ALL JOB ORDERS
// GET /api/job-orders
// Laravel sends relationships in snake_case; the UI reads camelCase.
const normalizeJobOrder = (jobOrder: any): JobOrder => ({
  ...jobOrder,
  assignedStaff: jobOrder.assigned_staff ?? null,
  requestService: jobOrder.request_service ?? null,
  partsUsed: jobOrder.parts_used ?? [],
});

export const getJobOrders = async (): Promise<JobOrder[]> => {
  const response = await api.get<JobOrderListResponse>("/job-orders");
  return response.data.data.map(normalizeJobOrder);
};

// GET ONE JOB ORDER
// GET /api/job-orders/{id}
export const getJobOrder = async (id: number): Promise<JobOrder> => {
  const response = await api.get<JobOrderResponse>(`/job-orders/${id}`);
  return normalizeJobOrder(response.data.data);
};

// CREATE JOB ORDER
// POST /api/job-orders
export const createJobOrder = async (
  data: CreateJobOrderData,
): Promise<JobOrder> => {
  const response = await api.post<JobOrderResponse>("/job-orders", data);

  return response.data.data;
};

export const assignJobOrder = async (
  _requestServiceId: number,
  data: AssignJobOrderData,
): Promise<JobOrder> => {
  const response = await api.post<JobOrderResponse>(
    "/job-orders",
    data,
  );

  return response.data.data;
};

// UPDATE JOB ORDER
// PATCH /api/job-orders/{id}
export const updateJobOrder = async (
  id: number,
  data: UpdateJobOrderData,
): Promise<JobOrder> => {
  const response = await api.patch<JobOrderResponse>(`/job-orders/${id}`, data);

  return response.data.data;
};

// START JOB
// assigned → in_progress
// PATCH /api/job-orders/{id}
export const startJobOrder = async (id: number): Promise<JobOrder> => {
  return updateJobOrder(id, {
    status: "in_progress",
  });
};

// COMPLETE JOB
// in_progress → completed
// PATCH /api/job-orders/{id}
export const completeJobOrder = async (id: number): Promise<JobOrder> => {
  return updateJobOrder(id, {
    status: "completed",
  });
};

// CANCEL JOB
// PATCH /api/job-orders/{id}
export const cancelJobOrder = async (id: number): Promise<JobOrder> => {
  return updateJobOrder(id, {
    status: "cancelled",
  });
};

// DELETE / ARCHIVE JOB ORDER
// DELETE /api/job-orders/{id}
export const deleteJobOrder = async (id: number): Promise<string> => {
  const response = await api.delete<MessageResponse>(`/job-orders/${id}`);

  return response.data.message;
};

export interface NewInspectionPhoto {
  file: File;
  item: string | null;
  caption: string;
}

export interface SaveInspectionData {
  result: InspectionResult;
  findings: string;
  recommendation?: string;
  odometer?: number | null;
  checklist: InspectionCheckItem[];
  keepPhotos: string[];
  newPhotos: NewInspectionPhoto[];
  fuel_level?: string | null;
  pre_checks?: Record<string, boolean>;
  tires?: InspectionTires;
  brakes?: InspectionBrakes;
  damage_marks?: DamageMark[];
  recommended_services?: string[];
  next_service_date?: string | null;
  service_required?: string | null;
  estimated_cost?: number | null;
  notes?: string | null;
}

export const saveInspection = async (
  jobOrderId: number,
  data: SaveInspectionData,
): Promise<JobOrder> => {
  const formData = new FormData();

  formData.append("result", data.result);
  formData.append("findings", data.findings);
  if (data.recommendation) formData.append("recommendation", data.recommendation);
  if (data.odometer != null) formData.append("odometer", String(data.odometer));
  formData.append("checklist", JSON.stringify(data.checklist));
  (["pre_checks", "tires", "brakes", "damage_marks", "recommended_services"] as const).forEach((key) => {
    if (data[key] !== undefined) formData.append(key, JSON.stringify(data[key]));
  });
  (["fuel_level", "next_service_date", "service_required", "notes"] as const).forEach((key) => {
    const value = data[key];
    if (value) formData.append(key, value);
  });
  if (data.estimated_cost != null) formData.append("estimated_cost", String(data.estimated_cost));
  data.keepPhotos.forEach((path) => formData.append("keep_photos[]", path));
  data.newPhotos.forEach((photo) => {
    formData.append("photos[]", photo.file, photo.file.name);
    formData.append("photo_items[]", photo.item ?? "");
    formData.append("photo_captions[]", photo.caption);
  });

  const response = await api.post<JobOrderResponse>(
    `/job-orders/${jobOrderId}/inspection`,
    formData,
  );

  return normalizeJobOrder(response.data.data);
};

export const decideInspection = async (
  jobOrderId: number,
  decision: "proceed" | "cancel",
  note?: string,
): Promise<JobOrder> => {
  const response = await api.post<JobOrderResponse>(
    `/job-orders/${jobOrderId}/inspection/decision`,
    { decision, note },
  );

  return normalizeJobOrder(response.data.data);
};

export const addJobOrderUpdate = async (
  jobOrderId: number,
  data: { progress: number; comment: string; photos: File[] },
): Promise<JobOrder> => {
  const formData = new FormData();

  formData.append("progress", String(data.progress));
  formData.append("comment", data.comment);
  data.photos.forEach((photo) => formData.append("photos[]", photo, photo.name));

  const response = await api.post<JobOrderResponse>(
    `/job-orders/${jobOrderId}/updates`,
    formData,
  );

  return normalizeJobOrder(response.data.data);
};

export const downloadInspectionPdf = async (jobOrderId: number, fileName: string): Promise<void> => {
  const response = await api.get<Blob>(`/job-orders/${jobOrderId}/inspection/pdf`, {
    responseType: "blob",
    headers: { Accept: "application/pdf" },
  });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const downloadBlob = async (url: string, fileName: string) => {
  const response = await api.get<Blob>(url, { responseType: "blob", headers: { Accept: "application/pdf" } });
  const href = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
};

export const downloadInvoicePdf = (jobOrder: Pick<JobOrder, "id" | "invoice_no" | "job_order_no">) =>
  downloadBlob(`/job-orders/${jobOrder.id}/invoice/pdf`, `invoice-${jobOrder.invoice_no ?? jobOrder.job_order_no}.pdf`);

export const sendEstimate = async (jobOrderId: number, amount: number, note?: string | null): Promise<JobOrder> => {
  const response = await api.post<JobOrderResponse>(`/job-orders/${jobOrderId}/estimate`, { amount, note: note || null });
  return normalizeJobOrder(response.data.data);
};

export const respondEstimate = async (jobOrderId: number, decision: "approve" | "decline", note?: string | null): Promise<JobOrder> => {
  const response = await api.post<JobOrderResponse>(`/job-orders/${jobOrderId}/estimate/respond`, { decision, note: note || null });
  return normalizeJobOrder(response.data.data);
};

export const addJobOrderPayment = async (
  jobOrderId: number,
  data: { amount: number; method: PaymentMethod; reference_no?: string | null; paid_at?: string | null; note?: string | null },
): Promise<JobOrder> => {
  const response = await api.post<JobOrderResponse>(`/job-orders/${jobOrderId}/payments`, data);
  return normalizeJobOrder(response.data.data);
};

export const deleteJobOrderPayment = async (jobOrderId: number, paymentId: number): Promise<JobOrder> => {
  const response = await api.delete<JobOrderResponse>(`/job-orders/${jobOrderId}/payments/${paymentId}`);
  return normalizeJobOrder(response.data.data);
};

export const updateWarranty = async (jobOrderId: number, warranty_days: number | null, warranty_km: number | null): Promise<JobOrder> => {
  const response = await api.post<JobOrderResponse>(`/job-orders/${jobOrderId}/warranty`, { warranty_days, warranty_km });
  return normalizeJobOrder(response.data.data);
};

export const submitFeedback = async (jobOrderId: number, rating: number, feedback?: string | null): Promise<JobOrder> => {
  const response = await api.post<JobOrderResponse>(`/job-orders/${jobOrderId}/feedback`, { rating, feedback: feedback || null });
  return normalizeJobOrder(response.data.data);
};

export const getServiceReminders = async (days = 30): Promise<ServiceReminder[]> => {
  const response = await api.get<{ data: ServiceReminder[] }>("/service-reminders", { params: { days } });
  return response.data.data;
};

export const sendServiceReminder = async (inspectionId: number): Promise<string> => {
  const response = await api.post<{ message: string }>(`/service-reminders/${inspectionId}/send`);
  return response.data.message;
};
