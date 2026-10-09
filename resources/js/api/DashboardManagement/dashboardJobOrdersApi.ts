import api from "../api";

// Interfaces

export interface DashboardJobOrder {
  job_order_id: number;
  job_no: string;
  customer: string;
  vehicle: string;
  service: string;
  assigned_to: string;
  status: "Pending" | "Ongoing" | "Completed" | "Cancelled" | string;
  created_at: string;
}

export interface DashboardJobOrdersResponse {
  message: string;
  data: DashboardJobOrder[];
}

// API

export const getDashboardJobOrders = async (): Promise<DashboardJobOrder[]> => {
  const response = await api.get<DashboardJobOrdersResponse>(
    "/dashboard/job-orders",
  );

  return response.data.data;
};
