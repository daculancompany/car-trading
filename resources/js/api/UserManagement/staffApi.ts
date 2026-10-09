import api from "../api";

/**
 * STAFF ROLE INTERFACES
 */

export type StaffRoleType = "system" | "staffs" | "customers";

export interface StaffRole {
  id: number;
  name: string;
  role_type: StaffRoleType;
  description?: string | null;
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * STAFF USER
 */

export interface StaffUser {
  id: number;
  role_id: number;
  username: string;
  email: string;
  is_active: boolean;
  archived: boolean;
  role: StaffRole;
  created_at?: string;
  updated_at?: string;
}

/**
 * STAFF
 */

export type StaffStatus = "active" | "inactive" | "resigned" | "terminated";

export interface Staff {
  id: number;
  user_id: number;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  address: string;
  mobile_number: string;
  hire_date: string;
  work_start_hour: string;
  work_end_hour: string;
  status: StaffStatus;
  archived: boolean;
  created_at?: string;
  updated_at?: string;
  user: StaffUser;
}

/**
 * CREATE STAFF
 */

export interface CreateStaffData {
  /**
   * User Account
   */
  username: string;
  email: string;
  password: string;
  password_confirmation: string;

  /**
   * Staff Role
   */
  role_id: number;

  /**
   * Staff Information
   */
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  address: string;
  mobile_number: string;
  hire_date: string;
  work_start_hour: string;
  work_end_hour: string;
}

/**
 * UPDATE STAFF
 */

export interface UpdateStaffData {
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  suffix?: string | null;
  address?: string;
  mobile_number?: string;
  hire_date?: string;
  work_start_hour?: string;
  work_end_hour?: string;
  status?: StaffStatus;
}

/**
 * API RESPONSES
 */

export interface StaffResponse {
  message: string;
  data: Staff;
}

export interface StaffListResponse {
  message: string;
  data: Staff[];
}

/**
 * GET ALL STAFF
 *
 * GET /api/staffs
 */

export const getStaffs = async (): Promise<Staff[]> => {
  const response = await api.get<StaffListResponse>("/staffs");

  return response.data.data;
};

/**
 * GET SINGLE STAFF
 *
 * GET /api/staffs/{id}
 */

export const getStaff = async (id: number): Promise<Staff> => {
  const response = await api.get<StaffResponse>(`/staffs/${id}`);

  return response.data.data;
};

/**
 * CREATE STAFF
 *
 * POST /api/staffs
 */

export const createStaff = async (data: CreateStaffData): Promise<Staff> => {
  const response = await api.post<StaffResponse>("/staffs", data);

  return response.data.data;
};

/**
 * UPDATE STAFF
 *
 * PATCH /api/staffs/{id}
 */

export const updateStaff = async (
  id: number,
  data: UpdateStaffData,
): Promise<Staff> => {
  const response = await api.patch<StaffResponse>(`/staffs/${id}`, data);

  return response.data.data;
};

/**
 * ARCHIVE STAFF
 *
 * DELETE /api/staffs/{id}
 *
 * The backend archives:
 * - Staff profile
 * - Associated user account
 */

export const archiveStaff = async (id: number): Promise<string> => {
  const response = await api.delete<{
    message: string;
  }>(`/staffs/${id}`);

  return response.data.message;
};
