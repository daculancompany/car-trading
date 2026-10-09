import api from "../api";

// Customer Interfaces

export interface CustomerRole {
  id: number;
  name: string;
  description?: string | null;
}

export interface CustomerUser {
  id: number;
  role_id: number;
  username: string;
  email: string;
  is_active: boolean;
  role: CustomerRole;
}

export interface Customer {
  id: number;
  user_id: number;

  first_name: string;
  middle_name?: string | null;
  last_name: string;
  address: string;
  suffix?: string | null;
  civil_status: "single" | "married" | "widowed" | "separated";
  employment_type: "employed" | "self_employed";
  mobile_number: string;
  facebook: string;
  image_url?: string | null;
  date_registered: string;

  is_active: boolean;

  // 0 = Active, 1 = Archived
  archived: number;

  created_at?: string;
  updated_at?: string;

  user: CustomerUser;
}

// Register Customer
// Public registration.
// Backend creates both the User account and Customer profile.

export interface RegisterCustomerData {
  // User account
  username: string;
  email: string;
  password: string;
  password_confirmation: string;

  // Customer information
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  address: string;
  civil_status: "single" | "married" | "widowed" | "separated";
  employment_type: "employed" | "self_employed";
  mobile_number: string;
  facebook: string;

  image?: File | null;
}

// Update Customer

export interface UpdateCustomerData {
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  address?: string;
  suffix?: string | null;
  civil_status?: "single" | "married" | "widowed" | "separated";
  employment_type?: "employed" | "self_employed";
  mobile_number?: string;
  facebook?: string;
  is_active?: boolean;

  // 0 = Active, 1 = Archived
  archived?: number;
}

// API Responses

interface CustomerResponse {
  message: string;
  data: Customer;
}

interface CustomerListResponse {
  message: string;
  data: Customer[];
}

// GET ALL CUSTOMERS
// Protected by Sanctum.

export const getCustomers = async (): Promise<Customer[]> => {
  const response = await api.get<CustomerListResponse>("/customers");

  return response.data.data;
};

// GET SINGLE CUSTOMER
// Protected by Sanctum.

export const getCustomer = async (id: number): Promise<Customer> => {
  const response = await api.get<CustomerResponse>(`/customers/${id}`);

  return response.data.data;
};

// REGISTER CUSTOMER
// Public endpoint - does NOT require Sanctum authentication.

export const registerCustomer = async (
  data: RegisterCustomerData,
): Promise<Customer> => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      formData.append(key, value, value.name);
    } else {
      formData.append(key, String(value));
    }
  });

  const response = await api.post<CustomerResponse>("/register", formData);

  return response.data.data;
};

// UPDATE CUSTOMER
// Protected by Sanctum.

export const updateCustomer = async (
  id: number,
  data: UpdateCustomerData,
): Promise<Customer> => {
  const response = await api.patch<CustomerResponse>(`/customers/${id}`, data);

  return response.data.data;
};

/**
 * ARCHIVE CUSTOMER
 * DELETE /api/customers/{id}
 *
 * Archives the customer and associated user account.
 */

export const archiveCustomer = async (id: number): Promise<void> => {
  await api.delete(`/customers/${id}`);
};

const photoFormData = (image: File | null): FormData => {
  const formData = new FormData();

  if (image) {
    formData.append("image", image, image.name);
  } else {
    formData.append("remove", "1");
  }

  return formData;
};

export const updateCustomerPhoto = async (
  id: number,
  image: File | null,
): Promise<Customer> => {
  const response = await api.post<CustomerResponse>(
    `/customers/${id}/photo`,
    photoFormData(image),
  );

  return response.data.data;
};

export const updateMyPhoto = async (image: File | null): Promise<Customer> => {
  const response = await api.post<CustomerResponse>(
    "/customer/photo",
    photoFormData(image),
  );

  return response.data.data;
};
