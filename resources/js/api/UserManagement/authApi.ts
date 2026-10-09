import api from "../api";

// Interfaces

export interface Role {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser {
  id: number;
  role_id: number;
  email: string;
  username: string;
  is_active: boolean;
  role: Role;
  customer?: {
    id: number;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    mobile_number?: string | null;
    address?: string | null;
    facebook?: string | null;
    date_registered?: string | null;
    image_url?: string | null;
  } | null;
  staff?: {
    id: number;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    mobile_number?: string | null;
    address?: string | null;
    hire_date?: string | null;
    work_start_hour?: string | null;
    work_end_hour?: string | null;
  } | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoginRequest {
  login: string;
  password: string;
  // Omit to let the server pick the portal from the account (single /login page).
  role?: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
  token: string;
}

export interface MeResponse {
  message: string;
  user: AuthUser;
}

export interface LogoutResponse {
  message: string;
}

// Login

export const login = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/login", credentials);

  return response.data;
};

// Get Authenticated User

export const getMe = async (): Promise<AuthUser> => {
  const response = await api.get<MeResponse>("/me");

  // Keep local user information updated
  localStorage.setItem("user", JSON.stringify(response.data.user));

  return response.data.user;
};

// Logout

export const logout = async (): Promise<string> => {
  const response = await api.post<LogoutResponse>("/logout");

  // Remove authentication information
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  return response.data.message;
};

export interface UpdateProfileData {
  username?: string;
  email?: string;
  first_name?: string;
  middle_name?: string | null;
  last_name?: string;
  mobile_number?: string | null;
  address?: string | null;
  facebook?: string | null;
}

export const updateProfile = async (data: UpdateProfileData): Promise<AuthUser> => {
  const response = await api.patch<MeResponse>("/me", data);
  localStorage.setItem("user", JSON.stringify(response.data.user));
  window.dispatchEvent(new Event("auth-user-updated"));
  return response.data.user;
};

export const changePassword = async (data: { current_password: string; password: string; password_confirmation: string }): Promise<string> => {
  const response = await api.post<{ message: string }>("/me/password", data);
  return response.data.message;
};
