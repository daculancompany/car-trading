import api from "../api";

// Role Types

export type RoleType = "system" | "staffs" | "customers";

// Interfaces

export interface Role {
  id: number;
  name: string;
  role_type: RoleType;
  description: string | null;
  users_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Request Interfaces

export interface CreateRoleData {
  name: string;
  role_type: RoleType;
  description?: string | null;
}

export interface UpdateRoleData {
  name?: string;
  role_type?: RoleType;
  description?: string | null;
}

// API Response Interfaces

export interface RoleResponse {
  message: string;
  data: Role;
}

export interface RolesResponse {
  message: string;
  data: Role[];
}

// GET ALL ROLES
// GET /api/roles

export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get<RolesResponse>("/roles");

  return response.data.data;
};

// GET SINGLE ROLE
// GET /api/roles/{id}

export const getRole = async (id: number): Promise<Role> => {
  const response = await api.get<RoleResponse>(`/roles/${id}`);

  return response.data.data;
};

// CREATE ROLE
// POST /api/roles

export const createRole = async (data: CreateRoleData): Promise<Role> => {
  const response = await api.post<RoleResponse>("/roles", data);

  return response.data.data;
};

// UPDATE ROLE
// PATCH /api/roles/{id}

export const updateRole = async (
  id: number,
  data: UpdateRoleData,
): Promise<Role> => {
  const response = await api.patch<RoleResponse>(`/roles/${id}`, data);

  return response.data.data;
};

// DELETE ROLE
// DELETE /api/roles/{id}

export const deleteRole = async (id: number): Promise<string> => {
  const response = await api.delete<{ message: string }>(`/roles/${id}`);

  return response.data.message;
};
