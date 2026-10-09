import api from "../api";
import type { JobOrder as FullJobOrder, JobOrderPartUsed } from "./jobOrderApi";

// ROLE

export type RoleType = "system" | "staffs" | "customers";

export interface Role {
  id: number;
  name: string;
  role_type: RoleType;
  description?: string | null;
}

// STATUS

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
  year_model?: number;
  color?: string;
  brand?: VehicleBrand;
  model?: VehicleModel;
  variant?: VehicleVariant;
  specs?: { plate_number?: string } | null;
  images?: { id?: number; image_path: string }[];
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

// STAFF

export interface Staff {
  id: number;
  user_id?: number;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  suffix?: string | null;
  address?: string;
  mobile_number?: string;
  hire_date?: string;
  work_start_hour?: string;
  work_end_hour?: string;
  status?: "active" | "inactive" | "resigned" | "terminated";
  user?: User;
}

// JOB ORDER

export interface JobOrder {
  id: number;
  request_service_id: number;
  assigned_staff_id: number;
  job_order_no: string;
  start_job?: string | null;
  finish_job?: string | null;
  description: string;
  labor_cost: number;
  status: "pending" | "assigned" | "in_progress" | "completed" | "cancelled";
  assignedStaff?: Staff;
}

export type CustomerJobOrder = FullJobOrder & {
  assigned_staff?: { id: number; first_name?: string; last_name?: string } | null;
  parts_used?: JobOrderPartUsed[];
};

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
  updated_at?: string;
  service_type?: RequestServiceType;
  urgency?: RequestUrgency;
  symptoms?: string[] | null;
  problem_started?: string | null;
  mileage?: number | null;
  preferred_time?: "morning" | "afternoon" | "any" | null;
  contact_number?: string | null;
  photo_urls?: string[];

  // RELATIONSHIPS

  vehicle_release?: VehicleRelease;
  jobOrder?: JobOrder | null;
  job_order?: CustomerJobOrder | null;
}

// CREATE REQUEST SERVICE

export type RequestServiceType = "repair" | "maintenance" | "inspection" | "washing" | "detailing" | "other";

export type RequestUrgency = "low" | "normal" | "high" | "urgent";

export interface CreateRequestServiceData {
  vehicle_release_id: number;
  service_request_number: string;
  request_detail: string;
  photos: File[];
  request_date_pref: string;
  service_type?: RequestServiceType;
  urgency?: RequestUrgency;
  symptoms?: string[];
  problem_started?: string | null;
  mileage?: number | null;
  preferred_time?: "morning" | "afternoon" | "any" | null;
  contact_number?: string | null;
}

// UPDATE REQUEST SERVICE

export interface UpdateRequestServiceData {
  request_detail?: string;
  request_date_pref?: string;
  status?: RequestServiceStatus;
}

// API RESPONSES

interface RequestServiceListResponse {
  message: string;
  data: RequestService[];
}

interface RequestServiceResponse {
  message: string;
  data: RequestService;
}

interface MessageResponse {
  message: string;
}

// GET ALL REQUEST SERVICES
// GET /api/request-services

export const getRequestServices = async (): Promise<RequestService[]> => {
  const response =
    await api.get<RequestServiceListResponse>("/request-services");

  return response.data.data;
};

// GET ONE REQUEST SERVICE
// GET /api/request-services/{id}

export const getRequestService = async (
  id: number,
): Promise<RequestService> => {
  const response = await api.get<RequestServiceResponse>(
    `/request-services/${id}`,
  );

  return response.data.data;
};

// CREATE REQUEST SERVICE
// POST /api/request-services

export const createRequestService = async (
  data: CreateRequestServiceData,
): Promise<RequestService> => {
  const formData = new FormData();

  formData.append("vehicle_release_id", String(data.vehicle_release_id));

  formData.append("service_request_number", data.service_request_number);

  formData.append("request_detail", data.request_detail);

  data.photos.forEach((photo) => formData.append("photos[]", photo, photo.name));

  formData.append("request_date_pref", data.request_date_pref);

  if (data.service_type) formData.append("service_type", data.service_type);
  if (data.urgency) formData.append("urgency", data.urgency);
  (data.symptoms ?? []).forEach((symptom) => formData.append("symptoms[]", symptom));
  if (data.problem_started) formData.append("problem_started", data.problem_started);
  if (data.mileage != null) formData.append("mileage", String(data.mileage));
  if (data.preferred_time) formData.append("preferred_time", data.preferred_time);
  if (data.contact_number) formData.append("contact_number", data.contact_number);

  const response = await api.post<RequestServiceResponse>(
    "/request-services",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
};

// UPDATE REQUEST SERVICE
// PUT /api/request-services/{id}

export const updateRequestService = async (
  id: number,
  data: UpdateRequestServiceData,
): Promise<RequestService> => {
  const response = await api.put<RequestServiceResponse>(
    `/request-services/${id}`,
    data,
  );

  return response.data.data;
};

// DELETE REQUEST SERVICE
// DELETE /api/request-services/{id}

export const deleteRequestService = async (id: number): Promise<string> => {
  const response = await api.delete<MessageResponse>(`/request-services/${id}`);

  return response.data.message;
};
