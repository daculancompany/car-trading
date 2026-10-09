import api from "../api";

// Interfaces

export interface FinancingRequirementGroup {
  id: number;
  group_name: string;
  group_code: string;
  description: string | null;
  is_active: boolean;
}

export interface FinancingRequirement {
  id: number;
  group_id: number;
  requirement_name: string;
  description: string | null;
  is_active: boolean;

  group?: FinancingRequirementGroup;

  financing_documents_count?: number;

  created_at?: string;
  updated_at?: string;
}

// Request Interfaces

export interface CreateFinancingRequirementData {
  group_id: number;
  requirement_name: string;
  description?: string | null;
  is_active?: boolean;
}

export interface UpdateFinancingRequirementData {
  group_id?: number;
  requirement_name?: string;
  description?: string | null;
  is_active?: boolean;
}

// API Response Interfaces

interface FinancingRequirementListResponse {
  message: string;
  data: FinancingRequirement[];
}

interface FinancingRequirementResponse {
  message: string;
  data: FinancingRequirement;
}

interface DeleteFinancingRequirementResponse {
  message: string;
}

// GET ALL
// GET /api/financing-requirements

export const getFinancingRequirements = async (): Promise<
  FinancingRequirement[]
> => {
  const response = await api.get<FinancingRequirementListResponse>(
    "/financing-requirements",
  );

  return response.data.data;
};

// GET ONE
// GET /api/financing-requirements/{id}

export const getFinancingRequirement = async (
  id: number,
): Promise<FinancingRequirement> => {
  const response = await api.get<FinancingRequirementResponse>(
    `/financing-requirements/${id}`,
  );

  return response.data.data;
};

// CREATE
// POST /api/financing-requirements

export const createFinancingRequirement = async (
  data: CreateFinancingRequirementData,
): Promise<FinancingRequirement> => {
  const response = await api.post<FinancingRequirementResponse>(
    "/financing-requirements",
    data,
  );

  return response.data.data;
};

// UPDATE
// PUT /api/financing-requirements/{id}

export const updateFinancingRequirement = async (
  id: number,
  data: UpdateFinancingRequirementData,
): Promise<FinancingRequirement> => {
  const response = await api.put<FinancingRequirementResponse>(
    `/financing-requirements/${id}`,
    data,
  );

  return response.data.data;
};

// DELETE
// DELETE /api/financing-requirements/{id}

export const deleteFinancingRequirement = async (
  id: number,
): Promise<string> => {
  const response = await api.delete<DeleteFinancingRequirementResponse>(
    `/financing-requirements/${id}`,
  );

  return response.data.message;
};

// GET ACTIVE REQUIREMENTS
// GET /api/financing-requirements-active

export const getActiveFinancingRequirements = async (): Promise<
  FinancingRequirement[]
> => {
  const response = await api.get<FinancingRequirementListResponse>(
    "/financing-requirements-active",
  );

  return response.data.data;
};

// GET GROUPED REQUIREMENTS
// GET /api/financing-requirements-grouped

export const getGroupedFinancingRequirements = async (): Promise<
  FinancingRequirement[][]
> => {
  const response = await api.get<{
    message: string;
    data: FinancingRequirement[][];
  }>("/financing-requirements-grouped");

  return response.data.data;
};
